import { OpencalsApiError } from '@opencals/storefront-sdk';
import type { CheckoutErrorResponse } from '@opencals/storefront-sdk';
import { NextResponse } from 'next/server';

const str = (value: unknown): string | undefined => (typeof value === 'string' ? value : undefined);

export function handleApiError(err: unknown, fallbackMessage = 'Internal server error') {
	if (err instanceof OpencalsApiError) {
		const fieldErrors = err.toFieldErrors();
		// Checkout errors carry `orderId` (409 CART_ALREADY_CHECKED_OUT) or `paymentStatus` (402 PAYMENT_NOT_AUTHORIZED).
		const body: Partial<CheckoutErrorResponse> = err.body ?? {};
		const orderId = str(body.orderId);
		const paymentStatus = str(body.paymentStatus);
		return NextResponse.json(
			{
				error: err.message,
				...(err.code && { code: err.code }),
				...(orderId && { orderId }),
				...(paymentStatus && { paymentStatus }),
				...(Object.keys(fieldErrors).length > 0 && { errors: fieldErrors }),
				// The API's list as is (full dotted paths), so forms can put each message under its field.
				...(err.errors?.length && { fieldErrors: err.errors }),
			},
			{ status: err.status },
		);
	}

	console.error(fallbackMessage, err);
	return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}
