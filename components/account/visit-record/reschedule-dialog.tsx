'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import moment from 'moment-timezone';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { fetcher } from '@/lib/fetcher';
import { onSessionExpired } from '@/lib/session-expired';
import { siteConfig } from '@/lib/site-config';
import { useTimezone } from '@/contexts/timezone-context';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { useNow } from '@/hooks/use-now';
import { Notice } from '@/components/auth/auth-feedback';
import { Bone } from '@/components/account/skeletons';
import { DayRibbon, ribbonDays } from '@/components/account/visit-record/day-ribbon';
import { SlotList, type SlotOption } from '@/components/account/visit-record/slot-list';
import { serviceTitle } from '@/components/account/care-utils';
import type { CareVisit } from '@/components/account/care-types';

interface AvailabilitySlot {
	fromDate: string;
	fromTime: string;
	toDate: string;
	toTime: string;
	staffMemberIds?: string[];
	locationIds?: string[];
	attendees?: number;
	maxAttendees?: number;
}

const SWR_OPTIONS = { revalidateOnFocus: false, keepPreviousData: false } as const;
const UTC_FMT = 'YYYY-MM-DD HH:mm:ss';

function utcKey(date: string, time: string): string {
	return moment.utc(`${date} ${time}`, ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm']).format(UTC_FMT);
}

/**
 * Move a visit: same service, clinician and place, a new time. Availability
 * excludes this appointment so its own slot shows as free ("current").
 */
export function RescheduleDialog({ visit, open, onClose, onDone }: { visit: CareVisit; open: boolean; onClose: () => void; onDone: (fromIso: string) => void }) {
	const { timezone } = useTimezone();
	const { parseSlotDateTime, formatCustom } = useDateFormatter();
	const now = useNow();
	const nowMs = now?.getTime() ?? null;
	const days = useMemo(() => (nowMs ? ribbonDays(timezone, nowMs) : []), [timezone, nowMs]);
	const currentDay = moment.utc(visit.from).tz(timezone).format('YYYY-MM-DD');
	const [day, setDay] = useState<string | null>(null);
	const selectedDay = day ?? (days.includes(currentDay) ? currentDay : (days[0] ?? null));
	const [slotKey, setSlotKey] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const query = useMemo(() => {
		if (!open || !selectedDay) return null;
		const p = new URLSearchParams({ productId: visit.product.id, date: selectedDay, timezone, excludeAppointmentId: visit.id });
		if (visit.clinician) p.set('staffMemberId', visit.clinician.id);
		if (visit.place) p.set('locationId', visit.place.id);
		return `/api/availability?${p.toString()}`;
	}, [open, selectedDay, timezone, visit.product.id, visit.id, visit.clinician, visit.place]);

	const { data, isLoading, error: loadError } = useSWR<AvailabilitySlot[]>(query, fetcher, SWR_OPTIONS);

	const currentKey = moment.utc(visit.from).format(UTC_FMT);
	const options = useMemo<{ slots: SlotOption[]; raw: Map<string, AvailabilitySlot> }>(() => {
		const raw = new Map<string, AvailabilitySlot>();
		const slots: SlotOption[] = [];
		for (const s of data ?? []) {
			const full = s.maxAttendees != null && s.attendees != null && s.attendees >= s.maxAttendees;
			const key = utcKey(s.fromDate, s.fromTime);
			const start = parseSlotDateTime(s.fromDate, s.fromTime);
			if (start.format('YYYY-MM-DD') !== selectedDay) continue;
			if (nowMs && start.valueOf() <= nowMs) continue;
			if (full && key !== currentKey) continue;
			if (raw.has(key)) continue;
			raw.set(key, s);
			slots.push({ key, start, label: start.format('h:mm A'), current: key === currentKey });
		}
		slots.sort((a, b) => a.start.valueOf() - b.start.valueOf());
		return { slots, raw };
	}, [data, parseSlotDateTime, selectedDay, nowMs, currentKey]);

	const chosen = slotKey ? options.raw.get(slotKey) : undefined;

	const pickDay = (d: string) => {
		setDay(d);
		setSlotKey(null);
		setError(null);
	};

	const confirm = async () => {
		if (!chosen || !slotKey) return;
		setSaving(true);
		setError(null);
		const start = moment.utc(slotKey, UTC_FMT);
		const lengthMs = new Date(visit.to).getTime() - new Date(visit.from).getTime();
		const end = visit.product.allowCustomDuration ? start.clone().add(lengthMs, 'ms') : moment.utc(`${chosen.toDate} ${chosen.toTime}`, ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm']);
		try {
			const res = await fetch(`/api/account/appointments/${visit.id}/reschedule`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					slot: {
						productId: visit.product.id,
						fromDate: start.format('YYYY-MM-DD'),
						fromTime: start.format('HH:mm:ss'),
						toDate: end.format('YYYY-MM-DD'),
						toTime: end.format('HH:mm:ss'),
						staffMemberId: chosen.staffMemberIds?.[0] ?? visit.clinician?.id,
						locationId: chosen.locationIds?.[0] ?? visit.place?.id,
					},
				}),
			});
			if (res.status === 401) {
				onSessionExpired();
				return;
			}
			if (!res.ok) {
				const body = (await res.json().catch(() => null)) as { error?: string } | null;
				setError(body?.error || 'That time was just taken. Please choose another.');
				return;
			}
			onDone(start.toISOString());
		} catch {
			setError('We couldn’t reach the clinic. Please try again.');
		} finally {
			setSaving(false);
		}
	};

	const chosenLabel = slotKey ? formatCustom(moment.utc(slotKey, UTC_FMT).toISOString(), 'dddd D MMMM [at] h:mm A') : null;

	return (
		<Dialog
			open={open}
			onClose={onClose}
			size="lg"
			title={
				<>
					Choose a new <em>time</em>
				</>
			}
			description={`${serviceTitle(visit)}${visit.clinician ? ` with ${visit.clinician.name}` : ''} · currently ${formatCustom(visit.from, 'ddd D MMM, h:mm A')}`}
			footer={
				<>
					<Button variant="ghost" onClick={onClose} disabled={saving}>
						Keep my time
					</Button>
					<Button onClick={() => void confirm()} disabled={!chosen || saving}>
						{saving ? 'Moving your visit…' : chosenLabel ? `Move to ${chosenLabel}` : 'Choose a time'}
					</Button>
				</>
			}
		>
			{error ? <Notice className="mb-5">{error}</Notice> : null}
			{days.length && selectedDay ? <DayRibbon days={days} value={selectedDay} onChange={pickDay} currentDay={currentDay} /> : null}
			<div className="mt-5 min-h-48">
				{loadError ? (
					<Notice>We couldn’t load times for this day. Try another, or call us on {siteConfig.contact.phone}.</Notice>
				) : isLoading || !data ? (
					<div role="status" aria-label="Loading times" className="grid grid-cols-3 gap-2 sm:grid-cols-4">
						{Array.from({ length: 8 }, (_, i) => (
							<Bone key={i} className="h-11" />
						))}
					</div>
				) : options.slots.length ? (
					<SlotList slots={options.slots} value={slotKey} onChange={setSlotKey} />
				) : (
					<p className="rounded-card border border-dashed border-line-strong px-5 py-8 text-center text-sm text-ink-muted">
						No free times this day{visit.clinician ? ` with ${visit.clinician.firstName || visit.clinician.name}` : ''}. Try another day.
					</p>
				)}
			</div>
			<p className="mt-6 text-xs text-ink-dim">Times are shown in {timezone.replace(/_/g, ' ')}. We’ll email you the new details.</p>
		</Dialog>
	);
}
