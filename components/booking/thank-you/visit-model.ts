'use client';

import { useMemo } from 'react';
import moment from 'moment-timezone';
import type { OrderDetailAppointment, OrderDetailResponse } from '@opencals/storefront-sdk';
import { useSettings } from '@/contexts/settings-context';
import { useTimezone } from '@/contexts/timezone-context';
import { useHydrated } from '@/hooks/use-hydrated';
import { getProductImage } from '@/lib/format';
import { getStaffImageUrl, getStaffName } from '@/lib/staff-utils';
import type { CalendarEvent } from '@/lib/calendar';
import { clinicMeta, prepFor, siteConfig, type Prep } from '@/lib/site-config';

/** variant slug → department (collection) slug, from the server. */
export type DepartmentIndex = Record<string, string>;

export interface VisitRow {
	id: string;
	title: string;
	option: string | null;
	department: string | null;
	video: boolean;
	prep: Prep;
	clinicianName: string | null;
	clinicianImage: string | null;
	image: string | null;
	/** Empty until hydrated (times depend on the visitor's timezone for video visits). */
	dateLabel: string;
	timeLabel: string;
	zoneLabel: string;
	/** "Arrive by 9:50" for in-clinic visits. */
	arriveLabel: string | null;
	locationTitle: string | null;
	address: string | null;
	/** Access note from the clinic's photography config ("Step-free entrance · …"). */
	clinicNote: string | null;
	directionsHref: string | null;
	onlineLink: string | null;
	status: string;
	addOns: { id: string; title: string; quantity: number }[];
	event: CalendarEvent;
}

type Location = NonNullable<OrderDetailAppointment['location']>;

function addressOf(a: OrderDetailAppointment, loc: Location | null): string | null {
	if (a.displayAddress) return a.displayAddress;
	if (!loc) return null;
	if (loc.displayAddress) return loc.displayAddress;
	if (loc.address) return loc.address;
	const region = [loc.state, loc.postalCode].filter(Boolean).join(' ');
	const parts = [loc.addressLine1, loc.addressLine2, loc.city, region].filter(Boolean);
	return parts.length ? parts.join(', ') : null;
}

/**
 * The order's visits as pass rows. In-clinic times are shown in the clinic's
 * own timezone (where the patient will be); video visits in the visitor's.
 */
export function useVisitRows(order: OrderDetailResponse | null, departments: DepartmentIndex): VisitRow[] {
	const { settings, timeFormat } = useSettings();
	const { timezone: viewerTimezone } = useTimezone();
	const hydrated = useHydrated();
	const storeTimezone = settings?.settings?.timezone || 'UTC';

	return useMemo(() => {
		if (!order) return [];
		const time = timeFormat === '24H' ? 'HH:mm' : 'h:mm A';
		return (order.lineItems ?? []).flatMap((li, i) => {
			const a = li.appointment;
			if (!a) return [];
			const loc = a.location ?? null;
			const video = loc?.type === 'online';
			const meta = clinicMeta(loc?.slug, i);
			const zone = video ? viewerTimezone : meta.timezone || storeTimezone;
			const from = moment.utc(a.from).tz(zone);
			const to = moment.utc(a.to).tz(zone);
			const department = (a.product?.slug && departments[a.product.slug]) || null;
			const prep = prepFor(department, video);
			const address = loc?.type === 'physical' ? addressOf(a, loc) : null;
			const clinicianName = a.staffMember ? getStaffName(a.staffMember) || null : null;
			const title = a.product?.title ?? 'Visit';
			const option = a.product?.variantTitle && a.product.variantTitle !== 'Default Title' ? a.product.variantTitle : null;
			const description = [
				option,
				clinicianName ? `with ${clinicianName}` : null,
				video ? `Video visit. Your link opens ${siteConfig.videoVisit.joinWindowMinutes} minutes before.` : loc?.title,
			]
				.filter(Boolean)
				.join(' · ');

			return [
				{
					id: a.id ?? `line-${i}`,
					title,
					option,
					department,
					video,
					prep,
					clinicianName,
					clinicianImage: a.staffMember ? getStaffImageUrl(a.staffMember) : null,
					image: getProductImage(a.product),
					dateLabel: hydrated ? from.format('dddd D MMMM YYYY') : '',
					timeLabel: hydrated ? `${from.format(time)}–${to.format(time)}` : '',
					zoneLabel: hydrated ? from.format('z') : '',
					arriveLabel:
						hydrated && !video && prep.arriveEarly > 0
							? `Arrive by ${from.clone().subtract(prep.arriveEarly, 'minutes').format(time)}`
							: null,
					locationTitle: video ? 'Video visit' : (loc?.title ?? null),
					address,
					clinicNote: !video && meta.note ? meta.note : null,
					directionsHref: address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : null,
					onlineLink: video ? (loc?.link ?? null) : null,
					status: a.status,
					addOns: (li.addOnLineItems ?? []).map((ao, j) => ({
						id: ao.id ?? `${a.id}-addon-${j}`,
						title: ao.addOn?.title ?? 'Add-on',
						quantity: ao.quantity ?? 1,
					})),
					event: {
						uid: a.id ?? `${order.id}-${i}`,
						title: `${title} · ${siteConfig.name}`,
						start: from.valueOf(),
						end: to.valueOf(),
						location: address ?? loc?.link ?? loc?.title ?? undefined,
						description: description || undefined,
					},
				},
			];
		});
	}, [order, departments, timeFormat, viewerTimezone, storeTimezone, hydrated]);
}
