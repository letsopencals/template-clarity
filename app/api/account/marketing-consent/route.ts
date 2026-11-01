import '@/lib/opencals';
import { SelfService, type MarketingConsentResponse } from '@opencals/storefront-sdk';
import { requireAuth } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import type { CareConsent } from '@/components/account/care-types';

function toConsent(data: Partial<Pick<MarketingConsentResponse, 'emailState' | 'smsState' | 'whatsappState'>> | null | undefined): CareConsent {
	return {
		email: data?.emailState ?? 'not_subscribed',
		sms: data?.smsState ?? 'not_subscribed',
		whatsapp: data?.whatsappState ?? 'not_subscribed',
	};
}

/** The patient's communication preferences, per channel. */
export async function GET() {
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	try {
		const { data } = await SelfService.getMarketingConsent({ headers: auth.headers, throwOnError: true });
		return NextResponse.json(toConsent(data));
	} catch (err) {
		return handleApiError(err);
	}
}

/** `{ email?: boolean, sms?: boolean, whatsapp?: boolean }` — only the channels sent change. */
export async function PUT(request: NextRequest) {
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	try {
		const raw = (await request.json()) as Record<string, unknown>;
		const body: { email?: boolean; sms?: boolean; whatsapp?: boolean } = {};
		for (const k of ['email', 'sms', 'whatsapp'] as const) if (typeof raw[k] === 'boolean') body[k] = raw[k] as boolean;
		const { data } = await SelfService.updateMarketingConsent({ body, headers: auth.headers, throwOnError: true });
		return NextResponse.json(toConsent(data));
	} catch (err) {
		return handleApiError(err);
	}
}
