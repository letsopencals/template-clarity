'use client';

import Link from 'next/link';
import { Button, buttonClasses } from '@/components/ui/button';
import { icsHref, ICS_FILENAME, googleCalendarHref } from '@/lib/calendar';
import { formatGap, type ChangePolicy } from '@/components/account/appointment-detail/policy';
import { bookHref, toCalendarEvent } from '@/components/account/care-utils';
import type { CareVisit } from '@/components/account/care-types';

const TEXT_ACTION =
	'link-underline rounded-sm text-sm font-medium text-steel transition-colors hover:text-steel-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-steel';

/** Change / cancel / calendar for upcoming visits; follow-up for past ones. */
export function RecordActions({
	visit,
	upcoming,
	policy,
	onReschedule,
	onCancel,
}: {
	visit: CareVisit;
	upcoming: boolean;
	policy: ChangePolicy;
	onReschedule: () => void;
	onCancel: () => void;
}) {
	const followUp = bookHref(visit.product.slug, { staff: visit.clinician?.slug, forChild: visit.patient.visitFor === 'child' });

	if (!upcoming) {
		return (
			<section aria-label="Next steps" className="paper p-5 sm:p-6">
				<p className="eyebrow text-ink-dim">{visit.status === 'canceled' ? 'Still need this visit?' : 'Need to come back?'}</p>
				<p className="mt-2 text-sm text-ink-muted">
					{visit.clinician ? `Book again with ${visit.clinician.firstName || visit.clinician.name} — same service, a time that suits you.` : 'Book the same service at a time that suits you.'}
				</p>
				<Link href={followUp} className={buttonClasses({ size: 'md', fullWidth: true, className: 'mt-4' })}>
					{visit.status === 'canceled' ? 'Book this visit again' : 'Book a follow-up'}
				</Link>
			</section>
		);
	}

	const event = toCalendarEvent(visit);
	const locked = visit.status === 'scheduled' && (!policy.canReschedule || !policy.canCancel);
	return (
		<section aria-label="Manage this visit" className="paper p-5 sm:p-6">
			<p className="eyebrow text-ink-dim">Manage</p>
			<div className="mt-4 flex flex-col gap-3">
				{policy.canReschedule ? (
					<Button onClick={onReschedule} fullWidth>
						Change time
					</Button>
				) : null}
				<a href={icsHref([event])} download={ICS_FILENAME} className={buttonClasses({ variant: 'outline', fullWidth: true })}>
					Add to calendar
				</a>
			</div>
			<div className="mt-4 flex flex-wrap items-center justify-between gap-3">
				<a href={googleCalendarHref(event)} target="_blank" rel="noopener noreferrer" className={TEXT_ACTION}>
					Google Calendar
				</a>
				{policy.canCancel ? (
					<button type="button" onClick={onCancel} className={`${TEXT_ACTION} text-ink-muted hover:text-clay`}>
						Cancel visit
					</button>
				) : null}
			</div>
			{locked ? (
				<p className="mt-4 border-t border-line pt-4 text-xs leading-relaxed text-ink-dim">
					{policy.canReschedule || policy.canCancel ? null : 'Online changes have closed for this visit. '}
					{!policy.canCancel && policy.cancelGap ? `Cancellations close ${formatGap(policy.cancelGap)} before the start. ` : null}
					{!policy.canReschedule && policy.rescheduleGap ? `Time changes close ${formatGap(policy.rescheduleGap)} before. ` : null}
					Please call the clinic if something has come up.
				</p>
			) : null}
		</section>
	);
}
