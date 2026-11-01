import { OpencalsApiError } from '@opencals/storefront-sdk';
import { NextResponse } from 'next/server';

/** A string field from the API's error body, e.g. `orderId` (409 CART_ALREADY_CHECKED_OUT) or `paymentStatus` (402 PAYMENT_NOT_AUTHORIZED). */
function bodyString(err: OpencalsApiError, key: string): string | undefined {
	const value = err.body?.[key];
	return typeof value === 'string' ? value : undefined;
}

export function handleApiError(err: unknown, fallbackMessage = 'Internal server error') {
	if (err instanceof OpencalsApiError) {
		const fieldErrors = err.toFieldErrors();
		const orderId = bodyString(err, 'orderId');
		const paymentStatus = bodyString(err, 'paymentStatus');
		return NextResponse.json(
			{
				error: err.message,
				...(err.code && { code: err.code }),
				...(orderId && { orderId }),
				...(paymentStatus && { paymentStatus }),
				...(Object.keys(fieldErrors).length > 0 && { errors: fieldErrors }),
			},
			{ status: err.status },
		);
	}

	console.error(fallbackMessage, err);
	return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}
