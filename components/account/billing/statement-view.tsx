'use client';

import Link from 'next/link';
import useSWR from 'swr';
import type { OrderDetailLineItem, OrderDetailResponse } from '@opencals/storefront-sdk';
import { fetcher } from '@/lib/fetcher';
import { useHydrated } from '@/hooks/use-hydrated';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { InvoiceList } from '@/components/account/invoice-list';
import { RecordSkeleton } from '@/components/account/skeletons';
import { LoadError } from '@/components/account/empty-state';
import { money, PROVIDER_LABEL, statementStatus, TONE_CLASS } from '@/components/account/billing/money';

const SWR_OPTIONS = { revalidateOnFocus: false } as const;

const TX_LABEL: Record<string, string> = {
	sale: 'Payment',
	capture: 'Payment',
	authorization: 'Card held',
	refund: 'Refund',
	void: 'Hold released',
};

function Line({ label, value, strong, muted, href }: { label: string; value: string; strong?: boolean; muted?: boolean; href?: string }) {
	return (
		<div className={`flex items-baseline text-sm ${strong ? 'font-semibold text-ink' : muted ? 'text-ink-muted' : 'text-ink'}`}>
			{href ? (
				<Link href={href} className="min-w-0 truncate rounded-sm underline-offset-4 hover:text-steel hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-steel">
					{label}
				</Link>
			) : (
				<span className="min-w-0 truncate">{label}</span>
			)}
			<span aria-hidden className="leader-line" />
			<span className="tabular shrink-0">{value}</span>
		</div>
	);
}

function VisitLines({ line, currency, hydrated }: { line: OrderDetailLineItem; currency: string; hydrated: boolean }) {
	const { formatCustom } = useDateFormatter();
	const a = line.appointment;
	const title = [a?.product?.title, a?.product?.variantTitle && a.product.variantTitle !== 'Default' ? a.product.variantTitle : null].filter(Boolean).join(' · ') || 'Visit';
	const who = a?.staffMember ? `${a.staffMember.firstName} ${a.staffMember.lastName}`.trim() : null;
	return (
		<div className="space-y-2 border-b border-line pb-4 last:border-b-0 last:pb-0">
			<p className="eyebrow text-ink-dim">
				<span className="tabular">{hydrated && a ? formatCustom(a.from, 'ddd D MMM YYYY · h:mm A') : ' '}</span>
				{who ? (
					<>
						<span aria-hidden className="mx-2 text-brass">
							·
						</span>
						{who}
					</>
				) : null}
			</p>
			<Line label={title} value={money(line.originalSubtotal, currency)} href={line.appointmentId ? `/account/appointments/${line.appointmentId}` : undefined} />
			{line.addOnLineItems.map((ad) => (
				<Line
					key={ad.id}
					label={`${ad.addOn?.title ?? 'Add-on'}${ad.quantity > 1 ? ` × ${ad.quantity}` : ''}`}
					value={money(ad.originalSubtotal, currency)}
					muted
				/>
			))}
			{line.totalDiscount ? <Line label="Discount" value={`−${money(line.totalDiscount, currency)}`} muted /> : null}
		</div>
	);
}

/** One itemised statement: visits, add-ons, tax, payments, refunds and invoices. */
export function StatementView({ orderId }: { orderId: string }) {
	const { data: order, error, isLoading, mutate } = useSWR<OrderDetailResponse>(`/api/account/orders/${orderId}`, fetcher, SWR_OPTIONS);
	const hydrated = useHydrated();
	const { formatCustom } = useDateFormatter();

	const back = (
		<Link
			href="/account/orders"
			className="inline-flex items-center gap-2 rounded-sm text-sm text-ink-muted transition-colors hover:text-steel focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-steel"
		>
			<svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.6}>
				<path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
			All statements
		</Link>
	);

	if (error && !order) {
		return (
			<div className="space-y-6">
				{back}
				<LoadError what="this statement" onRetry={() => void mutate()} />
			</div>
		);
	}
	if (isLoading || !order) {
		return (
			<div className="space-y-6">
				{back}
				<RecordSkeleton />
			</div>
		);
	}

	const cur = order.paymentCurrencyCode;
	const status = statementStatus(order);
	const tax = order.lineItems.reduce((s, l) => s + l.totalTax + l.addOnTotalTax, 0);
	const payments = order.transactions.filter((t) => t.status === 'success' && t.type !== 'authorization' && t.type !== 'void');

	return (
		<div className="space-y-6">
			{back}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-8">
				<section aria-labelledby="statement-title" className="paper min-w-0 p-5 sm:p-8">
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div>
							<p className="eyebrow text-ink-dim">
								Statement <span className="tabular">{hydrated ? formatCustom(order.createdAt, 'D MMMM YYYY') : ' '}</span>
							</p>
							<h2 id="statement-title" className="display-sm mt-2 text-ink">
								Order {order.name}
							</h2>
						</div>
						<span className={`rounded-full px-3 py-1 text-xs font-semibold ${TONE_CLASS[status.tone]}`}>{status.label}</span>
					</div>

					<div className="mt-8 space-y-4">
						{order.lineItems.map((l, i) => (
							<VisitLines key={l.appointmentId ?? i} line={l} currency={cur} hydrated={hydrated} />
						))}
					</div>

					<div className="perforation my-6" />
					<div className="space-y-2">
						{tax ? <Line label={order.taxesIncluded ? 'Tax (included)' : 'Tax'} value={money(tax, cur)} muted /> : null}
						<Line label="Total" value={money(order.total, cur)} strong />
						{order.paidTotal ? <Line label="Paid" value={money(order.paidTotal, cur)} muted /> : null}
						{order.refundedTotal ? <Line label="Refunded" value={money(order.refundedTotal, cur)} muted /> : null}
						{order.balance > 0 ? <Line label="Still to pay" value={money(order.balance, cur)} strong /> : null}
					</div>
				</section>

				<div className="min-w-0 space-y-6">
					<section aria-labelledby="invoices-title" className="paper p-5 sm:p-6">
						<h3 id="invoices-title" className="eyebrow text-ink-dim">
							Invoices and receipts
						</h3>
						<InvoiceList orderId={order.id} className="mt-2" />
					</section>

					{payments.length ? (
						<section aria-labelledby="payments-title" className="paper p-5 sm:p-6">
							<h3 id="payments-title" className="eyebrow text-ink-dim">
								Payments
							</h3>
							<ul className="mt-3 space-y-2">
								{payments.map((t, i) => (
									<li key={`${t.createdAt}-${i}`}>
										<Line
											label={`${TX_LABEL[t.type] ?? 'Payment'} · ${PROVIDER_LABEL[t.provider] ?? t.provider}${hydrated ? ` · ${formatCustom(t.createdAt, 'D MMM')}` : ''}`}
											value={`${t.type === 'refund' ? '−' : ''}${money(t.amount, t.currencyCode || cur)}`}
											muted={t.type === 'refund'}
										/>
									</li>
								))}
							</ul>
						</section>
					) : null}

					<p className="px-1 text-xs leading-relaxed text-ink-dim">Questions about a charge? Call us and quote order {order.name}. We’re happy to send an itemised copy for your insurer.</p>
				</div>
			</div>
		</div>
	);
}
