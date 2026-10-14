'use client';

import { useSettings } from '@/contexts/settings-context';
import { clockLabel, dayLabel, useNextOpen } from '@/hooks/use-next-open';

/** The next three free starts for a visit (live). Quietly says so when there are none. */
export function NextTimes({ slug, mode }: { slug: string; mode: 'clinic' | 'video' | null }) {
	const { timeFormat } = useSettings();
	const { times, loading, error, timezone } = useNextOpen({ slug, mode, count: 3 });

	if (loading) {
		return (
			<div className="flex gap-2" aria-label="Finding the next free times">
				{[0, 1, 2].map((i) => (
					<span key={i} className="h-8 w-24 animate-pulse rounded-full bg-cream-deep/70" />
				))}
			</div>
		);
	}
	if (error || times.length === 0) {
		return <p className="text-[13px] text-ink-muted">See all times when you book.</p>;
	}
	return (
		<ul className="flex flex-wrap gap-2" aria-label="Next free times">
			{times.map((t) => (
				<li key={t.start.toISOString() + t.locationId} className="tabular inline-flex items-center gap-1.5 rounded-full border border-sage/50 bg-sage-soft px-3 py-1.5 text-[12px] text-sage-deep">
					<span className="h-1.5 w-1.5 rounded-full bg-sage-deep" aria-hidden />
					{dayLabel(t.start, timezone)} {clockLabel(t.start, timezone, timeFormat)}
					{t.locationTitle ? <span className="text-sage-deep/70">· {t.locationTitle}</span> : null}
				</li>
			))}
		</ul>
	);
}
