'use client';

import Link from 'next/link';
import { clsx } from 'clsx';
import { buttonClasses } from '@/components/ui/button';
import { DepartmentIcon } from '@/components/ui/department-icon';
import { Seal } from '@/components/motifs/seal';
import { useNow } from '@/hooks/use-now';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { icsHref, ICS_FILENAME } from '@/lib/calendar';
import { siteConfig } from '@/lib/site-config';
import { getChangePolicy } from '@/components/account/appointment-detail/policy';
import { DatePlate } from '@/components/account/date-plate';
import { ClinicianPortrait } from '@/components/account/clinician-portrait';
import { PrepChecklist } from '@/components/account/overview/prep-checklist';
import { directionsHref, formatCountdown, joinState, personLabel, serviceTitle, toCalendarEvent, departmentLabel } from '@/components/account/care-utils';
import type { CareVisit } from '@/components/account/care-types';

const TEXT_ACTION =
	'link-underline rounded-sm text-sm font-medium text-steel transition-colors hover:text-steel-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-steel';

function JoinVideo({ visit, nowMs }: { visit: CareVisit; nowMs: number }) {
	const state = joinState(visit, nowMs);
	const link = visit.place?.link;
	if (state === 'open' && link) {
		return (
			<a href={link} target="_blank" rel="noopener noreferrer" className={buttonClasses({ size: 'lg' })}>
				<span className="live-dot" aria-hidden />
				Join video visit
			</a>
		);
	}
	return (
		<div className="flex flex-col gap-1.5">
			<span aria-disabled="true" className={buttonClasses({ size: 'lg', variant: 'outline', className: 'pointer-events-none opacity-60' })}>
				<DepartmentIcon name="video" className="size-4" />
				Join video visit
			</span>
			<span className="text-xs text-ink-dim">
				{link ? `Opens ${siteConfig.videoVisit.joinWindowMinutes} minutes before your visit.` : 'Your link will appear here before the visit.'}
			</span>
		</div>
	);
}

/** The next visit as an appointment card: countdown, how to get there / join, what to bring. */
export function NextVisit({ visit }: { visit: CareVisit }) {
	const now = useNow(30_000);
	const { formatCustom, formatTime } = useDateFormatter();
	const nowMs = now?.getTime() ?? null;
	const policy = nowMs ? getChangePolicy(visit, nowMs) : null;
	const directions = visit.place ? directionsHref(visit.place) : null;
	const dept = visit.department;
	const icon = (dept ? siteConfig.departments[dept]?.icon : undefined) ?? 'stethoscope';
	const detailHref = `/account/appointments/${visit.id}`;
	const forWhom = personLabel(visit);

	return (
		<article aria-labelledby="next-visit-title" className="paper relative overflow-hidden">
			<div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
				<div className="min-w-0 p-6 sm:p-8">
					<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
						<span className="eyebrow text-brass">Next visit</span>
						<span aria-hidden className="h-px w-8 bg-brass/40" />
						<span className="tabular text-sm text-ink" aria-live="polite">
							{nowMs ? formatCountdown(new Date(visit.from).getTime(), nowMs) : ' '}
						</span>
						{forWhom !== 'You' ? <span className="rounded-full bg-honey-soft px-2.5 py-0.5 text-[11px] font-semibold text-oak">For {forWhom}</span> : null}
						{visit.status === 'pending' ? <span className="rounded-full bg-honey-soft px-2.5 py-0.5 text-[11px] font-semibold text-oak">Awaiting confirmation</span> : null}
					</div>

					<div className="mt-6 flex min-w-0 gap-5">
						<DatePlate iso={visit.from} size="lg" />
						<div className="min-w-0">
							<h2 id="next-visit-title" className="display-sm text-ink">
								<Link href={detailHref} className="rounded-sm hover:text-steel focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-steel">
									{serviceTitle(visit)}
								</Link>
							</h2>
							<p className="tabular mt-2 text-[15px] text-ink-muted">
								{formatCustom(visit.from, 'dddd')} · {formatTime(visit.from)} – {formatTime(visit.to)}
							</p>
							<p className="mt-1 flex items-center gap-2 text-sm text-ink-muted">
								<DepartmentIcon name={visit.video ? 'video' : icon} className="size-4 shrink-0 text-steel" />
								<span className="truncate">
									{visit.video ? 'Video visit' : (visit.place?.title ?? siteConfig.shortName)}
									{dept ? ` · ${departmentLabel(dept)}` : ''}
								</span>
							</p>
						</div>
					</div>

					{visit.clinician ? (
						<div className="mt-6 flex items-center gap-3">
							<ClinicianPortrait name={visit.clinician.name} imageUrl={visit.clinician.imageUrl} size={40} />
							<div className="min-w-0">
								<p className="text-sm font-semibold text-ink">{visit.clinician.name}</p>
								<p className="text-xs text-ink-muted">{visit.clinician.title}</p>
							</div>
						</div>
					) : null}

					{!visit.video && visit.place?.addressLines.length ? (
						<address className="mt-5 text-sm leading-relaxed text-ink-muted not-italic">{visit.place.addressLines.join(', ')}</address>
					) : null}

					<div className="mt-7 flex flex-wrap items-center gap-3">
						{visit.video ? (
							nowMs ? <JoinVideo visit={visit} nowMs={nowMs} /> : null
						) : directions ? (
							<a href={directions} target="_blank" rel="noopener noreferrer" className={buttonClasses({ size: 'lg' })}>
								<DepartmentIcon name="pin" className="size-4" />
								Get directions
							</a>
						) : null}
						<a href={icsHref([toCalendarEvent(visit)])} download={ICS_FILENAME} className={buttonClasses({ size: 'lg', variant: 'outline' })}>
							Add to calendar
						</a>
					</div>

					<div className="perforation mt-8" />
					<div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
						<Link href={detailHref} className={TEXT_ACTION}>
							Visit details & notes
						</Link>
						{policy?.canReschedule ? (
							<Link href={`${detailHref}?action=reschedule`} className={TEXT_ACTION}>
								Change time
							</Link>
						) : null}
						{policy?.canCancel ? (
							<Link href={`${detailHref}?action=cancel`} className={clsx(TEXT_ACTION, 'text-ink-muted hover:text-clay')}>
								Cancel visit
							</Link>
						) : null}
					</div>
				</div>

				<div className="relative min-w-0 border-t border-line bg-cream/50 p-5 sm:p-6 lg:border-t-0 lg:border-l">
					<Seal size={72} className="pointer-events-none absolute -top-3 right-4 hidden opacity-70 lg:block" />
					<PrepChecklist appointmentId={visit.id} department={dept} video={visit.video} />
				</div>
			</div>
		</article>
	);
}
