'use client';

import { useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { AnimatePresence, motion, type Transition } from 'framer-motion';
import { clsx } from 'clsx';
import { useModalOverlay, useMounted } from '@/components/ui/use-overlay';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { DURATION, EASE_EXPO, EASE_OUT } from '@/components/motion/easing';
import { CareLine } from '@/components/motifs/care-line';
import { buttonClasses } from '@/components/ui/button';
import { siteConfig } from '@/lib/site-config';
import { FIND_CARE, MY_CARE, NAV_LINKS, isActive } from './nav-links';

const SHEET_FROM = { clipPath: 'inset(0% 0% 100% 0%)' } as const;
const SHEET_TO = { clipPath: 'inset(0% 0% 0% 0%)' } as const;
const SHEET_T: Transition = { duration: DURATION.base, ease: EASE_EXPO };
const FADE_FROM = { opacity: 0 } as const;
const FADE_TO = { opacity: 1 } as const;
const FADE_T: Transition = { duration: 0.2 };
const ITEM_FROM = { opacity: 0, y: 24 } as const;
const ITEM_TO = { opacity: 1, y: 0 } as const;

const LINKS = [{ href: '/', label: 'Home' }, ...NAV_LINKS, { href: '/services', label: 'Visits & fees' }, { href: '/about', label: 'About' }];

export interface MobileMenuProps {
	open: boolean;
	onClose: () => void;
	pathname: string;
	signedIn: boolean;
}

/** Full-screen menu sheet, portalled out of the page transition. */
export function MobileMenu({ open, onClose, pathname, signedIn }: MobileMenuProps) {
	const mounted = useMounted();
	const panelRef = useRef<HTMLDivElement>(null);
	const reduce = useReducedMotion();
	useModalOverlay(open, onClose, panelRef);
	if (!mounted) return null;

	return createPortal(
		<AnimatePresence>
			{open ? (
				<motion.div
					key="menu"
					ref={panelRef}
					role="dialog"
					aria-modal="true"
					aria-label="Menu"
					tabIndex={-1}
					data-lenis-prevent
					className="grain fixed inset-0 z-[65] flex flex-col overflow-y-auto bg-paper outline-none lg:hidden"
					initial={reduce ? FADE_FROM : SHEET_FROM}
					animate={reduce ? FADE_TO : SHEET_TO}
					exit={reduce ? FADE_FROM : SHEET_FROM}
					transition={reduce ? FADE_T : SHEET_T}
				>
					<div className="container-x relative z-10 flex h-[4.5rem] items-center justify-between">
						<span className="eyebrow text-oak">Menu</span>
						<button
							type="button"
							onClick={onClose}
							aria-label="Close menu"
							className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong text-ink transition-colors hover:border-steel hover:text-steel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel/40"
						>
							<svg aria-hidden className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
								<path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
							</svg>
						</button>
					</div>

					<nav className="container-x relative z-10 flex flex-1 flex-col pt-4" aria-label="Main">
						<ul className="flex flex-col">
							{LINKS.map((link, i) => (
								<motion.li
									key={link.href}
									initial={reduce ? false : ITEM_FROM}
									animate={ITEM_TO}
									transition={{ duration: DURATION.base, ease: EASE_OUT, delay: reduce ? 0 : 0.12 + i * 0.04 }}
									className="border-b border-line"
								>
									<Link
										href={link.href}
										onClick={onClose}
										aria-current={isActive(pathname, link.href) ? 'page' : undefined}
										className={clsx(
											'flex items-baseline justify-between py-4 font-display text-[2rem] leading-none tracking-tight transition-colors',
											isActive(pathname, link.href) ? 'italic text-steel' : 'text-ink hover:text-steel',
										)}
									>
										{link.label}
										<span className="tabular text-xs text-ink-dim">{String(i + 1).padStart(2, '0')}</span>
									</Link>
								</motion.li>
							))}
						</ul>

						<div className="mt-8 flex flex-col gap-3">
							<Link href={FIND_CARE.href} onClick={onClose} className={buttonClasses({ variant: 'primary', size: 'lg', fullWidth: true })}>
								{FIND_CARE.label}
							</Link>
							<Link href={MY_CARE.href} onClick={onClose} className={buttonClasses({ variant: 'outline', size: 'lg', fullWidth: true })}>
								{signedIn ? MY_CARE.label : `${MY_CARE.label} · Sign in`}
							</Link>
						</div>

						<div className="mt-auto pb-8 pt-10">
							<CareLine settled trigger="mount" tone="brass" className="mb-6 h-8 w-full" />
							<p className="text-sm text-ink-muted">
								<a href={siteConfig.contact.phoneHref} className="tabular text-ink hover:text-steel">
									{siteConfig.contact.phone}
								</a>
							</p>
							<p className="mt-2 text-sm text-clay">{siteConfig.emergency.short}</p>
						</div>
					</nav>
				</motion.div>
			) : null}
		</AnimatePresence>,
		document.body,
	);
}
