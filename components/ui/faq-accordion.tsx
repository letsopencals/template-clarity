'use client';

import { useId, useState } from 'react';
import { AnimatePresence, motion, type Transition } from 'framer-motion';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { EASE_OUT } from '@/components/motion/easing';

export interface FaqItem {
	q: string;
	a: string;
}

const CLOSED = { height: 0, opacity: 0 } as const;
const OPENED = { height: 'auto', opacity: 1 } as const;
const T: Transition = { duration: 0.35, ease: EASE_OUT };
const T_NONE: Transition = { duration: 0 };

/**
 * Questions as a ruled list — hairlines between rows, Fraunces question, the
 * plus turning to a cross in steel when open. First item open by default.
 */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
	const [openIndex, setOpenIndex] = useState<number | null>(0);
	const reduce = useReducedMotion();
	const id = useId();

	return (
		<div className="border-t border-line">
			{items.map((item, i) => {
				const isOpen = openIndex === i;
				const panelId = `${id}-faq-${i}`;
				return (
					<div key={item.q} className="border-b border-line">
						<button
							type="button"
							onClick={() => setOpenIndex(isOpen ? null : i)}
							aria-expanded={isOpen}
							aria-controls={panelId}
							className="group flex w-full items-start justify-between gap-6 py-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel/40 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
						>
							<span className="flex gap-5">
								<span className="tabular mt-1 text-xs text-ink-dim">{String(i + 1).padStart(2, '0')}</span>
								<span className={clsx('font-display text-xl leading-snug transition-colors md:text-[22px]', isOpen ? 'text-steel-deep' : 'text-ink group-hover:text-steel')}>
									{item.q}
								</span>
							</span>
							<span
								aria-hidden
								className={clsx(
									'mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300',
									isOpen ? 'rotate-45 border-steel bg-steel text-paper' : 'border-line-strong text-steel group-hover:border-steel',
								)}
							>
								<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
								</svg>
							</span>
						</button>
						<AnimatePresence initial={false}>
							{isOpen ? (
								<motion.div
									id={panelId}
									initial={CLOSED}
									animate={OPENED}
									exit={CLOSED}
									transition={reduce ? T_NONE : T}
									className="overflow-hidden"
								>
									<p className="max-w-[62ch] pb-7 pl-10 text-[15px] leading-relaxed text-ink-muted">{item.a}</p>
								</motion.div>
							) : null}
						</AnimatePresence>
					</div>
				);
			})}
		</div>
	);
}
