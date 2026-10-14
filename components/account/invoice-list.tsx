'use client';

import useSWR from 'swr';
import { clsx } from 'clsx';
import { fetcher } from '@/lib/fetcher';
import { formatPrice } from '@/lib/format';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { Bone } from '@/components/account/skeletons';
import type { CareInvoice } from '@/components/account/care-types';

const SWR_OPTIONS = { revalidateOnFocus: false } as const;

const STATUS_LABEL: Record<CareInvoice['status'], string> = {
	draft: 'Draft',
	sent: 'Awaiting payment',
	paid: 'Paid',
	void: 'Void',
	failed: 'Payment failed',
};

/** Invoices and receipts issued for an order, with downloads when the clinic's provider hosts them. */
export function InvoiceList({ orderId, className }: { orderId: string; className?: string }) {
	const { formatDate } = useDateFormatter();
	const { data, error, isLoading } = useSWR<CareInvoice[]>(`/api/account/orders/${orderId}/invoices`, fetcher, SWR_OPTIONS);

	if (isLoading) {
		return (
			<div role="status" aria-label="Loading invoices" className={clsx('space-y-2', className)}>
				<Bone className="h-4 w-2/3" />
				<Bone className="h-4 w-1/2" />
			</div>
		);
	}
	if (error) return <p className={clsx('text-sm text-ink-muted', className)}>Invoices are unavailable right now.</p>;
	if (!data?.length) return <p className={clsx('text-sm text-ink-muted', className)}>No invoices yet — the clinic will issue one if needed.</p>;

	return (
		<ul className={clsx('divide-y divide-line', className)}>
			{data.map((inv) => (
				<li key={inv.id} className="flex min-w-0 items-center gap-4 py-3">
					<span aria-hidden className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-cream text-ink-muted">
						<svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
							<path d="M4 1.5h6l3 3v10H4z M10 1.5v3h3 M6 8h5 M6 10.5h5" strokeLinejoin="round" />
						</svg>
					</span>
					<div className="min-w-0 flex-1">
						<p className="truncate text-sm font-medium text-ink">
							{inv.kind === 'receipt' ? 'Receipt' : 'Invoice'} <span className="tabular">{inv.number}</span>
						</p>
						<p className="text-xs text-ink-muted">
							{STATUS_LABEL[inv.status]}
							{inv.issuedAt ? ` · ${formatDate(inv.issuedAt)}` : ''}
							{inv.amountDue ? ` · ${formatPrice(inv.amountDue, inv.currency)}` : ''}
						</p>
					</div>
					{inv.url ? (
						<a
							href={inv.url}
							target="_blank"
							rel="noopener noreferrer"
							className="link-underline shrink-0 rounded-sm text-sm font-medium text-steel hover:text-steel-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-steel"
							aria-label={`Download ${inv.kind === 'receipt' ? 'receipt' : 'invoice'} ${inv.number}`}
						>
							Download
						</a>
					) : (
						<span className="shrink-0 text-xs text-ink-dim">Sent by email</span>
					)}
				</li>
			))}
		</ul>
	);
}
