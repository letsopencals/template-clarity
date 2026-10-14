'use client';

import { useDateFormatter } from '@/hooks/use-date-formatter';
import { DepartmentIcon } from '@/components/ui/department-icon';
import { siteConfig } from '@/lib/site-config';
import { DatePlate } from '@/components/account/date-plate';
import { VisitStatusBadge } from '@/components/account/visit-status';
import { departmentLabel, formatCountdown, personLabel, serviceTitle } from '@/components/account/care-utils';
import { formatDuration } from '@/lib/format';
import type { CareVisit } from '@/components/account/care-types';

/** Appointment-card header: date plate, service, when, who for, status. */
export function RecordHeader({ visit, nowMs, upcoming }: { visit: CareVisit; nowMs: number; upcoming: boolean }) {
	const { formatCustom, formatTime } = useDateFormatter();
	const dept = visit.department;
	const icon = visit.video ? 'video' : ((dept ? siteConfig.departments[dept]?.icon : undefined) ?? 'stethoscope');
	const who = personLabel(visit);
	const seconds = Math.round((new Date(visit.to).getTime() - new Date(visit.from).getTime()) / 1000);
	return (
		<header className="paper relative overflow-hidden p-6 sm:p-8">
			<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
				<span className="eyebrow flex items-center gap-2 text-brass">
					<DepartmentIcon name={icon} className="size-3.5" />
					{visit.video ? 'Video visit' : 'Clinic visit'}
					{dept ? ` · ${departmentLabel(dept)}` : ''}
				</span>
				<VisitStatusBadge status={visit.status} past={!upcoming} />
				{upcoming ? <span className="tabular text-xs text-ink-muted">{formatCountdown(new Date(visit.from).getTime(), nowMs)}</span> : null}
			</div>
			<div className="mt-6 flex min-w-0 gap-5">
				<DatePlate iso={visit.from} size="lg" muted={!upcoming} />
				<div className="min-w-0">
					<h1 className="display-sm text-ink">{serviceTitle(visit)}</h1>
					<p className="tabular mt-2 text-[15px] text-ink-muted">
						{formatCustom(visit.from, 'dddd D MMMM YYYY')}
						<br className="sm:hidden" />
						<span className="hidden sm:inline"> · </span>
						{formatTime(visit.from)} – {formatTime(visit.to)} <span className="text-ink-dim">({formatDuration(seconds)})</span>
					</p>
					<p className="mt-2 text-sm text-ink-muted">
						For <span className="font-semibold text-ink">{who === 'You' ? 'you' : visit.patient.name}</span>
						{visit.patient.visitFor === 'child' ? <span className="text-ink-dim"> · child</span> : null}
						{visit.patient.dob ? <span className="text-ink-dim"> · born {visit.patient.dob}</span> : null}
					</p>
				</div>
			</div>
			<div className="perforation mt-7" />
			<p className="tabular mt-3 text-[11px] tracking-wide text-ink-dim">Ref. {visit.id.slice(0, 8).toUpperCase()}</p>
		</header>
	);
}
