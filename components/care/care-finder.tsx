'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, type Transition } from 'framer-motion';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { EASE_OUT } from '@/components/motion/easing';
import { CareLine } from '@/components/motifs/care-line';
import type { VisitFor } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';
import { matchVisits, needById, type FinderVisit, type SeenMode } from './match';
import { ModeOptions, MODE_LABEL, NeedOptions, WhoOptions, WHO_LABEL } from './finder-options';
import { CareResults } from './care-results';
import { EmergencyNotice } from './emergency-notice';

export interface CareFinderInitial {
	who: VisitFor | null;
	need: string | null;
	q: string;
	mode: SeenMode | null;
}

const { careFinder } = siteConfig;
const STEP_TITLES = [careFinder.whoPrompt, careFinder.needPrompt, careFinder.modePrompt, 'Our suggestion'];

type Step = 0 | 1 | 2 | 3;

function firstOpen(s: CareFinderInitial, after = -1): Step {
	const answered = [!!s.who, !!s.need || !!s.q.trim(), !!s.mode];
	for (let i = after + 1; i < 3; i++) if (!answered[i]) return i as Step;
	for (let i = 0; i < 3; i++) if (!answered[i]) return i as Step;
	return 3;
}

const SLIDE_T: Transition = { duration: 0.5, ease: EASE_OUT };
const FADE_T: Transition = { duration: 0.15 };
const slide = (dir: number) => ({
	initial: { opacity: 0, x: dir * 48 },
	animate: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: dir * -48 },
});
const FADE = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

/**
 * The Care Finder: who → what → how → 1–3 suggested visits with live times.
 * State lives in the URL (`?for=&need=&q=&mode=`) so a result can be shared or
 * revisited. Never a diagnosis; the emergency line stays in view throughout.
 */
