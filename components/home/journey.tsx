'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform, type Transition } from 'framer-motion';
import { clsx } from 'clsx';
import { SectionHeader } from '@/components/ui/section-header';
import { Reveal } from '@/components/motion/reveal';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { DURATION, EASE_OUT } from '@/components/motion/easing';
import { siteConfig } from '@/lib/site-config';
import { JOURNEY_MINIS, NoteMini, PassMini, RecordMini, SlotMini } from './journey-minis';

const { journey } = siteConfig;
const STEPS = journey.steps;

const STAGE_FROM = { opacity: 0, y: 40, rotate: -1.5 } as const;
const STAGE_TO = { opacity: 1, y: 0, rotate: 0 } as const;
const STAGE_EXIT = { opacity: 0, y: -30, rotate: 1 } as const;
const STAGE_T: Transition = { duration: DURATION.base, ease: EASE_OUT };

function Title() {
	return (
		<SectionHeader
			eyebrow={`03 · ${journey.eyebrow}`}
			title={
				<>
					{journey.title} <em>{journey.accent}</em>
				</>
			}
		/>
	);
}

/** Desktop: a pinned story. Scrolling moves through the four steps; the stationery on the right changes with them. */
function JourneyPinned() {
	const ref = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
	const [step, setStep] = useState(0);
	useMotionValueEvent(scrollYProgress, 'change', (v) => {
		const next = Math.min(STEPS.length - 1, Math.max(0, Math.floor(v * STEPS.length)));
		setStep((s) => (s === next ? s : next));
	});
	const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
	const Mini = JOURNEY_MINIS[step]!;

	return (
		<div ref={ref} className="relative hidden lg:block" style={{ height: `${STEPS.length * 85 + 40}vh` }}>
			<div className="sticky top-0 flex h-screen flex-col justify-center pt-16">
				<div className="container-x">
					<Title />
					<div className="mt-14 grid grid-cols-12 items-center gap-10">
						<ol className="relative col-span-5 flex flex-col">
							<span aria-hidden className="absolute bottom-0 left-0 top-0 w-px bg-line" />
							<motion.span aria-hidden className="absolute left-0 top-0 w-px origin-top bg-steel" style={{ height: bar }} />
							{STEPS.map((s, i) => (
								<li key={s.n} className="relative py-5 pl-8">
									<p className={clsx('tabular text-xs transition-colors duration-500', i === step ? 'text-steel' : 'text-ink-dim')}>{s.n}</p>
									<h3 className={clsx('mt-1 font-display text-[1.9rem] leading-tight tracking-tight transition-colors duration-500', i === step ? 'text-ink' : 'text-ink/30')}>
										{i === step ? <em className="italic text-steel">{s.title}</em> : s.title}
									</h3>
									<div className={clsx('grid transition-[grid-template-rows,opacity] duration-500', i === step ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
										<p className="overflow-hidden text-[15px] leading-relaxed text-ink-muted">
											<span className="block max-w-[40ch] pt-2">{s.body}</span>
										</p>
									</div>
								</li>
							))}
						</ol>
						<div className="relative col-span-7 flex min-h-[28rem] items-center justify-center rounded-window bg-cream p-10">
							<span aria-hidden className="absolute inset-4 rounded-[calc(var(--radius-window)-1rem)] border border-brass-soft" />
							<AnimatePresence mode="wait">
								<motion.div key={step} className="relative z-10 flex w-full justify-center" initial={STAGE_FROM} animate={STAGE_TO} exit={STAGE_EXIT} transition={STAGE_T}>
									<Mini active />
								</motion.div>
							</AnimatePresence>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

const STATIC_MINIS = [SlotMini, NoteMini, PassMini, RecordMini] as const;

/** Mobile and reduced motion: the same story, stacked. */
function JourneyStacked({ className }: { className?: string }) {
	return (
		<div className={clsx('container-x section-y', className)}>
			<Title />
			<ol className="mt-12 flex flex-col gap-14">
				{STEPS.map((s, i) => {
					const Mini = STATIC_MINIS[i]!;
					return (
						<Reveal as="li" key={s.n} className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-center md:gap-10">
							<div className="min-w-0">
								<p className="tabular text-xs text-steel">{s.n}</p>
								<h3 className="display-sm mt-2 text-ink">{s.title}</h3>
								<p className="mt-3 max-w-[44ch] text-[15px] leading-relaxed text-ink-muted">{s.body}</p>
							</div>
							<div className="flex min-w-0 justify-center rounded-window bg-cream p-6 sm:p-8">
								<Mini active />
							</div>
						</Reveal>
					);
				})}
			</ol>
		</div>
	);
}

/** "Your visit, start to finish" — the four-step journey. */
export function Journey() {
	const reduce = useReducedMotion();
	return (
		<section id="how-it-works" className="relative bg-paper">
			{reduce ? (
				<JourneyStacked />
			) : (
				<>
					<JourneyPinned />
					<JourneyStacked className="lg:hidden" />
				</>
			)}
		</section>
	);
}
