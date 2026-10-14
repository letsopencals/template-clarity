'use client';

import { clsx } from 'clsx';
import { DepartmentIcon, type DepartmentIconName } from '@/components/ui/department-icon';
import type { VisitFor } from '@/lib/intake';

const OPTIONS: { value: VisitFor; label: string; hint: string; icon: DepartmentIconName }[] = [
	{ value: 'self', label: 'Me', hint: 'I’m the patient', icon: 'user' },
	{ value: 'child', label: 'My child', hint: 'You’ll come along', icon: 'child' },
	{ value: 'other', label: 'Someone else', hint: 'A partner or parent', icon: 'users' },
];

interface VisitForPickerProps {
	value: VisitFor | null;
	onChange: (value: VisitFor) => void;
	/** Pediatrics: only children (or someone else's child). */
	pediatrics?: boolean;
}

export function VisitForPicker({ value, onChange, pediatrics = false }: VisitForPickerProps) {
	const options = pediatrics ? OPTIONS.filter((o) => o.value !== 'self') : OPTIONS;
	return (
		<div role="radiogroup" aria-label="Who is this visit for" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
			{options.map((o) => {
				const selected = value === o.value;
				return (
					<button
						key={o.value}
						type="button"
						role="radio"
						aria-checked={selected}
						onClick={() => onChange(o.value)}
						className={clsx(
							'flex min-w-0 items-center gap-3 rounded-card border px-4 py-4 text-left transition-[border-color,background-color,box-shadow] duration-300',
							selected ? 'border-steel bg-steel-tint shadow-card' : 'border-line bg-card hover:border-line-strong',
						)}
					>
						<span
							className={clsx(
								'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
								selected ? 'bg-steel text-white' : 'bg-cream text-steel',
							)}
						>
							<DepartmentIcon name={o.icon} className="h-5 w-5" />
						</span>
						<span className="min-w-0">
							<span className="block font-semibold text-ink">{o.label}</span>
							<span className="block text-[13px] text-ink-muted">{o.hint}</span>
						</span>
					</button>
				);
			})}
		</div>
	);
}
