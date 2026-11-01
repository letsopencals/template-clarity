'use client';

import type { PaymentInstructions } from '@opencals/storefront-sdk';
import { useSettings } from '@/contexts/settings-context';
import { buttonClasses } from '@/components/ui/button';
import { safeInvoiceUrl } from '@/lib/visit-outcome';
import { siteConfig } from '@/lib/site-config';

interface PaymentDueProps {
	/** From checkout submit; null when the page was reloaded or opened elsewhere. */
	instructions: PaymentInstructions | null;
	/** The order's payment deadline, when the order could be read back. */
	dueAt?: string | null;
	/** Show the "check your email" fallback when there are no instructions in hand. */
	fallback: boolean;
	/** The order number, used as the bank transfer reference (as in the confirmation email). */
	reference?: string | null;
}

function useDueLabel(iso: string | null | undefined): string | null {
	const { settings, timeFormat } = useSettings();
	if (!iso) return null;
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return null;
	try {
		return new Intl.DateTimeFormat('en-GB', {
			timeZone: settings?.settings?.timezone || undefined,
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			hour: 'numeric',
			minute: '2-digit',
			hour12: timeFormat !== '24H',
		}).format(date);
	} catch {
		return date.toUTCString();
	}
}

const HEADING: Record<string, string> = {
	bank_transfer: 'Pay by bank transfer',
	stripe_invoice: 'Pay your invoice',
	cash: 'Pay at the clinic',
};

/**
 * "How to pay" for manual methods, as a ruled slip beside the visit pass:
 * the hosted invoice link, the clinic's bank details, or a pay-in-person note,
 * with the deadline. Card payments and paid orders never reach here.
 */
export function PaymentDue({ instructions, dueAt, fallback, reference }: PaymentDueProps) {
	const due = useDueLabel(instructions?.dueAt ?? dueAt);
	if (!instructions && !fallback) return null;

	const provider = instructions?.provider ?? '';
	const invoiceUrl = safeInvoiceUrl(instructions?.hostedInvoiceUrl);
	const bank = instructions?.bankDetails;
	const bankRows = bank
		? ([
				['Account name', bank.accountName],
				['Bank', bank.bankName],
				['IBAN / account number', bank.iban],
				['SWIFT / BIC', bank.swift],
				['Payment reference', provider === 'bank_transfer' ? reference : null],
			].filter(([, v]) => Boolean(v)) as [string, string][])
		: [];

	return (
		<section aria-labelledby="payment-due-title" className="paper border border-honey/50 px-6 py-7 sm:px-8">
			<p className="eyebrow text-[0.62rem] text-oak">Payment to confirm</p>
			<h2 id="payment-due-title" className="display-xs mt-3 text-ink">
				{HEADING[provider] ?? 'How to pay'}
			</h2>

			{due ? (
				<p className="mt-3 text-sm text-ink">
					Please pay by <span className="tabular font-semibold">{due}</span>.
				</p>
			) : null}

			{!instructions ? (
				<p className="mt-3 text-sm leading-relaxed text-ink-muted">
					We&rsquo;ve emailed you how to pay. Check your inbox (and spam) for a message from {siteConfig.shortName}.
				</p>
			) : null}

			{provider === 'stripe_invoice' ? (
				invoiceUrl ? (
					<a href={invoiceUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: 'primary', size: 'md', className: 'mt-6' })}>
						Pay invoice
						<span aria-hidden>↗</span>
					</a>
				) : (
					<p className="mt-3 text-sm leading-relaxed text-ink-muted">Your invoice is on its way by email, with a link to pay online.</p>
				)
			) : null}

			{bankRows.length > 0 ? (
				<dl className="ruled mt-5">
					{bankRows.map(([label, value]) => (
						<div key={label} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
							<dt className="text-ink-muted">{label}</dt>
							<dd className="tabular min-w-0 break-all text-right text-ink select-all">{value}</dd>
						</div>
					))}
				</dl>
			) : null}
			{provider === 'bank_transfer' ? (
				<p className="mt-3 text-sm leading-relaxed text-ink-muted">We&rsquo;ve emailed these details to you too.</p>
			) : null}

			{provider === 'cash' ? (
				<p className="mt-3 text-sm leading-relaxed text-ink-muted">Pay at reception when you arrive, or after your video visit.</p>
			) : null}
		</section>
	);
}
