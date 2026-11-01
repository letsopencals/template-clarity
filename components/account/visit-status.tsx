import { clsx } from 'clsx';
import type { AppointmentStatusType } from '@opencals/storefront-sdk';
import type { CareVisit } from '@/components/account/care-types';

type Tone = 'steel' | 'honey' | 'sage' | 'clay' | 'dim';

const TONES: Record<Tone, string> = {
	steel: 'border-steel/25 bg-steel-tint text-steel-deep',
	honey: 'border-honey/40 bg-honey-soft text-oak',
	sage: 'border-sage/40 bg-sage-soft text-sage-deep',
	clay: 'border-clay/30 bg-clay-soft text-clay',
	dim: 'border-line bg-cream text-ink-muted',
};

type PendingReason = CareVisit['pendingReason'];

/**
 * Human label + tone for a visit's state. A scheduled visit already behind us reads as "Past".
 * A `pending` visit only waits when it has a reason; without one it is being confirmed right now.
 */
export function statusOf(status: AppointmentStatusType, past: boolean, pendingReason: PendingReason = null): { label: string; tone: Tone } {
	switch (status) {
		case 'completed':
			return { label: 'Seen', tone: 'sage' };
		case 'canceled':
			return { label: 'Cancelled', tone: 'clay' };
		case 'pending':
			if (!pendingReason) return past ? { label: 'Past', tone: 'dim' } : { label: 'Booked', tone: 'steel' };
			if (past) return { label: 'Not confirmed', tone: 'dim' };
			return pendingReason === 'awaiting_payment' ? { label: 'Awaiting payment', tone: 'honey' } : { label: 'Awaiting confirmation', tone: 'honey' };
		default:
			return past ? { label: 'Past', tone: 'dim' } : { label: 'Booked', tone: 'steel' };
	}
}

export function VisitStatusBadge({
	status,
	past,
	pendingReason = null,
	className,
}: {
	status: AppointmentStatusType;
	past: boolean;
	pendingReason?: PendingReason;
	className?: string;
}) {
	const { label, tone } = statusOf(status, past, pendingReason);
	return (
		<span className={clsx('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide', TONES[tone], className)}>
			<span aria-hidden className="size-1.5 rounded-full bg-current opacity-70" />
			{label}
		</span>
	);
}
