import Link from 'next/link';
import { clsx } from 'clsx';
import { bookingHref, formatFee, visitLength, type Visit, type VisitMode } from '@/lib/catalog';
import { buttonClasses } from '@/components/ui/button';
import { VideoBadge } from './video-badge';

export interface VisitFeeRowProps {
	visit: Visit;
	currency: string;
	/** Deep-link a clinician into the composer. */
	staff?: string | null;
	/** Preselect clinic/video in the composer. */
	mode?: VisitMode | null;
	/** Show the curated reason instead of the API description. */
	showReason?: boolean;
	className?: string;
}

/**
 * One line of the fee list, set like a clinic's printed price card:
 * "Check-up & Clean ········ 45 min · $120" with the description, a video mark
 * and a Book pill underneath.
 */
export function VisitFeeRow({ visit, currency, staff, mode, showReason, className }: VisitFeeRowProps) {
	const copy = (showReason ? visit.reason : null) ?? visit.description ?? visit.reason;
	return (
		<li className={clsx('group border-b border-line py-6 first:pt-0 last:border-b-0', className)}>
			<div className="flex items-baseline">
				<h3 className="font-display text-[1.35rem] leading-tight tracking-tight text-ink transition-colors group-hover:text-steel-deep">{visit.title}</h3>
				<span className="leader-line" aria-hidden />
				<span className="tabular shrink-0 text-sm text-ink-muted">
					{visitLength(visit.duration)}
					<span className="mx-2 text-ink-dim">·</span>
					<span className="text-ink">{formatFee(visit.price, currency)}</span>
				</span>
			</div>
			<div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div className="flex min-w-0 flex-col gap-3">
					{copy ? <p className="max-w-[60ch] text-[15px] leading-relaxed text-ink-muted">{copy}</p> : null}
					<div className="flex flex-wrap items-center gap-2">
						{visit.video ? <VideoBadge /> : null}
						{visit.group ? <span className="rounded-full bg-honey-soft px-2.5 py-1 text-[11px] font-semibold tracking-wide text-oak">Small group</span> : null}
					</div>
				</div>
				<Link
					href={bookingHref(visit.slug, { staff, mode })}
					className={buttonClasses({ variant: 'outline', size: 'sm', className: 'shrink-0 self-start sm:self-auto' })}
					aria-label={`Book ${visit.title}`}
				>
					Book
				</Link>
			</div>
		</li>
	);
}
