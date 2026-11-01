import { fieldErrorsOf } from '@/lib/field-errors';

/** Result of a JSON POST/PUT to the template's own `/api/*` routes. */
export type PostResult =
	| { ok: true }
	/** `fields`: validation messages keyed by form field (`phone`, `billingAddress.city`, …), see `fieldErrorsOf`. */
	| { ok: false; status: number; message: string; fields: Record<string, string> };

/**
 * Sends JSON and reports success by status (204 counts), unlike
 * `useFormSubmit`, which returns `null` for both 204 and failure.
 */
export async function sendJson(url: string, body: unknown, method: 'POST' | 'PUT' = 'POST'): Promise<PostResult> {
	try {
		const res = await fetch(url, {
			method,
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		});
		if (res.ok) return { ok: true };
		const data = (await res.json().catch(() => ({}))) as { error?: unknown; message?: unknown; errors?: unknown; fieldErrors?: unknown };
		const fields = fieldErrorsOf(data);
		const raw = typeof data.error === 'string' ? data.error : typeof data.message === 'string' ? data.message : '';
		return { ok: false, status: res.status, message: raw || 'Something went wrong. Please try again.', fields };
	} catch {
		return { ok: false, status: 0, message: 'We couldn’t reach the clinic. Check your connection and try again.', fields: {} };
	}
}
