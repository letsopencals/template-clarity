'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import type { CurrentAvailabilitySlot } from '@opencals/storefront-sdk';
import { fetcher } from '@/lib/fetcher';
import { useLocation } from '@/contexts/location-context';
import { useTimezone } from '@/contexts/timezone-context';
import { useHydrated } from '@/hooks/use-hydrated';

export interface OpenTime {
	/** Slot start as an instant. */
	start: Date;
	/** YYYY-MM-DD the slot was listed under (store calendar). */
	date: string;
	/** First matching location for the requested mode. */
	locationId: string | null;
	locationTitle: string | null;
	online: boolean;
}

export interface UseNextOpenOptions {
	/** Variant slug; null = don't fetch. */
	slug: string | null;
	/** 'clinic' keeps physical locations, 'video' keeps the online one; null = either. */
	mode?: 'clinic' | 'video' | null;
	/** How many upcoming starts to return. */
	count?: number;
}

const SWR_OPTS = { revalidateOnFocus: false, shouldRetryOnError: false } as const;

function cleanTitle(title: string | null | undefined): string | null {
	if (!title) return null;
	// "Clear Care Medical — Chicago" → "Chicago"
	const parts = title.split(/\s+[—–-]\s+/);
	return parts.length > 1 ? parts[parts.length - 1]! : title;
}

/**
 * The next free start(s) for a visit — the "Next open: Today 14:30 · Chicago"
 * chips on the home hero and Care Finder results. Client-only by design
 * (availability is live and the visitor's timezone matters): it waits for
 * hydration, reads the merged open days, then the slots of the first two open
 * days in parallel. Errors resolve to an empty list so callers can hide quietly.
 */
export function useNextOpen({ slug, mode = null, count = 1 }: UseNextOpenOptions) {
	const hydrated = useHydrated();
	const { timezone } = useTimezone();
	const { locations } = useLocation();

	const rangesKey = hydrated && slug ? `/api/products/${slug}/availability-ranges?${new URLSearchParams({ timezone })}` : null;
	const ranges = useSWR<{ dates: string[] }>(rangesKey, fetcher, SWR_OPTS);

	const dates = ranges.data?.dates ?? [];
	const today = new Date().toISOString().slice(0, 10);
	const upcoming = dates.filter((d) => d >= today);
	const dayKey = (d: string | undefined) =>
		slug && d ? `/api/products/${slug}/availability?${new URLSearchParams({ date: d, timezone })}` : null;

	const first = useSWR<CurrentAvailabilitySlot[]>(dayKey(upcoming[0]), fetcher, SWR_OPTS);
	const second = useSWR<CurrentAvailabilitySlot[]>(dayKey(upcoming[1]), fetcher, SWR_OPTS);

	const times = useMemo<OpenTime[]>(() => {
		const byId = new Map(locations.map((l) => [l.id, l]));
		const now = Date.now();
		const slots = [...(Array.isArray(first.data) ? first.data : []), ...(Array.isArray(second.data) ? second.data : [])];
		const out: OpenTime[] = [];
		for (const s of slots) {
			const start = new Date(`${s.fromDate}T${s.fromTime}Z`);
			if (Number.isNaN(start.getTime()) || start.getTime() <= now) continue;
			const candidates = (s.locationIds ?? []).map((id) => byId.get(id)).filter((l) => !!l);
			const match = candidates.find((l) =>
				mode === 'video' ? l.type === 'online' : mode === 'clinic' ? l.type !== 'online' : true,
			);
			// With a mode, a known location must match; while locations are still
			// loading, accept the slot unlabelled rather than hide it.
			if (mode !== null && !match && locations.length > 0) continue;
			out.push({
				start,
				date: s.fromDate,
				locationId: match?.id ?? s.locationIds?.[0] ?? null,
				locationTitle: match ? (match.type === 'online' ? 'Video visit' : cleanTitle(match.title)) : null,
				online: match?.type === 'online',
			});
			if (out.length >= count) break;
		}
		return out.sort((a, b) => a.start.getTime() - b.start.getTime());
	}, [first.data, second.data, locations, mode, count]);

	const loading = !hydrated || (!!slug && (ranges.isLoading || first.isLoading || second.isLoading));
	const error = !!(ranges.error || first.error);
	return { times, loading, error, timezone };
}

/** "Today", "Tomorrow" or "Thu 16 Oct", in the visitor's timezone. */
export function dayLabel(start: Date, timezone: string, now = new Date()): string {
	const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' });
	const d = fmt.format(start);
	if (d === fmt.format(now)) return 'Today';
	if (d === fmt.format(new Date(now.getTime() + 86_400_000))) return 'Tomorrow';
	return new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'short', day: 'numeric', month: 'short' }).format(start);
}

/** "2:30 PM" / "14:30" in the visitor's timezone. */
export function clockLabel(start: Date, timezone: string, format: '12H' | '24H'): string {
	return new Intl.DateTimeFormat('en-US', { timeZone: timezone, hour: 'numeric', minute: '2-digit', hour12: format === '12H' }).format(start);
}
