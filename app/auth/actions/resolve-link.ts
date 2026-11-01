'use server';

import '@/lib/opencals';
import { AuthService, OpencalsApiError } from '@opencals/storefront-sdk';
import type { MagicLinkErrorCode, MagicLinkErrorResponse } from '@opencals/storefront-sdk';
import { signIn } from '@/lib/auth';

export type ResolveLinkResult = {
	success: boolean;
	error?: string;
	errorCode?: MagicLinkErrorCode;
	redirectPath?: string;
};

const MAGIC_LINK_CODES: readonly unknown[] = ['TOKEN_INVALID', 'TOKEN_USED', 'TOKEN_EXPIRED'] satisfies MagicLinkErrorCode[];
const isMagicLinkCode = (code: unknown): code is MagicLinkErrorCode => MAGIC_LINK_CODES.includes(code);

/** The `code` the backend sends with a rejected link (thrown OpencalsApiError, or the returned error body). */
function magicLinkCode(err: unknown): MagicLinkErrorCode | undefined {
	const code = err instanceof OpencalsApiError ? err.code : err && typeof err === 'object' ? (err as Partial<MagicLinkErrorResponse>).code : undefined;
	return isMagicLinkCode(code) ? code : undefined;
}

/**
 * Resolves a magic-link token (`/link/{token}`). For most purposes the backend
 * returns session tokens and we sign the customer in; reset-password returns no
 * tokens and only a redirect path carrying the token as a query param.
 */
export async function resolveLink(token: string): Promise<ResolveLinkResult> {
	try {
		// The SDK's error interceptor throws OpencalsApiError, but depending on the
		// client's throwOnError config a failed call may instead resolve with a
		// populated `error`. Handle both so error classification always runs.
		const { data, error } = await AuthService.resolveLink({ query: { token } });
		if (error || !data) throw error ?? new Error('Invalid link');

		if (data.accessToken) {
			await signIn('magic-link', {
				accessToken: data.accessToken,
				refreshToken: data.refreshToken,
				redirect: false,
			});
		}

		return { success: true, redirectPath: data.redirectPath };
	} catch (err) {
		const message =
			err && typeof err === 'object' && 'message' in err
				? String((err as { message: unknown }).message)
				: 'Invalid link';
		// Prefer the API's `code`; older backends only said it in the message.
		let errorCode = magicLinkCode(err);
		if (!errorCode) {
			if (message.includes('expired')) errorCode = 'TOKEN_EXPIRED';
			else if (message.includes('used')) errorCode = 'TOKEN_USED';
			else errorCode = 'TOKEN_INVALID';
		}
		return { success: false, error: message, errorCode };
	}
}
