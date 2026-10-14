'use client';

import { useEffect, useState } from 'react';
import { motion, type Transition } from 'framer-motion';
import { clsx } from 'clsx';
import { Seal } from '@/components/motifs/seal';
import { DepartmentIcon } from '@/components/ui/department-icon';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { EASE_OUT, SPRING_SOFT } from '@/components/motion/easing';

/*
 * Four small, animated pieces of clinic stationery for the journey story.
 * Each plays when `active` turns true and shows its finished state under
 * reduced motion. Purely illustrative (aria-hidden): the step copy carries
 * the meaning.
 */

const DAYS = [
	{ d: 'Mon', n: 13 },
	{ d: 'Tue', n: 14 },
	{ d: 'Wed', n: 15 },
	{ d: 'Thu', n: 16 },
	{ d: 'Fri', n: 17 },
];
const TIMES = ['9:00', '9:30', '11:00', '1:30', '2:30', '4:00'];
const PICK = 4;

const POP_FROM = { opacity: 0, y: 8 } as const;
const POP_TO = { opacity: 1, y: 0 } as const;
const T_FAST: Transition = { duration: 0.35, ease: EASE_OUT };

/** Plays a staged sequence: 0 → n steps over time while active. */
function useSequence(active: boolean, steps: number, every: number): number {
	const reduce = useReducedMotion();
	const [stage, setStage] = useState(0);
	useEffect(() => {
		if (!active || reduce) return;
		setStage(0);
		let i = 0;
		const id = window.setInterval(() => {
			i += 1;
			setStage(i);
			if (i >= steps) window.clearInterval(id);
		}, every);
		return () => window.clearInterval(id);
	}, [active, reduce, steps, every]);
	return reduce ? steps : stage;
}

/* 01 — a slot being picked */
export function SlotMini({ active }: { active: boolean }) {
	const stage = useSequence(active, 3, 650);
	return (
		<div aria-hidden className="paper w-full max-w-[24rem] p-6">
			<div className="flex items-center justify-between">
				<span className="eyebrow text-oak">General consultation</span>
				<span className="tabular text-xs text-ink-dim">30 min</span>
			</div>
			<div className="mt-5 grid grid-cols-5 gap-2">
				{DAYS.map((day, i) => (
					<span
						key={day.d}
						className={clsx(
							'flex flex-col items-center rounded-field border py-2 text-[11px] transition-colors duration-500',
							i === 2 && stage >= 1 ? 'border-steel bg-steel-tint text-steel-deep' : 'border-line text-ink-muted',
						)}
					>
						{day.d}
						<span className="tabular mt-0.5 text-base text-ink">{day.n}</span>
					</span>
				))}
			</div>
			<div className="mt-4 grid grid-cols-3 gap-2">
				{TIMES.map((t, i) => (
					<span
						key={t}
						className={clsx(
							'tabular relative rounded-full border py-2 text-center text-[13px] transition-all duration-500',
							i === PICK && stage >= 2 ? 'scale-[1.04] border-steel bg-steel text-paper shadow-card' : 'border-line-strong text-ink',
							i === 1 ? 'opacity-35 line-through' : '',
						)}
					>
						{t}
					</span>
				))}
			</div>
			<motion.div
				className="mt-5 flex items-center gap-2 rounded-full bg-sage-soft px-3.5 py-2 text-[13px] font-medium text-sage-deep"
				initial={false}
				animate={stage >= 3 ? POP_TO : POP_FROM}
				transition={T_FAST}
			>
				<DepartmentIcon name="check" className="h-4 w-4" />
				Held for you · Wed 15, 2:30 PM · Dr. Chen
			</motion.div>
		</div>
	);
}

/* 02 — a note typed on ruled paper */
const NOTE = 'The mole on my left shoulder has changed shape over the summer. No pain. I’ve attached a photo.';

