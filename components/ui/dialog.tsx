'use client';

import { useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, type Transition } from 'framer-motion';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { EASE_EXPO } from '@/components/motion/easing';
import { useModalOverlay, useMounted } from '@/components/ui/use-overlay';

export interface DialogProps {
	open: boolean;
	onClose(): void;
	title?: ReactNode;
	/** Short line under the title. */
	description?: ReactNode;
	'aria-label'?: string;
	/** Action row at the bottom (buttons). */
	footer?: ReactNode;
	size?: 'sm' | 'md' | 'lg';
	className?: string;
	initialFocus?: string;
	children?: ReactNode;
}

const OFF = { opacity: 0, y: 16, scale: 0.98 } as const;
const ON = { opacity: 1, y: 0, scale: 1 } as const;
const FADE_OFF = { opacity: 0 } as const;
const FADE_ON = { opacity: 1 } as const;
const TRANSITION: Transition = { duration: 0.5, ease: EASE_EXPO };
const FAST: Transition = { duration: 0.2 };
const SIZES = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' } as const;

/**
 * Centred modal on paper (cancel visit, policy details). Portalled at the sheet
 * layer (scrim 65, panel 66). Escape and scrim click close it; focus is trapped.
 */
export function Dialog({ open, onClose, title, description, 'aria-label': ariaLabel, footer, size = 'md', className, initialFocus, children }: DialogProps) {
	const mounted = useMounted();
	const reduce = useReducedMotion();
	const panelRef = useRef<HTMLDivElement>(null);
	useModalOverlay(open, onClose, panelRef, initialFocus);
	if (!mounted) return null;

	return createPortal(
		<AnimatePresence>
			{open ? (
				<motion.div
					key="dialog"
					className="fixed inset-0 z-[65] flex items-end justify-center bg-steel-night/45 p-3 sm:items-center sm:p-6"
					initial={FADE_OFF}
					animate={FADE_ON}
					exit={FADE_OFF}
					transition={FAST}
					onMouseDown={(e) => {
						if (e.target === e.currentTarget) onClose();
					}}
				>
					<motion.div
						ref={panelRef}
						role="dialog"
						aria-modal="true"
						aria-label={typeof title === 'string' ? title : ariaLabel}
						tabIndex={-1}
						data-lenis-prevent
						initial={reduce ? FADE_OFF : OFF}
						animate={reduce ? FADE_ON : ON}
						exit={reduce ? FADE_OFF : OFF}
						transition={reduce ? FAST : TRANSITION}
						className={clsx(
							'relative z-[66] max-h-[90svh] w-full overflow-y-auto rounded-[24px] bg-paper p-6 text-ink shadow-[0_24px_60px_-24px_rgba(24,47,62,0.35)] outline-none sm:p-8',
							SIZES[size],
							className,
						)}
					>
						<button
							type="button"
							onClick={onClose}
							aria-label="Close"
							className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-cream hover:text-ink"
						>
							<svg aria-hidden viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
								<path d="M2 2l10 10M12 2 2 12" />
							</svg>
						</button>
						{title ? <h2 className="display-sm pr-10">{title}</h2> : null}
						{description ? <p className="mt-2 text-ink-muted">{description}</p> : null}
						{children ? <div className={clsx(title || description ? 'mt-6' : '')}>{children}</div> : null}
						{footer ? <div className="mt-8 flex flex-wrap items-center justify-end gap-3">{footer}</div> : null}
					</motion.div>
				</motion.div>
			) : null}
		</AnimatePresence>,
		document.body,
	);
}
