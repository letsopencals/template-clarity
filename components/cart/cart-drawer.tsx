'use client';

import { useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { AnimatePresence, motion, type Transition } from 'framer-motion';
import { useCart } from '@/contexts/cart-context';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { DURATION, EASE_OUT, SPRING_SOFT } from '@/components/motion/easing';
import { buttonClasses } from '@/components/ui/button';
import { useModalOverlay, useMounted } from '@/components/ui/use-overlay';
import { siteConfig } from '@/lib/site-config';
import { AppointmentCard } from './appointment-card';
import { CartTotals } from './cart-totals';
import { EmptyCard } from './empty-card';
import { HoldBar } from './hold-bar';
import { PromoCode } from './promo-code';
import { useCartLines } from './cart-line';

interface CartDrawerProps {
	open: boolean;
	onClose: () => void;
}

const OVERLAY_INITIAL = { opacity: 0 };
const OVERLAY_ANIMATE = { opacity: 1 };
const OVERLAY_TRANSITION: Transition = { duration: DURATION.fast };
const PANEL_INITIAL = { x: '100%' };
const PANEL_ANIMATE = { x: 0 };
const PANEL_TRANSITION: Transition = SPRING_SOFT;
const FADE_TRANSITION: Transition = { duration: 0.2 };
const CARD_INITIAL = { opacity: 0, y: 24 };
const CARD_ANIMATE = { opacity: 1, y: 0 };
const CARD_EXIT = { opacity: 0, x: 40, transition: { duration: 0.3, ease: EASE_OUT } };

function cardTransition(i: number): Transition {
	return { duration: DURATION.base, ease: EASE_OUT, delay: 0.12 + i * 0.07 };
}

/**
 * "Your visits" — the right-hand drawer: the appointment cards the composer
 * filled in, the hold countdown with Extend, a promo code and the total.
 * Portalled to <body> so no transformed ancestor can trap it.
 */
export function CartDrawer({ open, onClose }: CartDrawerProps) {
	const mounted = useMounted();
	if (!mounted) return null;
	return createPortal(<CartDrawerPanel open={open} onClose={onClose} />, document.body);
}

function CartDrawerPanel({ open, onClose }: CartDrawerProps) {
	const panelRef = useRef<HTMLDivElement>(null);
	const titleId = useId();
	const reduce = useReducedMotion();
	const { cart, removeItem, updateAddOnQuantity, removeAddOnItem, timeRemaining, extendCart } = useCart();
	const lines = useCartLines(cart);

	useModalOverlay(open, onClose, panelRef);

	const count = lines.length;
	const isExpired = timeRemaining !== null && timeRemaining <= 0;

	return (
		<AnimatePresence>
			{open ? (
				<div className="fixed inset-0 z-[60]" key="cart-drawer">
					<motion.div
						aria-hidden
						className="absolute inset-0 bg-steel-night/45"
						initial={OVERLAY_INITIAL}
						animate={OVERLAY_ANIMATE}
						exit={OVERLAY_INITIAL}
						transition={OVERLAY_TRANSITION}
						onClick={onClose}
					/>

					<motion.div
						ref={panelRef}
						role="dialog"
						aria-modal="true"
						aria-labelledby={titleId}
						tabIndex={-1}
						initial={reduce ? OVERLAY_INITIAL : PANEL_INITIAL}
						animate={reduce ? OVERLAY_ANIMATE : PANEL_ANIMATE}
						exit={reduce ? OVERLAY_INITIAL : PANEL_INITIAL}
						transition={reduce ? FADE_TRANSITION : PANEL_TRANSITION}
						className="absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col bg-paper text-ink shadow-float outline-none sm:rounded-l-[28px]"
					>
						<header className="flex items-start justify-between gap-4 border-b border-line px-5 pt-6 pb-5 sm:px-7">
							<div className="min-w-0">
								<p className="eyebrow text-ink-muted">
									Held for you <span className="tabular text-brass">· {String(count).padStart(2, '0')}</span>
								</p>
								<h2 id={titleId} className="display-sm mt-2 text-ink">
									Your <em>visits</em>
								</h2>
							</div>
							<button
								type="button"
								onClick={onClose}
								aria-label="Close your visits"
								className="-mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-cream hover:text-steel focus-visible:outline-2 focus-visible:outline-steel"
							>
								<svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden>
									<path d="M3 3l10 10M13 3L3 13" />
								</svg>
							</button>
						</header>

						{count > 0 && timeRemaining !== null ? (
							<div className="border-b border-line bg-card/70 px-5 py-3.5 sm:px-7">
								<HoldBar timeRemaining={timeRemaining} expiresAt={cart?.expiresAt} onExtend={extendCart} onNavigate={onClose} />
							</div>
						) : null}

						<div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7">
							{count === 0 ? (
								<EmptyCard onNavigate={onClose} />
							) : (
								<ul className="space-y-4">
									<AnimatePresence initial={!reduce}>
										{lines.map((line, i) => (
											<motion.li
												key={line.id}
												layout={!reduce}
												initial={reduce ? false : CARD_INITIAL}
												animate={CARD_ANIMATE}
												exit={reduce ? undefined : CARD_EXIT}
												transition={cardTransition(i)}
											>
												<AppointmentCard
													line={line}
													index={i}
													currency={cart?.paymentCurrencyCode}
													editable
													compact
													onRemove={removeItem}
													onAddOnQuantity={updateAddOnQuantity}
													onAddOnRemove={removeAddOnItem}
												/>
											</motion.li>
										))}
									</AnimatePresence>
								</ul>
							)}
						</div>

						{count > 0 && cart ? (
							<footer className="border-t border-line bg-card px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-bl-[28px] sm:px-7">
								<PromoCode />
								<CartTotals cart={cart} className="mt-5" />
								{isExpired ? (
									<Link href="/care" onClick={onClose} className={buttonClasses({ variant: 'primary', size: 'lg', fullWidth: true, className: 'mt-5' })}>
										Find a new time
									</Link>
								) : (
									<Link href="/checkout" onClick={onClose} className={buttonClasses({ variant: 'primary', size: 'lg', fullWidth: true, className: 'mt-5' })}>
										Continue to checkout
										<span aria-hidden className="transition-transform duration-500 group-hover/btn:translate-x-1">
											→
										</span>
									</Link>
								)}
								<div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs">
									<Link href="/care" onClick={onClose} className="link-underline text-ink-muted hover:text-ink">
										Book another visit
									</Link>
									<p className="text-ink-dim">{siteConfig.emergency.short}</p>
								</div>
							</footer>
						) : null}
					</motion.div>
				</div>
			) : null}
		</AnimatePresence>
	);
}
