'use client';

import { useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, type Transition } from 'framer-motion';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { EASE_EXPO } from '@/components/motion/easing';
import { useModalOverlay, useMounted } from '@/components/ui/use-overlay';

export interface SheetProps {
	open: boolean;
	onClose(): void;
	/** Visible title (also the accessible name). */
	title?: ReactNode;
	'aria-label'?: string;
	/** Sticky footer (e.g. the Reserve button). */
	footer?: ReactNode;
	className?: string;
	initialFocus?: string;
	children: ReactNode;
}

const SCRIM = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } as const;
const PANEL_OFF = { y: '100%' } as const;
const PANEL_ON = { y: 0 } as const;
const FADE_OFF = { opacity: 0 } as const;
const FADE_ON = { opacity: 1 } as const;
const TRANSITION: Transition = { duration: 0.55, ease: EASE_EXPO };
const SCRIM_TRANSITION: Transition = { duration: 0.3 };

/**
 * Mobile bottom sheet (appointment card, filters on phones). Portalled;
 * scrim z-65, panel z-66 (DESIGN.md §6). Scroll-locks the page and Lenis, and
 * the body scrolls natively (`data-lenis-prevent`).
 */
export function Sheet({ open, onClose, title, 'aria-label': ariaLabel, footer, className, initialFocus, children }: SheetProps) {
	const mounted = useMounted();
	const reduce = useReducedMotion();
	const panelRef = useRef<HTMLDivElement>(null);
	useModalOverlay(open, onClose, panelRef, initialFocus);
	if (!mounted) return null;

	return createPortal(
		<AnimatePresence>
			{open ? (
				<>
					<motion.div
						key="scrim"
						aria-hidden
						className="fixed inset-0 z-[65] bg-steel-night/45"
						{...SCRIM}
						transition={SCRIM_TRANSITION}
						onClick={onClose}
					/>
					<motion.div
						key="panel"
						ref={panelRef}
						role="dialog"
						aria-modal="true"
						aria-label={typeof title === 'string' ? title : ariaLabel}
						tabIndex={-1}
						initial={reduce ? FADE_OFF : PANEL_OFF}
						animate={reduce ? FADE_ON : PANEL_ON}
						exit={reduce ? FADE_OFF : PANEL_OFF}
						transition={reduce ? SCRIM_TRANSITION : TRANSITION}
						className={clsx(
							'fixed inset-x-0 bottom-0 z-[66] flex max-h-[92svh] flex-col rounded-t-[28px] bg-paper text-ink shadow-[0_-24px_60px_-24px_rgba(24,47,62,0.35)] outline-none',
							className,
						)}
					>
						<div className="flex items-center justify-between gap-4 px-5 pb-2 pt-3">
							<span aria-hidden className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-cream-deep" />
							{title ? <h2 className="display-sm pt-4">{title}</h2> : <span />}
							<button
								type="button"
								onClick={onClose}
								aria-label="Close"
								className="mt-3 flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-cream hover:text-ink"
							>
								<svg aria-hidden viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
									<path d="M2 2l10 10M12 2 2 12" />
								</svg>
							</button>
						</div>
						<div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6">
							{children}
						</div>
						{footer ? <div className="border-t border-line px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">{footer}</div> : null}
					</motion.div>
				</>
			) : null}
		</AnimatePresence>,
		document.body,
	);
}