export function NoteMini({ active }: { active: boolean }) {
	const reduce = useReducedMotion();
	const [count, setCount] = useState(0);
	useEffect(() => {
		if (!active || reduce) return;
		setCount(0);
		const id = window.setInterval(() => {
			setCount((c) => {
				if (c >= NOTE.length) {
					window.clearInterval(id);
					return c;
				}
				return c + 1;
			});
		}, 28);
		return () => window.clearInterval(id);
	}, [active, reduce]);
	const shown = reduce ? NOTE.length : count;
	const done = shown >= NOTE.length;
	return (
		<div aria-hidden className="paper w-full max-w-[24rem] overflow-hidden">
			<div className="flex items-center justify-between border-b border-line px-6 py-4">
				<span className="eyebrow text-oak">Pre-visit notes</span>
				<span className="text-xs text-ink-dim">Read before you arrive</span>
			</div>
			<div className="ruled px-6 pb-6 pt-3">
				<p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-dim leading-[2.1rem]">Reason for visit</p>
				<p className="min-h-[6.3rem] font-display text-[17px] italic leading-[2.1rem] text-steel-deep">
					{NOTE.slice(0, shown)}
					{!done ? <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 animate-pulse bg-steel" /> : null}
				</p>
				<motion.div
					className="mt-2 flex items-center gap-3 rounded-field border border-line bg-card p-2 pr-4"
					initial={false}
					animate={done ? POP_TO : POP_FROM}
					transition={T_FAST}
				>
					<span className="image-placeholder h-10 w-10 rounded-[0.6rem]" />
					<span className="flex flex-col text-[12px]">
						<span className="text-ink">shoulder-mole.jpg</span>
						<span className="text-ink-dim">Only your clinician sees this</span>
					</span>
					<DepartmentIcon name="lock" className="ml-auto h-4 w-4 text-sage-deep" />
				</motion.div>
			</div>
		</div>
	);
}

/* 03 — the visit pass, stamped */
export function PassMini({ active }: { active: boolean }) {
	const stage = useSequence(active, 1, 500);
	return (
		<div aria-hidden className="paper relative w-full max-w-[24rem]">
			<div className="p-6">
				<div className="flex items-start justify-between">
					<span className="eyebrow text-oak">Visit pass</span>
					<span className="tabular text-xs text-ink-dim">CC-24817</span>
				</div>
				<p className="mt-4 font-display text-2xl leading-tight tracking-tight text-ink">
					Wednesday <em className="italic text-steel">2:30 PM</em>
				</p>
				<p className="mt-1 text-sm text-ink-muted">Dermatology · Dr. Priya Patel</p>
			</div>
			<div className="relative">
				<span className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-cream" />
				<span className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-cream" />
				<div className="perforation mx-5" />
			</div>
			<div className="grid grid-cols-2 gap-4 p-6 text-[13px]">
				<div>
					<p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-dim">Where</p>
					<p className="mt-1 text-ink">875 N Michigan Ave</p>
					<p className="text-ink-muted">Arrive 10 min early</p>
				</div>
				<div>
					<p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-dim">Bring</p>
					<p className="mt-1 text-ink">Photo ID</p>
					<p className="text-ink-muted">Insurance card</p>
				</div>
			</div>
			<div className="absolute -right-4 -top-6">
				{stage >= 1 ? <Seal size={96} motion="stamp" ring="Confirmed · Clear Care · " /> : null}
			</div>
		</div>
	);
}

/* 04 — the care record timeline */
const RECORD = [
	{ when: 'Mar', what: 'Annual check-up', who: 'Dr. Lin Chen', tone: 'done' },
	{ when: 'Jun', what: 'Skin check · video', who: 'Dr. Priya Patel', tone: 'done' },
	{ when: 'Sep', what: 'Well-child visit · Mia', who: 'Dr. Min Kim', tone: 'done' },
	{ when: 'Dec', what: 'Dental check-up is due', who: 'Book in one tap', tone: 'due' },
] as const;

const ROW_ON = { opacity: 1, x: 0 } as const;
const ROW_OFF = { opacity: 0, x: 12 } as const;
const T_NONE: Transition = { duration: 0 };
const ROW_T = (i: number): Transition => ({ ...SPRING_SOFT, delay: 0.1 + i * 0.18 });

export function RecordMini({ active }: { active: boolean }) {
	const reduce = useReducedMotion();
	const on = active || reduce;
	return (
		<div aria-hidden className="paper w-full max-w-[24rem] p-6">
			<div className="flex items-center justify-between">
				<span className="eyebrow text-oak">My Care</span>
				<span className="flex gap-1.5 text-[11px]">
					<span className="rounded-full bg-steel-tint px-2.5 py-1 font-semibold text-steel-deep">Everyone</span>
					<span className="rounded-full border border-line px-2.5 py-1 text-ink-muted">Me</span>
					<span className="rounded-full border border-line px-2.5 py-1 text-ink-muted">Mia</span>
				</span>
			</div>
			<ol className="relative mt-6 flex flex-col gap-5 pl-6">
				<span className="absolute bottom-2 left-[5px] top-2 w-px bg-line-strong" />
				{RECORD.map((r, i) => (
					<motion.li
						key={r.what}
						className="relative"
						initial={false}
						animate={on ? ROW_ON : ROW_OFF}
						transition={reduce ? T_NONE : ROW_T(i)}
					>
						<span
							className={clsx(
								'absolute -left-6 top-1.5 h-[11px] w-[11px] rounded-full border-2 border-card',
								r.tone === 'due' ? 'bg-honey' : 'bg-sage-deep',
							)}
						/>
						<p className="flex items-baseline gap-3">
							<span className="tabular w-8 text-xs text-ink-dim">{r.when}</span>
							<span className={clsx('text-[14px]', r.tone === 'due' ? 'font-semibold text-oak' : 'text-ink')}>{r.what}</span>
						</p>
						<p className="ml-11 text-[12px] text-ink-muted">{r.who}</p>
					</motion.li>
				))}
			</ol>
		</div>
	);
}

export const JOURNEY_MINIS = [SlotMini, NoteMini, PassMini, RecordMini] as const;
