import type { PaymentInstructions, StorefrontAppointmentPendingReason } from '@opencals/storefront-sdk';

/**
 * Where a booking stands after checkout. A visit only waits when it is
 * `pending` WITH a `pendingReason`: on clinics that confirm automatically a
 * visit is briefly `pending` with no reason while a background job confirms
 * it, and that reads as confirmed.
 */
export type VisitOutcome = 'confirmed' | 'awaiting_payment' | 'awaiting_approval';

type OutcomeInput = { status?: string | null; pendingReason?: StorefrontAppointmentPendingReason | null } | null | undefined;

export function outcomeOf(appointments: OutcomeInput[]): VisitOutcome {
	const waiting = appointments.filter((a) => a?.status === 'pending' && a.pendingReason).map((a) => a!.pendingReason);
	if (waiting.includes('awaiting_payment')) return 'awaiting_payment';
	if (waiting.includes('awaiting_approval')) return 'awaiting_approval';
	return 'confirmed';
}

/**
 * What checkout submit told us that the order read-back can't: the payment
 * instructions for manual methods (bank transfer, invoice, pay in clinic).
 * Kept in sessionStorage for the visit pass, keyed by order id.
 */
export interface CheckoutReceipt {
	orderId: string;
	/** The order number ("#1042"): the payment reference for bank transfers. */
	orderName: string | null;
	outcome: VisitOutcome;
	paymentInstructions: PaymentInstructions | null;
	savedAt: number;
}

const KEY = 'clarity:checkout-receipt';
const MAX_AGE = 6 * 60 * 60 * 1000;

export function saveCheckoutReceipt(receipt: Omit<CheckoutReceipt, 'savedAt'>): void {
	try {
		sessionStorage.setItem(KEY, JSON.stringify({ ...receipt, savedAt: Date.now() }));
	} catch {
		/* private mode: the pass falls back to "check your email" */
	}
}

export function readCheckoutReceipt(orderId: string | null): CheckoutReceipt | null {
	if (!orderId) return null;
	try {
		const raw = sessionStorage.getItem(KEY);
		if (!raw) return null;
		const r = JSON.parse(raw) as CheckoutReceipt;
		return r.orderId === orderId && Date.now() - r.savedAt < MAX_AGE ? r : null;
	} catch {
		return null;
	}
}

/** Only ever link out to an https invoice page. */
export function safeInvoiceUrl(url: string | null | undefined): string | null {
	return typeof url === 'string' && url.startsWith('https://') ? url : null;
}
