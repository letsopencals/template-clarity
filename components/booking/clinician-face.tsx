import { memo } from 'react';
import { clsx } from 'clsx';
import { SafeImage } from '@/components/ui/safe-image';
import type { PublicClinician } from '@/lib/clinicians';

const SIZES = {
	xs: 'h-7 w-7 text-[10px]',
	sm: 'h-10 w-10 text-[12px]',
	md: 'h-14 w-14 text-[15px]',
	lg: 'h-20 w-20 text-[20px]',
} as const;

const PX = { xs: 28, sm: 40, md: 56, lg: 80 } as const;

export function initialsOf(c: Pick<PublicClinician, 'firstName' | 'lastName'>): string {
	const first = c.firstName.replace(/^Dr\.?\s*/i, '');
	return `${first[0] ?? ''}${c.lastName[0] ?? ''}`.toUpperCase();
}

/** A clinician portrait, or a brass monogram when there's no photo. */
export const ClinicianFace = memo(function ClinicianFace({
	clinician,
	size = 'sm',
	className,
}: {
	clinician: Pick<PublicClinician, 'firstName' | 'lastName' | 'imageUrl' | 'name'>;
	size?: keyof typeof SIZES;
	className?: string;
}) {
	return (
		<span
			className={clsx(
				'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-brass-soft bg-cream font-display text-brass',
				SIZES[size],
				className,
			)}
		>
			{clinician.imageUrl ? (
				<SafeImage src={clinician.imageUrl} alt="" width={PX[size]} height={PX[size]} className="h-full w-full object-cover" />
			) : (
				<span aria-hidden>{initialsOf(clinician)}</span>
			)}
		</span>
	);
});

/** Overlapping faces of everyone free at a time ("+2" past `max`). */
export const FaceStack = memo(function FaceStack({ clinicians, max = 3 }: { clinicians: PublicClinician[]; max?: number }) {
	if (clinicians.length === 0) return null;
	const shown = clinicians.slice(0, max);
	const extra = clinicians.length - shown.length;
	return (
		<span className="flex items-center -space-x-2" aria-label={`${clinicians.length} free`}>
			{shown.map((c) => (
				<ClinicianFace key={c.id} clinician={c} size="xs" className="ring-2 ring-card" />
			))}
			{extra > 0 ? (
				<span className="tabular flex h-7 w-7 items-center justify-center rounded-full bg-cream-deep text-[10px] text-ink-muted ring-2 ring-card">
					+{extra}
				</span>
			) : null}
		</span>
	);
});
