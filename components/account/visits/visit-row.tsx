'use client';

import { memo } from 'react';
import Link from 'next/link';
import { DepartmentIcon } from '@/components/ui/department-icon';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { siteConfig } from '@/lib/site-config';
import { DatePlate } from '@/components/account/date-plate';
import { VisitStatusBadge } from '@/components/account/visit-status';
import { departmentLabel, personLabel, serviceTitle } from '@/components/account/care-utils';
import type { CareVisit } from '@/components/account/care-types';

/** One visit on the timeline: date plate, service, who and where, status. */
export const VisitRow = memo(function VisitRow({ visit, past, href }: { visit: CareVisit; past: boolean; href: string }) {
	const { formatTime } = useDateFormatter();
	const dept = visit.department;
	const icon = visit.video ? 'video' : ((dept ? siteConfig.departments[dept]?.icon : undefined) ?? 'stethoscope');
	const who = personLabel(visit);
	const muted = past || visit.status === 'canceled';
	return (
		<Link
			href={href}
			className="group flex min-w-0 items-center gap-4 rounded-card border border-line bg-card px-4 py-3.5 transition-[border-color,box-shadow] duration-300 hover:border-steel/40 hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-steel sm:gap-5 sm:px-5"
		>
			<DatePlate iso={visit.from} muted={muted} />
			<div className="min-w-0 flex-1">
				<p className={muted ? 'truncate font-medium text-ink-muted' : 'truncate font-medium text-ink'}>
					<span className={visit.status === 'canceled' ? 'line-through decoration-line-strong' : undefined}>{serviceTitle(visit)}</span>
				</p>
				<p className="mt-1 flex min-w-0 items-center gap-2 text-[13px] text-ink-muted">
					<DepartmentIcon name={icon} className="size-3.5 shrink-0 text-steel" />
					<span className="tabular shrink-0">{formatTime(visit.from)}</span>
					<span className="truncate">
						{visit.clinician ? ` · ${visit.clinician.name}` : ''}
						{dept ? ` · ${departmentLabel(dept)}` : ''}
					</span>
				</p>
				{who !== 'You' ? <p className="mt-1 text-xs font-medium text-oak">For {who}</p> : null}
			</div>
			<div className="flex shrink-0 flex-col items-end gap-2">
				<VisitStatusBadge status={visit.status} past={past} />
				<svg aria-hidden viewBox="0 0 16 16" className="size-4 text-ink-dim transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-steel" fill="none" stroke="currentColor" strokeWidth={1.6}>
					<path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			</div>
		</Link>
	);
});
