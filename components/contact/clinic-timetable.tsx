import { formatClock, parseOpeningHours, WEEK_ORDER } from '@/lib/opening-hours';
import { siteConfig } from '@/lib/site-config';

const WEEK = parseOpeningHours(siteConfig.contact.hours);

/** Mon–Sun opening hours as a ruled timetable (local time for each clinic). */
export function ClinicTimetable() {
	return (
		<dl className="ruled rounded-field px-4 py-1">
			{WEEK_ORDER.map((d) => {
				const day = WEEK[d]!;
				return (
					<div key={d} className="flex min-h-[2.1rem] items-center justify-between gap-4 text-[14px]">
						<dt className="text-ink-muted">{day.label}</dt>
						<dd className="tabular text-ink">
							{day.open != null && day.close != null ? `${formatClock(day.open, '12H')} – ${formatClock(day.close, '12H')}` : <span className="text-ink-dim">Closed</span>}
						</dd>
					</div>
				);
			})}
		</dl>
	);
}
