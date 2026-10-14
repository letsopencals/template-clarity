'use client';

import { forwardRef, type ReactNode } from 'react';
import { AnimatePresence, motion, type Transition } from 'framer-motion';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { EASE_EXPO } from '@/components/motion/easing';

export type SectionState = 'locked' | 'open' | 'done';

interface BookSectionProps {
	id: string;
	/** 1-based, shown as "01". */
	index: number;
	title: ReactNode;
	state: SectionState;
	/** Recap shown when done (and the section is folded). */
	summary?: ReactNode;
	/** Shown under the title while locked. */
	lockedHint?: string;
	onEdit?: () => void;
	children: ReactNode;
}

const BODY_INITIAL = { height: 0, opacity: 0 } as const;
const BODY_ANIMATE = { height: 'auto', opacity: 1 } as const;
const BODY_EXIT = { height: 0, opacity: 0 } as const;
const BODY_T: Transition = { duration: 0.6, ease: EASE_EXPO };
const INSTANT: Transition = { duration: 0 };

function StateMark({ state, index }: { state: SectionState; index: number }) {
	return (
		<span
			aria-hidden
			className={clsx(
				'tabular flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[12px] transition-colors duration-500',
				state === 'done' && 'border-sage bg-sage-soft text-sage-deep',
				state === 'open' && 'border-steel bg-steel text-white',
				state === 'locked' && 'border-line text-ink-dim',
			)}
		>
			{state === 'done' ? (
				<svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
					<path d="M3.5 8.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			) : (
				String(index).padStart(2, '0')
			)}
		</span>
	);
}

/**
 * One numbered composer section: locked → open → done. Locked sections are
 * `inert` (not focusable); done sections fold to a recap line with "Edit".
 */
export const BookSection = forwardRef<HTMLElement, BookSectionProps>(function BookSection(
	{ id, index, title, state, summary, lockedHint, onEdit, children },
	ref,
) {
	const reduce = useReducedMotion();
	const headingId = `${id}-title`;
	return (
		<section
			ref={ref}
			id={id}
			aria-labelledby={headingId}
			inert={state === 'locked' ? true : undefined}
			className={clsx('scroll-mt-28 border-t border-line py-7 first:border-t-0 sm:py-8', state === 'locked' && 'opacity-55')}
		>
			<div className="flex items-start gap-4">
				<StateMark state={state} index={index} />
				<div className="min-w-0 flex-1">
					<div className="flex items-baseline justify-between gap-4">
						<h2 id={headingId} className="display-xs text-ink">
							{title}
						</h2>
						{state === 'done' && onEdit ? (
							<button
								type="button"
								onClick={onEdit}
								className="link-underline shrink-0 text-[13px] font-semibold text-steel"
								aria-label={`Edit: ${typeof title === 'string' ? title : `step ${index}`}`}
							>
								Edit
							</button>
						) : null}
					</div>
					{state === 'done' && summary ? <p className="mt-1 text-[15px] text-ink-muted">{summary}</p> : null}
					{state === 'locked' && lockedHint ? <p className="mt-1 text-[14px] text-ink-dim">{lockedHint}</p> : null}
				</div>
			</div>
			<AnimatePresence initial={false}>
				{state === 'open' ? (
					<motion.div
						key="body"
						initial={BODY_INITIAL}
						animate={BODY_ANIMATE}
						exit={BODY_EXIT}
						transition={reduce ? INSTANT : BODY_T}
						className="overflow-hidden"
					>
						<div className="pt-6 sm:pl-13">{children}</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</section>
	);
});