export function CareFinder({ initial, visits, currency }: { initial: CareFinderInitial; visits: FinderVisit[]; currency: string }) {
	const reduce = useReducedMotion();
	const [state, setState] = useState<CareFinderInitial>(initial);
	const [step, setStep] = useState<Step>(() => firstOpen(initial));
	const [dir, setDir] = useState(1);
	const headingRef = useRef<HTMLHeadingElement>(null);
	const firstRender = useRef(true);

	// URL sync (replace, no navigation or scroll).
	useEffect(() => {
		const params = new URLSearchParams();
		if (state.who) params.set('for', state.who);
		if (state.need) params.set('need', state.need);
		else if (state.q.trim()) params.set('q', state.q.trim());
		if (state.mode) params.set('mode', state.mode);
		const qs = params.toString();
		window.history.replaceState(window.history.state, '', qs ? `/care?${qs}` : '/care');
	}, [state]);

	useEffect(() => {
		if (firstRender.current) {
			firstRender.current = false;
			return;
		}
		headingRef.current?.focus({ preventScroll: true });
	}, [step]);

	const go = (next: Step) => {
		setDir(next >= step ? 1 : -1);
		setStep(next);
	};

	const answer = (patch: Partial<CareFinderInitial>, at: number) => {
		const next = { ...state, ...patch };
		const need = needById(next.need);
		if (patch.need && need?.forChild && !next.who) next.who = 'child';
		setState(next);
		go(firstOpen(next, at));
	};

	const result = useMemo(() => matchVisits({ need: state.need, q: state.q, who: state.who, mode: state.mode, visits }), [state, visits]);
	const need = needById(state.need);
	const variants = reduce ? FADE : slide(dir);

	const summary: { label: string; value: string | null; step: Step }[] = [
		{ label: 'For', value: state.who ? WHO_LABEL[state.who] : null, step: 0 },
		{ label: 'About', value: need?.label ?? (state.q.trim() ? `“${state.q.trim()}”` : null), step: 1 },
		{ label: 'Seen', value: state.mode ? MODE_LABEL[state.mode] : null, step: 2 },
	];

	return (
		<div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
			<div className="min-w-0 lg:col-span-8">
				{/* Progress */}
				<nav aria-label="Care Finder steps" className="flex items-center gap-2">
					{summary.map((s, i) => {
						const done = !!s.value;
						const current = step === i;
						return (
							<button
								key={s.label}
								type="button"
								onClick={() => go(s.step)}
								aria-current={current ? 'step' : undefined}
								className={clsx(
									'group flex flex-1 flex-col gap-2 rounded-field py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel/40',
								)}
							>
								<span className={clsx('h-[3px] w-full rounded-full transition-colors duration-500', current ? 'bg-steel' : done ? 'bg-sage-deep' : 'bg-line-strong')} />
								<span className={clsx('tabular text-[11px] uppercase tracking-[0.14em]', current ? 'text-steel' : 'text-ink-dim')}>
									{String(i + 1).padStart(2, '0')} · {s.label}
								</span>
							</button>
						);
					})}
					<button
						type="button"
						onClick={() => go(firstOpen(state) === 3 ? 3 : firstOpen(state))}
						disabled={firstOpen(state) !== 3}
						aria-current={step === 3 ? 'step' : undefined}
						className="flex flex-1 flex-col gap-2 rounded-field py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel/40 disabled:cursor-not-allowed"
					>
						<span className={clsx('h-[3px] w-full rounded-full transition-colors duration-500', step === 3 ? 'bg-steel' : 'bg-line-strong')} />
						<span className={clsx('tabular text-[11px] uppercase tracking-[0.14em]', step === 3 ? 'text-steel' : 'text-ink-dim')}>04 · Visit</span>
					</button>
				</nav>

				<div className="relative mt-10 min-h-[22rem]">
					<AnimatePresence mode="wait" initial={false}>
						<motion.div key={step} {...variants} transition={reduce ? FADE_T : SLIDE_T}>
							<h2 ref={headingRef} tabIndex={-1} className="display-sm text-ink outline-none">
								{step === 3 ? (
									<>
										Here’s where <em>we’d start.</em>
									</>
								) : (
									STEP_TITLES[step]
								)}
							</h2>
							{step === 1 && need ? <p className="mt-3 text-[15px] text-ink-muted">{need.hint}</p> : null}
							<div className="mt-8">
								{step === 0 ? <WhoOptions value={state.who} onChange={(who) => answer({ who }, 0)} /> : null}
								{step === 1 ? (
									<NeedOptions
										value={state.need}
										query={state.q}
										onChange={(id) => answer({ need: id, q: '' }, 1)}
										onSearch={(q) => answer({ q, need: null }, 1)}
									/>
								) : null}
								{step === 2 ? <ModeOptions value={state.mode} onChange={(mode) => answer({ mode }, 2)} /> : null}
								{step === 3 ? <CareResults result={result} who={state.who} mode={state.mode} currency={currency} /> : null}
							</div>
							{step > 0 ? (
								<button type="button" onClick={() => go((step - 1) as Step)} className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-steel">
									<span aria-hidden>←</span> Back
								</button>
							) : null}
						</motion.div>
					</AnimatePresence>
				</div>
			</div>

			<aside className="min-w-0 lg:col-span-4">
				<div className="flex flex-col gap-5 lg:sticky lg:top-28">
					<div className="paper overflow-hidden">
						<div className="flex items-center justify-between border-b border-line px-6 py-4">
							<span className="eyebrow text-oak">Your answers</span>
							<span className="tabular text-xs text-ink-dim">{summary.filter((s) => s.value).length}/3</span>
						</div>
						<dl className="ruled px-6 py-2">
							{summary.map((s) => (
								<div key={s.label} className="flex min-h-[2.1rem] items-center justify-between gap-4 py-1.5">
									<dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-dim">{s.label}</dt>
									<dd className="flex min-w-0 items-center gap-3">
										<span className={clsx('truncate font-display text-[16px] italic', s.value ? 'text-steel-deep' : 'text-ink-dim')}>{s.value ?? '—'}</span>
										{s.value ? (
											<button type="button" onClick={() => go(s.step)} className="text-[12px] font-medium text-steel hover:text-steel-deep">
												Change
											</button>
										) : null}
									</dd>
								</div>
							))}
						</dl>
						<CareLine settled={step === 3} tone="brass" className="h-6 px-6 pb-2" />
					</div>
					<EmergencyNotice />
					<p className="px-1 text-[13px] leading-relaxed text-ink-dim">This isn’t a diagnosis. It just gets you to the right room, and your clinician takes it from there.</p>
				</div>
			</aside>
		</div>
	);
}
