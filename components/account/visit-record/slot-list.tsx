'use client';

import { memo } from 'react';
import { clsx } from 'clsx';
import type { Moment } from 'moment-timezone';

export interface SlotOption {
	key: string;
	start: Moment;
	label: string;
	current: boolean;
}

const PARTS = [
	{ id: 'morning', label: 'Morning', until: 12 },
	{ id: 'afternoon', label: 'Afternoon', until: 17 },
	{ id: 'evening', label: 'Evening', until: 24 },
] as const;

/** Free times for one day, grouped Morning / Afternoon / Evening. */
export const SlotList = memo(function SlotList({ slots, value, onChange }: { slots: SlotOption[]; value: string | null; onChange: (key: string) => void }) {
	let from = 0;
	const groups = PARTS.map((p) => {
		const list = slots.filter((s) => s.start.hours() >= from && s.start.hours() < p.until);
		from = p.until;
		return { ...p, list };
	}).filter((g) => g.list.length);

	return (
		<div role="radiogroup" aria-label="Choose a time" className="space-y-5">
			{groups.map((g) => (
				<div key={g.id}>
					<p className="eyebrow text-ink-dim">{g.label}</p>
					<div className="mt-2.5 grid grid-cols-3 gap-2 sm:grid-cols-4">
						{g.list.map((s) => {
							const active = s.key === value;
							return (
								<button
									key={s.key}
									type="button"
									role="radio"
									aria-checked={active}
									disabled={s.current}
									onClick={() => onChange(s.key)}
									className={clsx(
										'tabular relative h-11 rounded-full border text-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-steel',
										active
											? 'border-steel bg-steel text-white'
											: s.current
												? 'cursor-default border-dashed border-brass/60 bg-honey-soft/50 text-oak'
												: 'border-line-strong bg-card text-ink hover:border-steel hover:text-steel',
									)}
								>
									{s.label}
									{s.current ? <span className="sr-only"> (your current time)</span> : null}
								</button>
							);
						})}
					</div>
				</div>
			))}
		</div>
	);
});
