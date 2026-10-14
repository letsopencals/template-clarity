'use client';

import type { FormEvent } from 'react';
import { clsx } from 'clsx';
import type { CustomerProviderCatalogItem } from '@opencals/storefront-sdk';
import { useCheckout } from '@/contexts/checkout-context';
import { Button } from '@/components/ui/button';
import { PAYMENT_METHOD_FORM_ID } from './form-ids';

/** Primary-action label for a chosen provider (used here and by the mobile pay bar). */
export function methodActionLabel(name: string | undefined): string {
	switch (name) {
		case 'stripe':
			return 'Continue to card';
		case 'cash':
			return 'Confirm visit, pay at the clinic';
		case 'bank_transfer':
			return 'Confirm visit, pay by transfer';
		case 'no_payment_required':
			return 'Confirm visit';
		default:
			return 'Continue';
	}
}

interface PaymentMethodsProps {
	method: string | undefined;
	onMethodChange: (name: string) => void;
}

/**
 * Payment method choice as stationery radio cards. Choosing doesn't start the
 * checkout; submitting does (handleStartCheckout), so the visitor can change
 * their mind before anything is created.
 */
export function PaymentMethods({ method, onMethodChange }: PaymentMethodsProps) {
	const { providers, submitting, isExpired, handleStartCheckout } = useCheckout();

	const onSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (method && !submitting && !isExpired) void handleStartCheckout(method);
	};

	if (providers.length === 0) {
		return <p className="text-sm text-ink-muted">No payment methods are available right now. Please call the clinic and we&rsquo;ll book you in.</p>;
	}

	return (
		<form id={PAYMENT_METHOD_FORM_ID} onSubmit={onSubmit} className="space-y-6">
			<fieldset>
				<legend className="sr-only">Payment method</legend>
				<div className="space-y-3">
					{providers.map((p, i) => (
						<MethodCard
							key={p.name}
							provider={p}
							index={i}
							checked={method === p.name}
							disabled={submitting || isExpired}
							onSelect={onMethodChange}
						/>
					))}
				</div>
			</fieldset>
			<InsuranceNote />
			<Button type="submit" variant="primary" size="lg" className="max-lg:hidden" disabled={!method || submitting || isExpired}>
				{submitting ? 'One moment…' : methodActionLabel(method)}
				{submitting ? null : <span aria-hidden>→</span>}
			</Button>
		</form>
	);
}

interface MethodCardProps {
	provider: CustomerProviderCatalogItem;
	index: number;
	checked: boolean;
	disabled: boolean;
	onSelect: (name: string) => void;
}

function MethodCard({ provider, index, checked, disabled, onSelect }: MethodCardProps) {
	const id = `pay-${provider.name}`;
	return (
		<label
			htmlFor={id}
			className={clsx(
				'group relative flex cursor-pointer items-start gap-4 rounded-field border p-5 transition-[border-color,background-color,box-shadow] duration-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-steel',
				checked ? 'border-steel bg-steel-tint/40 shadow-card' : 'border-line bg-card hover:border-line-strong',
				disabled && 'cursor-not-allowed opacity-60',
			)}
		>
			<input
				id={id}
				type="radio"
				name="payment-method"
				value={provider.name}
				checked={checked}
				disabled={disabled}
				onChange={() => onSelect(provider.name)}
				className="sr-only"
			/>
			<span
				aria-hidden
				className={clsx(
					'mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors',
					checked ? 'border-steel' : 'border-line-strong',
				)}
			>
				<span className={clsx('h-2 w-2 rounded-full bg-steel transition-transform duration-300', checked ? 'scale-100' : 'scale-0')} />
			</span>
			<span className="min-w-0 flex-1">
				<span className="flex items-baseline gap-3">
					<MethodGlyph name={provider.name} index={index} />
					<span className="font-display text-[1.25rem] leading-tight text-ink">{customerTitle(provider.name) ?? provider.displayName}</span>
					{provider.mode === 'test' ? (
						<span className="eyebrow ml-auto rounded-full border border-honey px-2 py-0.5 text-[0.55rem] text-oak">Test</span>
					) : null}
				</span>
				<span className="mt-1.5 block text-sm leading-relaxed text-ink-muted">{customerCopy(provider.name) ?? provider.description}</span>
			</span>
		</label>
	);
}

/**
 * Customer-facing wording for the built-in providers. The catalog's own
 * displayName/description are written for merchants ("Record cash payments
 * collected outside the system"), so they're only a fallback for unknown ones.
 */
function customerTitle(name: string): string | undefined {
	switch (name) {
		case 'stripe':
			return 'Card';
		case 'cash':
			return 'Pay at the clinic';
		case 'bank_transfer':
			return 'Bank transfer';
		case 'no_payment_required':
			return 'Nothing to pay today';
		default:
			return undefined;
	}
}

function customerCopy(name: string): string | undefined {
	switch (name) {
		case 'stripe':
			return 'Card, Apple Pay or Google Pay, paid securely now.';
		case 'cash':
			return 'We hold the time now. Pay at reception on the day, or after your video visit.';
		case 'bank_transfer':
			return 'We’ll email the transfer details with your confirmation.';
		case 'no_payment_required':
			return 'This visit is covered, so we’ll confirm it straight away.';
		default:
			return undefined;
	}
}

/** Reassurance under the methods: insurance is checked in person, not here. */
function InsuranceNote() {
	return (
		<p className="flex gap-3 rounded-field bg-sage-soft/70 px-4 py-3 text-sm leading-relaxed text-sage-deep">
			<svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden>
				<path d="M10 2.5l6 2.3v4.6c0 3.9-2.6 6.8-6 8.1-3.4-1.3-6-4.2-6-8.1V4.8l6-2.3z" />
				<path d="M7.2 10.2l2 1.9 3.7-4" />
			</svg>
			<span>
				We&rsquo;ll check your insurance at the visit. Bring your card and we&rsquo;ll bill your plan where we can.
			</span>
		</p>
	);
}

function MethodGlyph({ name, index }: { name: string; index: number }) {
	const cls = 'h-5 w-5 shrink-0 self-center text-brass';
	if (name === 'stripe') {
		return (
			<svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden>
				<rect x="2.5" y="4.5" width="15" height="11" rx="2" />
				<path d="M2.5 8h15M5.5 12.5h3" />
			</svg>
		);
	}
	if (name === 'cash') {
		return (
			<svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden>
				<path d="M3 16.5h14M4.5 16.5V8.5M15.5 16.5V8.5M10 16.5V8.5M2.5 8.5L10 3.5l7.5 5" />
			</svg>
		);
	}
	return (
		<span className="tabular self-center text-[0.7rem] text-brass" aria-hidden>
			{String.fromCharCode(97 + index)}.
		</span>
	);
}
