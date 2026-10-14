'use client';

import { memo, useCallback, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { useHydrated } from '@/hooks/use-hydrated';
import { SPRING_SOFT } from '@/components/motion/easing';
import { plusDays, todayIn } from '@/components/booking/slot-time';

interface DayRibbonProps {
	timezone: string;
	selectedDate: string | null;
	/** Open days (null while loading → everything selectable). */
	availableDates: Set<string> | null;
	onSelect: (date: string) => void;
}

const INITIAL_DAYS = 35;
const MAX_DAYS = 120;
const STEP = 28;

const WEEKDAY = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' });
const MONTH = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

function at(date: string) {
	return new Date(`${date}T00:00:00Z`);
}

const DayButton = memo(function DayButton({
	date,
	selected,
	closed,
	isToday,
	focusable,
	onSelect,
	onKeyDown,
}: {
	date: string;
	selected: boolean;
	focusable: boolean;
	closed: boolean;
	isToday: boolean;
	onSelect: (date: string) => void;
	onKeyDown: (e: KeyboardEvent<HTMLButtonElement>, date: string) => void;
}) {
	const d = at(date);
	return (
		<button
			type="button"
			data-date={date}
			disabled={closed}
			aria-pressed={selected}
			aria-label={`${d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })}${closed ? ', no times' : ''}`}
			tabIndex={focusable ? 0 : -1}
			onClick={() => onSelect(date)}
			onKeyDown={(e) => onKeyDown(e, date)}
			className={clsx(
				'relative flex h-[4.5rem] w-14 shrink-0 flex-col items-center justify-center rounded-field transition-colors duration-300',
				closed ? 'cursor-not-allowed text-ink-dim/60' : selected ? 'text-white' : 'text-ink hover:bg-cream',
			)}
		>
			{selected ? <motion.span layoutId="day-fill" transition={SPRING_SOFT} className="absolute inset-0 rounded-field bg-steel" aria-hidden /> : null}
			<span className={clsx('relative text-[11px] font-medium uppercase tracking-[0.12em]', selected ? 'text-white/80' : 'text-ink-muted')}>
				{isToday ? 'Today' : WEEKDAY.format(d)}
			</span>
			<span className={clsx('tabular relative mt-1 text-[18px]', closed && 'line-through decoration-line-strong')}>{d.getUTCDate()}</span>
		</button>
	);
});

/**
 * A horizontal ribbon of days: closed days greyed (from the merged availability
 * ranges), a month masthead that follows the selection, arrow-key navigation.
 * "Today" depends on the visitor's clock, so the ribbon renders after hydration.
 */
export function DayRibbon({ timezone, selectedDate, availableDates, onSelect }: DayRibbonProps) {
	const hydrated = useHydrated();
	const [count, setCount] = useState(INITIAL_DAYS);
	const scroller = useRef<HTMLDivElement>(null);

	const today = hydrated ? todayIn(timezone) : null;
	const days = useMemo(() => (today ? Array.from({ length: count }, (_, i) => plusDays(today, i)) : []), [today, count]);
	const isClosed = useCallback((date: string) => (availableDates ? !availableDates.has(date) : false), [availableDates]);

	const handleKey = useCallback(
		(e: KeyboardEvent<HTMLButtonElement>, date: string) => {
			if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
			e.preventDefault();
			const dir = e.key === 'ArrowRight' ? 1 : -1;
			let i = days.indexOf(date) + dir;
			while (i >= 0 && i < days.length && isClosed(days[i]!)) i += dir;
			const next = days[i];
			if (!next) return;
			onSelect(next);
			scroller.current?.querySelector<HTMLButtonElement>(`[data-date="${next}"]`)?.focus();
		},
		[days, isClosed, onSelect],
	);

	const masthead = MONTH.format(at(selectedDate ?? today ?? '2026-01-01'));
	const tabStop = selectedDate && days.includes(selectedDate) ? selectedDate : days.find((d) => !isClosed(d));
	const noneOpen = !!availableDates && days.length > 0 && days.every(isClosed);

	if (!hydrated) return <div className="h-[6.5rem] rounded-card bg-cream/60" aria-hidden />;

	return (
		<div className="min-w-0">
			<p className="eyebrow mb-3 text-ink-muted" aria-live="polite">
				{masthead}
			</p>
			<div ref={scroller} role="group" aria-label="Choose a day" className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1 pb-1" data-lenis-prevent>
				{days.map((date) => (
					<DayButton
						key={date}
						date={date}
						selected={date === selectedDate}
						closed={isClosed(date)}
						isToday={date === today}
						focusable={date === tabStop}
						onSelect={onSelect}
						onKeyDown={handleKey}
					/>
				))}
				{count < MAX_DAYS ? (
					<button
						type="button"
						onClick={() => setCount((c) => Math.min(MAX_DAYS, c + STEP))}
						className="flex h-[4.5rem] shrink-0 items-center rounded-field border border-dashed border-line-strong px-4 text-[13px] font-semibold text-steel hover:border-steel"
					>
						Later dates
					</button>
				) : null}
			</div>
			{noneOpen ? (
				<p className="mt-3 text-[14px] text-ink-muted">No open times in these weeks. Try later dates, another clinician, or a video visit.</p>
			) : null}
		</div>
	);
}
