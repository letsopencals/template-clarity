'use client';

import { useMemo } from 'react';
import type { CartItem } from '@opencals/storefront-sdk';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { useSettings } from '@/contexts/settings-context';
import { getProductImage } from '@/lib/format';
import { patientOf, type StoredAnswer } from '@/lib/intake';
import { getStaffImageUrl, getStaffName } from '@/lib/staff-utils';
import type { CartWithDiscounts } from '@/types/discount';

export interface CartAddOnLine {
	id: string;
	title: string;
	quantity: number;
	/** Duration-multiplied add-ons scale with the visit length — no qty controls. */
	durationMultiplied: boolean;
	atMax: boolean;
	price: number;
}

/** Display model for one visit in the cart (drawer card + checkout stack). */
export interface CartLine {
	id: string;
	title: string;
	option: string | null;
	image: string | null;
	clinicianName: string | null;
	clinicianImage: string | null;
	locationTitle: string | null;
	/** Booked at the online location. */
	video: boolean;
	/** Who the visit is for, when the cart carries intake answers. */
	patientName: string | null;
	from: string | null;
	to: string | null;
	/** Base service price for this line, before discounts. */
	price: number;
	/** Base service price after line discounts (equals `price` when none apply). */
	discountedPrice: number;
	addOns: CartAddOnLine[];
}

/**
 * Cart payloads don't carry intake answers today; read them defensively so the
 * patient line appears if the backend ever includes them.
 */
function answersOf(appointment: object | null | undefined): StoredAnswer[] | null {
	if (!appointment || !('checkoutQuestionAnswers' in appointment)) return null;
	const raw: unknown = appointment.checkoutQuestionAnswers;
	return Array.isArray(raw) ? raw.filter((a): a is StoredAnswer => typeof a === 'object' && a !== null) : null;
}

export function toCartLine(item: CartItem): CartLine {
	const appt = item.appointment;
	const product = appt?.product;
	const staff = appt?.staffMember;
	const option = product?.variantTitle?.trim();
	const answers = answersOf(appt);
	return {
		id: item.id,
		title: product?.title ?? 'Visit',
		option: option && option !== 'Default Title' ? option : null,
		image: getProductImage(product),
		clinicianName: staff ? getStaffName(staff) || null : null,
		clinicianImage: staff ? getStaffImageUrl(staff) : null,
		locationTitle: appt?.location?.title ?? null,
		video: appt?.location?.type === 'online',
		patientName: answers ? patientOf(answers).name : null,
		from: appt?.from ?? null,
		to: appt?.to ?? null,
		price: item.originalSubtotal ?? item.originalUnitPrice ?? 0,
		discountedPrice: item.discountedSubtotal ?? item.originalSubtotal ?? item.originalUnitPrice ?? 0,
		addOns: (item.addOnItems ?? []).map((aoi) => {
			const durationMultiplied = aoi.addOn?.durationMultiplied ?? false;
			return {
				id: aoi.id,
				title: aoi.addOn?.title ?? 'Add-on',
				quantity: aoi.quantity,
				durationMultiplied,
				atMax: !durationMultiplied && aoi.addOn?.maxQuantity != null && aoi.quantity >= aoi.addOn.maxQuantity,
				price: aoi.discountedSubtotal,
			};
		}),
	};
}

export function useCartLines(cart: CartWithDiscounts | null): CartLine[] {
	return useMemo(() => (cart?.items ?? []).map((i) => toCartLine(i as CartItem)), [cart]);
}

/** Pre-discount subtotal of every service + add-on line. */
export function cartSubtotal(cart: CartWithDiscounts | null): number {
	return (cart?.items ?? []).reduce((sum, item) => {
		const addOns = (item.addOnItems ?? []).reduce((a, ao) => a + (ao.originalSubtotal ?? 0), 0);
		return sum + (item.originalSubtotal ?? item.originalUnitPrice ?? 0) + addOns;
	}, 0);
}

/**
 * Date + time formatters for appointment cards, in the visitor's chosen
 * timezone (footer selector) and the store's 12/24h preference. Callers must
 * only render the output after hydration (`useHydrated`).
 */
export function useAppointmentFormat() {
	const { formatCustom } = useDateFormatter();
	const { timeFormat } = useSettings();
	const timePattern = timeFormat === '24H' ? 'HH:mm' : 'h:mm A';

	const date = (iso: string | null) => (iso ? formatCustom(iso, 'ddd D MMM') : '');
	const time = (from: string | null, to: string | null) =>
		from ? `${formatCustom(from, timePattern)}${to ? `–${formatCustom(to, timePattern)}` : ''}` : '';
	const zone = (iso: string | null) => (iso ? formatCustom(iso, 'z') : '');
	return { date, time, zone };
}
