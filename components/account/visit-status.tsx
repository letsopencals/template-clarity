import { clsx } from 'clsx';
import type { VisitStatus } from '@/components/account/care-types';

type Tone = 'steel' | 'honey' | 'sage' | 'clay' | 'dim';

const TONES: Record<Tone, string> = {
	steel: 'border-steel/25 bg-steel-tint text-steel-deep',
	honey: 'border-honey/40 bg-honey-soft text-oak',
	sage: 'border-sage/40 bg-sage-soft text-sage-deep',
	clay: 'border-clay/30 bg-clay-soft text-clay',
	dim: 'border-line bg-cream text-ink-muted',
};

/** Human label + tone for a visit's state. A scheduled visit already behind us reads as "Past". */
export function statusOf(status: VisitStatus, past: boolean): { label: string; tone: Tone } {
	switch (status) {
		case 'completed':
			return { label: 'Seen', tone: 'sage' };
		case 'canceled':
			return { label: 'Cancelled', tone: 'clay' };
		case 'pending':
			return past ? { label: 'Not confirmed', tone: 'dim' } : { label: 'Awaiting confirmation', tone: 'honey' };
		default:
			return past ? { label: 'Past', tone: 'dim' } : { label: 'Booked', tone: 'steel' };
	}
}

export function VisitStatusBadge({ status, past, className }: { status: VisitStatus; past: boolean; className?: string }) {
	const { label, tone } = statusOf(status, past);
	return (
		<span className={clsx('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide', TONES[tone], className)}>
			<span aria-hidden className="size-1.5 rounded-full bg-current opacity-70" />
			{label}
		</span>
	);
}
