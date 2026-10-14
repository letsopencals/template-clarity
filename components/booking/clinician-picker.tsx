'use client';

import { memo } from 'react';
import { clsx } from 'clsx';
import { DepartmentIcon } from '@/components/ui/department-icon';
import { ClinicianFace } from '@/components/booking/clinician-face';
import type { PublicClinician } from '@/lib/clinicians';

interface ClinicianPickerProps {
	candidates: PublicClinician[];
	/** null = first available. */
	selectedId: string | null;
	answered: boolean;
	video: boolean;
	onChoose: (id: string | null) => void;
}

const ClinicianCard = memo(function ClinicianCard({
	clinician,
	selected,
	onSelect,
}: {
	clinician: PublicClinician;
	selected: boolean;
	onSelect: () => void;
}) {
	return (
		<button
			type="button"
			role="radio"
			aria-checked={selected}
			onClick={onSelect}
			className={clsx(
				'flex min-w-0 items-center gap-4 rounded-card border p-4 text-left transition-[border-color,box-shadow,background-color] duration-300',
				selected ? 'border-steel bg-steel-tint shadow-card ring-1 ring-steel' : 'border-line bg-card hover:border-line-strong',
			)}
		>
			<ClinicianFace clinician={clinician} size="md" />
			<span className="min-w-0">
				<span className="block truncate font-semibold text-ink">{clinician.name}</span>
				<span className="block truncate text-[13px] text-ink-muted">{clinician.title}</span>
				{clinician.languages.length > 1 ? (
					<span className="mt-0.5 block truncate text-[12px] text-ink-dim">Speaks {clinician.languages.join(', ')}</span>
				) : null}
			</span>
		</button>
	);
});

export function ClinicianPicker({ candidates, selectedId, answered, video, onChoose }: ClinicianPickerProps) {
	const firstSelected = answered && selectedId === null;
	return (
		<div>
			<div role="radiogroup" aria-label="Your clinician" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<button
					type="button"
					role="radio"
					aria-checked={firstSelected}
					onClick={() => onChoose(null)}
					className={clsx(
						'flex min-w-0 items-center gap-4 rounded-card border p-4 text-left transition-[border-color,box-shadow,background-color] duration-300 sm:col-span-2',
						firstSelected ? 'border-steel bg-steel-tint shadow-card ring-1 ring-steel' : 'border-line bg-cream hover:border-line-strong',
					)}
				>
					<span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-steel text-white">
						<DepartmentIcon name="clock" className="h-6 w-6" />
					</span>
					<span className="min-w-0">
						<span className="block font-semibold text-ink">First available</span>
						<span className="block text-[13px] text-ink-muted">
							See the most times. You’ll pick who sees you once you choose a time.
						</span>
					</span>
				</button>
				{candidates.map((c) => (
					<ClinicianCard key={c.id} clinician={c} selected={answered && selectedId === c.id} onSelect={() => onChoose(c.id)} />
				))}
			</div>
			{candidates.length === 0 ? (
				<p className="mt-4 text-[14px] text-ink-muted">
					{video ? 'Times below are with whichever clinician is free for video.' : 'Times below are with whichever clinician is free here.'}
				</p>
			) : null}
		</div>
	);
}
