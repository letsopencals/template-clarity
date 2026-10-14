'use client';

import { memo } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import type { OrderListItemResponse, OrderListResponse } from '@opencals/storefront-sdk';
import { fetcher } from '@/lib/fetcher';
import { useHydrated } from '@/hooks/use-hydrated';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { ListSkeleton } from '@/components/account/skeletons';
import { EmptyState, LoadError } from '@/components/account/empty-state';
import { money, statementStatus, TONE_CLASS } from '@/components/account/billing/money';

const KEY = '/api/account/orders?take=50';
const SWR_OPTIONS = { revalidateOnFocus: false } as const;

function visitsOf(o: OrderListItemResponse): string {
	const titles = o.lineItems.map((l) => l.appointment?.product?.title).filter((t): t is string => !!t);
	if (!titles.length) return 'Visit';
	const first = titles[0] ?? 'Visit';
	return titles.length > 1 ? `${first} and ${titles.length - 1} more` : first;
}

const StatementRow = memo(function StatementRow({ order }: { order: OrderListItemResponse }) {
	const hydrated = useHydrated();
	const { formatCustom } = useDateFormatter();
	const status = statementStatus(order);
	return (
		<li>
			<Link
				href={`/account/orders/${order.id}`}
				className="group grid grid-cols-1 gap-3 rounded-card border border-line bg-card px-5 py-4 transition-colors hover:border-line-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-steel sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6"
			>
				<div className="min-w-0">
					<p className="eyebrow text-ink-dim">
						Order {order.name}
						<span aria-hidden className="mx-2 text-brass">
							·
						</span>
						<span className="tabular">{hydrated ? formatCustom(order.createdAt, 'D MMM YYYY') : ' '}</span>
					</p>
					<p className="mt-1.5 truncate font-display text-lg text-ink">{visitsOf(order)}</p>
				</div>
				<div className="flex items-center justify-between gap-4 sm:justify-end">
					<span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${TONE_CLASS[status.tone]}`}>{status.label}</span>
					<span className="tabular text-base font-semibold text-ink">{money(order.total, order.paymentCurrencyCode)}</span>
					<svg aria-hidden viewBox="0 0 16 16" className="size-4 text-ink-dim transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={1.6}>
						<path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				</div>
			</Link>
		</li>
	);
});

/** Every statement on the account, newest first. */
export function BillingView() {
	const { data, error, isLoading, mutate } = useSWR<OrderListResponse>(KEY, fetcher, SWR_OPTIONS);
	const orders = data?.data ?? [];
	const due = orders.filter((o) => o.balance > 0);

	return (
		<div className="space-y-8">
			<header className="max-w-2xl">
				<h2 className="display-sm text-ink">Billing</h2>
				<p className="mt-2 text-[15px] text-ink-muted">Statements for your visits, with invoices and receipts to download. Insurance claims usually need the itemised statement.</p>
			</header>

			{error && !data ? <LoadError what="your statements" onRetry={() => void mutate()} /> : null}
			{isLoading && !data ? <ListSkeleton rows={3} label="Loading statements" /> : null}

			{data && !orders.length ? (
				<EmptyState title="No statements yet" body="When you book a visit, its statement and any invoices appear here." href="/services" cta="Find a visit" />
			) : null}

			{due.length ? (
				<p className="rounded-card border border-honey/40 bg-honey-soft px-5 py-4 text-sm text-ink">
					{due.length === 1 ? 'One statement has' : `${due.length} statements have`} a balance left to pay. You can settle it at the front desk on the day.
				</p>
			) : null}

			{orders.length ? (
				<ul className="space-y-3" aria-label="Statements">
					{orders.map((o) => (
						<StatementRow key={o.id} order={o} />
					))}
				</ul>
			) : null}
			{data && data.meta.pageCount > 1 ? <p className="text-xs text-ink-dim">Showing your 50 most recent statements. Call the clinic for older records.</p> : null}
		</div>
	);
}
