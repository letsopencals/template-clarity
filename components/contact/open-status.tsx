'use client';

import { clsx } from 'clsx';
import { useNow } from '@/hooks/use-now';
import { useSettings } from '@/contexts/settings-context';
import { formatClock, openStateAt, parseOpeningHours } from '@/lib/opening-hours';
import { siteConfig } from '@/lib/site-config';

const WEEK = parseOpeningHours(siteConfig.contact.hours);

/** The wall-clock time in `timeZone`, as a Date whose local fields read that time. */
function zonedNow(now: Date, timeZone: string | undefined): Date {
	if (!timeZone) return now;
	try {
		const parts = new Intl.DateTimeFormat('en-US', {
			timeZone,
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			hourCycle: 'h23',
		}).formatToParts(now);
		const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
		return new Date(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'));
	} catch {
		return now;
	}
}

/**
 * "Open now · closes 5 PM" for a clinic, in the clinic's own timezone. Renders
 * a neutral placeholder until hydrated (it depends on the visitor's clock).
 */
export function OpenStatus({ timezone, className, tone = 'ink' }: { timezone?: string; className?: string; tone?: 'ink' | 'light' }) {
	const now = useNow();
	const { timeFormat } = useSettings();
	const light = tone === 'light';
	if (!now) return <span className={clsx('inline-block h-6 w-36 rounded-full', light ? 'bg-paper/15' : 'bg-cream-deep/70', className)} aria-hidden />;
	const state = openStateAt(WEEK, zonedNow(now, timezone));
	const open = state.kind === 'open';
	const text =
		state.kind === 'open'
			? `Open now · closes ${formatClock(state.until, timeFormat)}`
			: state.kind === 'later'
				? `Opens today at ${formatClock(state.from, timeFormat)}`
				: state.next
					? `Closed · opens ${state.next.short} ${formatClock(state.next.open ?? 0, timeFormat)}`
					: 'Closed';
	return (
		<span
			className={clsx(
				'inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-medium',
				open ? (light ? 'bg-sage/25 text-paper' : 'bg-sage-soft text-sage-deep') : light ? 'bg-paper/15 text-paper/80' : 'bg-cream text-ink-muted',
				className,
			)}
		>
			{open ? <span className="live-dot" aria-hidden /> : <span className="h-2 w-2 rounded-full bg-ink-dim" aria-hidden />}
			{text}
		</span>
	);
}
