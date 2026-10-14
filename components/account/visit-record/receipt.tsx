'use client';

import Link from 'next/link';
import { formatPrice } from '@/lib/format';
import { InvoiceList } from '@/components/account/invoice-list';
import { usePersonFilter } from '@/components/account/use-care';
import { serviceTitle } from '@/components/account/care-utils';
import type { CareVisit } from '@/components/account/care-types';

const PAYMENT_LABEL: Record<NonNullable<CareVisit['charge']>['paymentStatus'], string> = {
	paid: 'Paid',
	'partially-paid': 'Part paid',
	unpaid: 'To pay at the clinic',
};

const PROVIDER_LABEL: Record<string, string> = {
	stripe: 'card',
	cash: 'in clinic',
	bank_transfer: 'bank transfer',
	shopify: 'online',
	no_payment_required: 'no payment needed',
};

function Line({ label, value, strong, muted }: { label: string; value: string; strong?: boolean; muted?: boolean }) {
	return (
		<div className={`flex items-baseline text-sm ${strong ? 'font-semibold text-ink' : muted ? 'text-ink-muted' : 'text-ink'}`}>
			<span className="min-w-0 truncate">{label}</span>
			<span aria-hidden className="leader-line" />
			<span className="tabular shrink-0">{value}</span>
		</div>
	);
}

/** Itemised receipt for this visit, plus invoices for its order. */
export function Receipt({ visit }: { visit: CareVisit }) {
	const { hrefWith } = usePersonFilter();
	const c = visit.charge;
	if (!c) return null;
	const cur = c.currency;
	const providers = c.providers.map((p) => PROVIDER_LABEL[p] ?? p).join(', ');
	return (
		<section aria-labelledby="receipt-title" className="paper p-5 sm:p-6">
			<div className="flex items-baseline justify-between gap-3">
				<h2 id="receipt-title" className="eyebrow text-ink-dim">
					Receipt
				</h2>
				<span className="text-xs font-semibold text-sage-deep">{PAYMENT_LABEL[c.paymentStatus]}</span>
			</div>
			<div className="mt-4 space-y-2">
				<Line label={serviceTitle(visit)} value={formatPrice(c.originalSubtotal, cur)} />
				{visit.addOns.map((a) => (
					<Line key={a.id} label={`${a.title}${a.quantity > 1 ? ` × ${a.quantity}` : ''}`} value={formatPrice(a.price * a.quantity, cur)} muted />
				))}
				{c.totalDiscount ? <Line label="Discount" value={`−${formatPrice(c.totalDiscount, cur)}`} muted /> : null}
				{c.totalTax + c.addOnTotalTax ? <Line label={c.taxesIncluded ? 'Tax (included)' : 'Tax'} value={formatPrice(c.totalTax + c.addOnTotalTax, cur)} muted /> : null}
			</div>
			<div className="perforation my-4" />
			<Line label={`Order ${c.orderName}`} value={formatPrice(c.orderTotal, cur)} strong />
			{c.paidTotal ? <Line label={`Paid${providers ? ` · ${providers}` : ''}`} value={formatPrice(c.paidTotal, cur)} muted /> : null}
			{c.refundedTotal ? <Line label="Refunded" value={formatPrice(c.refundedTotal, cur)} muted /> : null}
			{c.balance > 0 ? <Line label="Still to pay" value={formatPrice(c.balance, cur)} strong /> : null}

			<div className="mt-6 border-t border-line pt-4">
				<p className="eyebrow text-ink-dim">Invoices</p>
				<InvoiceList orderId={c.orderId} className="mt-1" />
				<Link href={hrefWith(`/account/orders/${c.orderId}`)} className="link-underline mt-3 inline-block rounded-sm text-sm font-medium text-steel hover:text-steel-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-steel">
					Full statement
				</Link>
			</div>
		</section>
	);
}
