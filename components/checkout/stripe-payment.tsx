'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { type Appearance, type StripeElementsOptions, type StripeError, loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { STRIPE_FORM_ID } from './form-ids';


// Warm Practice, light: paper field on card, ink text, steel action, Figtree,
// 14px field radius — the Payment Element should read as part of the form.
const INK = '#21303a';
const INK_MUTED = '#5d6870';
const STEEL = '#3f6e8c';
const PAPER = '#fffdf9';
const LINE = 'rgba(33, 48, 58, 0.16)';
const FOCUS_RING = '0 0 0 4px rgba(63, 110, 140, 0.12)';

const APPEARANCE: Appearance = {
	theme: 'flat',
	variables: {
		colorPrimary: STEEL,
		colorBackground: PAPER,
		colorText: INK,
		colorTextSecondary: INK_MUTED,
		colorTextPlaceholder: '#96a0a6',
		colorDanger: '#b4583f',
		fontFamily: 'Figtree, system-ui, sans-serif',
		fontSizeBase: '15px',
		spacingUnit: '4px',
		borderRadius: '14px',
		focusBoxShadow: FOCUS_RING,
		focusOutline: 'none',
	},
	rules: {
		'.Input': {
			border: `1px solid ${LINE}`,
			padding: '13px 16px',
			boxShadow: 'none',
			transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
		},
		'.Input:hover': { border: '1px solid rgba(33, 48, 58, 0.28)' },
		'.Input:focus': { border: `1px solid ${STEEL}`, boxShadow: FOCUS_RING },
		'.Label': {
			color: INK_MUTED,
			fontSize: '10px',
			fontWeight: '600',
			textTransform: 'uppercase',
			letterSpacing: '0.18em',
			marginBottom: '8px',
		},
		'.Tab': { border: `1px solid ${LINE}`, backgroundColor: PAPER, color: INK_MUTED, boxShadow: 'none' },
		'.Tab:hover': { color: INK, border: '1px solid rgba(33, 48, 58, 0.28)' },
		'.Tab--selected': { border: `1px solid ${STEEL}`, color: INK, boxShadow: FOCUS_RING },
		'.TabIcon--selected': { fill: STEEL },
		'.Error': { fontSize: '12px' },
	},
};

const FONTS: StripeElementsOptions['fonts'] = [
	{ cssSrc: 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600&display=swap' },
];

interface StripePaymentProps {
	clientSecret: string;
	stripeAccountId?: string | null;
	/** Key returned by checkout start (matches the account's test/live mode). */
	publishableKey?: string | null;
	onSuccess: (paymentIntentId: string) => void;
	onError: (message: string) => void;
	disabled?: boolean;
	/** Total shown on the pay button. */
	payLabel?: string;
	/** Lets the page's mobile pay bar mirror the processing state. */
	onProcessingChange?: (processing: boolean) => void;
}

export function StripePayment({
	clientSecret,
	stripeAccountId,
	publishableKey: responseKey,
	onSuccess,
	onError,
	disabled,
	payLabel,
	onProcessingChange,
}: StripePaymentProps) {
	const publishableKey = responseKey;
	const stripePromise = useMemo(() => {
		if (!publishableKey) return null;
		return loadStripe(publishableKey, { stripeAccount: stripeAccountId ?? undefined });
	}, [publishableKey, stripeAccountId]);

	const options = useMemo<StripeElementsOptions>(() => ({ clientSecret, appearance: APPEARANCE, fonts: FONTS }), [clientSecret]);

	if (!publishableKey) {
		return (
			<div className="rounded-field border border-clay/30 bg-clay-soft p-5" role="alert">
				<p className="text-sm text-clay">
					Card payments aren&rsquo;t set up for this store yet. Connect Stripe in the Opencals dashboard.
				</p>
			</div>
		);
	}

	if (!stripePromise) return null;

	return (
		<Elements stripe={stripePromise} options={options}>
			<StripePaymentForm
				onSuccess={onSuccess}
				onError={onError}
				disabled={disabled}
				payLabel={payLabel}
				onProcessingChange={onProcessingChange}
			/>
		</Elements>
	);
}

function StripePaymentForm({
	onSuccess,
	onError,
	disabled,
	payLabel,
	onProcessingChange,
}: Omit<StripePaymentProps, 'clientSecret' | 'stripeAccountId' | 'publishableKey'>) {
	const stripe = useStripe();
	const elements = useElements();
	const [processing, setProcessing] = useState(false);

	useEffect(() => {
		onProcessingChange?.(processing);
	}, [processing, onProcessingChange]);

	const handlePay = async (e: FormEvent) => {
		e.preventDefault();
		if (!stripe || !elements || processing || disabled) return;
		setProcessing(true);
		try {
			const { error, paymentIntent } = await stripe.confirmPayment({ elements, redirect: 'if_required' });
			if (error) {
				onError((error as StripeError).message ?? 'The payment didn’t go through. Please try again.');
				return;
			}
			if (paymentIntent?.id) {
				onSuccess(paymentIntent.id);
			} else {
				onError('We couldn’t confirm the payment. Please try again.');
			}
		} catch (err: unknown) {
			onError(err instanceof Error ? err.message : 'The payment didn’t go through. Please try again.');
		} finally {
			setProcessing(false);
		}
	};

	return (
		<form id={STRIPE_FORM_ID} onSubmit={handlePay} aria-busy={processing}>
			<PaymentElement options={{ layout: 'tabs' }} />
			<Button
				type="submit"
				variant="primary"
				size="lg"
				fullWidth
				className="mt-7 max-lg:hidden"
				disabled={!stripe || !elements || processing || disabled}
			>
				{processing ? 'Processing payment…' : payLabel ? `Pay ${payLabel}` : 'Pay and confirm'}
			</Button>
			<p className="mt-4 flex items-center gap-2 text-xs text-ink-muted">
				<svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.3} aria-hidden>
					<rect x="3" y="7" width="10" height="7" rx="1.5" />
					<path d="M5 7V5a3 3 0 016 0v2" />
				</svg>
				Payments are encrypted and processed by Stripe. We never see your card number.
			</p>
		</form>
	);
}
