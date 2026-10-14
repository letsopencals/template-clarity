/** Result of a JSON POST/PUT to the template's own `/api/*` routes. */
export type PostResult = { ok: true } | { ok: false; status: number; message: string; fields: Record<string, string> };

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
		const data = (await res.json().catch(() => ({}))) as { error?: unknown; message?: unknown; errors?: Record<string, unknown> };
		const fields: Record<string, string> = {};
		for (const [k, v] of Object.entries(data.errors ?? {})) {
			const msg = Array.isArray(v) ? v[0] : v;
			if (typeof msg === 'string') fields[k] = msg;
		}
		const raw = typeof data.error === 'string' ? data.error : typeof data.message === 'string' ? data.message : '';
		return { ok: false, status: res.status, message: raw || 'Something went wrong. Please try again.', fields };
	} catch {
		return { ok: false, status: 0, message: 'We couldn’t reach the clinic. Check your connection and try again.', fields: {} };
	}
}
