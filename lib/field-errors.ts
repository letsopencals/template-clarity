import type { OpencalsApiError } from '@opencals/storefront-sdk';

/** The API's field validation errors, as `/api/*` routes pass them on in `fieldErrors`. */
export type ApiFieldErrors = NonNullable<OpencalsApiError['errors']>;

/** The phone format the API accepts, shown as a hint and as the client-side check's message. */
export const PHONE_HINT = 'Include your country code, e.g. +1 917 482 3051';

/** The client-side phone check: a number without its country code. The API stays the source of truth. */
export function phoneFormatError(value: string): string | undefined {
	const v = value.trim();
	return v && !v.startsWith('+') ? PHONE_HINT : undefined;
}

const ADDRESS_GROUPS = ['billingAddress', 'deliveryAddress'];

/**
 * The form field an API error path belongs to, matched on its last segments: `customer.billingAddress.city` →
 * `billingAddress.city`, `customer.phone` / `phone` → `phone`. Address paths are matched before single fields, so
 * an address phone never lands on the contact phone by accident.
 */
export function fieldKeyOf(property: string): string {
	const parts = property.split('.');
	const last = parts[parts.length - 1] ?? property;
	const parent = parts[parts.length - 2];
	return parent && ADDRESS_GROUPS.includes(parent) ? `${parent}.${last}` : last;
}

/** Validation messages keyed by form field (see `fieldKeyOf`), several messages for one field joined. */
export function groupFieldErrors(errors: ApiFieldErrors | undefined): Record<string, string> {
	const out: Record<string, string> = {};
	for (const { property, messages } of errors ?? []) {
		const text = messages.filter(Boolean).join(' ');
		if (!text) continue;
		const key = fieldKeyOf(property);
		out[key] = out[key] ? `${out[key]} ${text}` : text;
	}
	return out;
}

/**
 * Field errors from a route's error JSON: the API's `fieldErrors` list, or else the older `errors` record
 * (path → message) for routes that only send that.
 */
export function fieldErrorsOf(data: { fieldErrors?: unknown; errors?: unknown } | null | undefined): Record<string, string> {
	if (Array.isArray(data?.fieldErrors)) return groupFieldErrors(data.fieldErrors as ApiFieldErrors);
	const out: Record<string, string> = {};
	if (data?.errors && typeof data.errors === 'object') {
		for (const [k, v] of Object.entries(data.errors as Record<string, unknown>)) {
			const msg = Array.isArray(v) ? v[0] : v;
			if (typeof msg === 'string' && msg) out[fieldKeyOf(k)] = msg;
		}
	}
	return out;
}
