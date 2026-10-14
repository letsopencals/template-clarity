'use client';

import Link from 'next/link';
import { clsx } from 'clsx';
import { useSettings } from '@/contexts/settings-context';
import { clockLabel, dayLabel, useNextOpen } from '@/hooks/use-next-open';
import { bookingHref } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';

const SLUG = siteConfig.careFinder.fallbackService;

/**
 * "Next open appointment · Today 2:30 PM · Chicago" — live, client-only (the
 * visitor's clock and timezone), hidden quietly if availability can't load.
 */
export function NextOpenChip({ className }: { className?: string }) {
	const { timeFormat } = useSettings();
	const { times, loading, error, timezone } = useNextOpen({ slug: SLUG, mode: 'clinic' });
	const next = times[0];

	if (error || (!loading && !next)) return null;

	return (
		<div className={clsx('paper flex items-center gap-3 rounded-full py-2 pl-3.5 pr-2 shadow-float', className)} aria-live="polite">
			<span className="live-dot shrink-0" aria-hidden />
			{next ? (
				<>
					<span className="min-w-0 text-[13px] leading-tight text-ink-muted">
						<span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-dim">Next open appointment</span>
						<span className="tabular block truncate text-ink">
							{dayLabel(next.start, timezone)} {clockLabel(next.start, timezone, timeFormat)}
							{next.locationTitle ? <span className="text-ink-muted"> · {next.locationTitle}</span> : null}
						</span>
					</span>
					<Link
						href={bookingHref(SLUG, { mode: 'clinic' })}
						className="shrink-0 rounded-full bg-steel px-3.5 py-2 text-[12px] font-semibold text-paper transition-colors hover:bg-steel-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel/40"
					>
						Book
					</Link>
				</>
			) : (
				<span className="flex flex-col gap-1.5 py-1 pr-3" aria-label="Finding the next open appointment">
					<span className="h-2 w-28 animate-pulse rounded-full bg-cream-deep" />
					<span className="h-2.5 w-40 animate-pulse rounded-full bg-cream-deep" />
				</span>
			)}
		</div>
	);
}
