'use client';

import { clsx } from 'clsx';
import { departmentLabel } from '@/components/account/care-utils';

export type StatusFilter = 'all' | 'upcoming' | 'past' | 'canceled';

const STATUS: { value: StatusFilter; label: string }[] = [
	{ value: 'all', label: 'All' },
	{ value: 'upcoming', label: 'Coming up' },
	{ value: 'past', label: 'Past' },
	{ value: 'canceled', label: 'Cancelled' },
];

const SELECT =
	'h-10 rounded-full border border-line-strong bg-card pr-9 pl-4 text-[13px] text-ink outline-none transition-colors hover:border-steel focus-visible:border-steel focus-visible:shadow-[0_0_0_4px_rgba(63,110,140,0.12)]';

/** Status segmented control + department select. Person is the shell's family chips. */
export function VisitFilters({
	status,
	onStatus,
	department,
	onDepartment,
	departments,
	counts,
}: {
	status: StatusFilter;
	onStatus: (s: StatusFilter) => void;
	department: string | null;
	onDepartment: (d: string | null) => void;
	departments: string[];
	counts: Record<StatusFilter, number>;
}) {
	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div role="radiogroup" aria-label="Show visits" className="-mx-1 flex gap-1 overflow-x-auto px-1" data-lenis-prevent>
				{STATUS.map((s) => (
					<button
						key={s.value}
						type="button"
						role="radio"
						aria-checked={status === s.value}
						onClick={() => onStatus(s.value)}
						className={clsx(
							'inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-steel',
							status === s.value ? 'bg-ink text-paper' : 'text-ink-muted hover:bg-cream hover:text-ink',
						)}
					>
						{s.label}
						<span className={clsx('tabular text-[11px]', status === s.value ? 'text-paper/70' : 'text-ink-dim')}>{counts[s.value]}</span>
					</button>
				))}
			</div>
			{departments.length > 1 ? (
				<label className="relative inline-flex items-center gap-3 self-start sm:self-auto">
					<span className="sr-only">Department</span>
					<select value={department ?? ''} onChange={(e) => onDepartment(e.target.value || null)} className={clsx(SELECT, 'appearance-none')}>
						<option value="">All departments</option>
						{departments.map((d) => (
							<option key={d} value={d}>
								{departmentLabel(d)}
							</option>
						))}
					</select>
					<svg aria-hidden viewBox="0 0 16 16" className="pointer-events-none absolute right-3.5 size-3.5 text-ink-muted" fill="none" stroke="currentColor" strokeWidth={1.8}>
						<path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				</label>
			) : null}
		</div>
	);
}
