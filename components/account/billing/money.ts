import type { OrderListItemResponse } from '@opencals/storefront-sdk';

/** Statement money: zero shows as an amount, not "Free". */
export function money(amount: number, currency: string): string {
	try {
		return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(amount);
	} catch {
		return amount.toFixed(2);
	}
}

export type PaymentTone = 'paid' | 'due' | 'refund';

/** One calm word for where a statement stands. */
export function statementStatus(o: Pick<OrderListItemResponse, 'paymentStatus' | 'refundStatus' | 'balance' | 'total'>): { label: string; tone: PaymentTone } {
	if (o.refundStatus === 'fully-refunded') return { label: 'Refunded', tone: 'refund' };
	if (o.refundStatus === 'partially-refunded') return { label: 'Part refunded', tone: 'refund' };
	if (o.refundStatus === 'refund-owed') return { label: 'Refund on its way', tone: 'refund' };
	if (o.total === 0) return { label: 'No charge', tone: 'paid' };
	if (o.paymentStatus === 'paid') return { label: 'Paid', tone: 'paid' };
	if (o.paymentStatus === 'partially-paid') return { label: 'Part paid', tone: 'due' };
	return { label: 'To pay', tone: 'due' };
}

export const TONE_CLASS: Record<PaymentTone, string> = {
	paid: 'bg-sage-soft text-sage-deep',
	due: 'bg-honey-soft text-oak',
	refund: 'bg-steel-tint text-steel-deep',
};

export const PROVIDER_LABEL: Record<string, string> = {
	stripe: 'Card',
	cash: 'In clinic',
	bank_transfer: 'Bank transfer',
	shopify: 'Online',
	no_payment_required: 'No payment needed',
};
