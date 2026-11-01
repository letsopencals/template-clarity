'use client';

import dynamic from 'next/dynamic';
import { useCheckout } from '@/contexts/checkout-context';
import { Button } from '@/components/ui/button';

// StripePayment pulls in Stripe (@stripe/react-stripe-js + stripe-js), which is
// heavy and only needed on the final step — load it on demand, client-only.
const StripePayment = dynamic(() => import('@/components/checkout/stripe-payment').then((m) => m.StripePayment), {
	ssr: false,
	loading: () => <StripeSkeleton />,
});

interface PaymentStepProps {
	/** Formatted total for the pay button. */
	payLabel: string;
	onProcessingChange: (processing: boolean) => void;
}

/**
 * 02 — Payment, once a card payment is started: the Stripe element. Manual
 * methods and "nothing to pay" are placed straight away by the context, so
 * the plain confirm below is only a fallback.
 */
export function PaymentStep({ payLabel, onProcessingChange }: PaymentStepProps) {
	const { selectedProvider, paymentData, submitting, isExpired, setStep, setError, handleSubmitCheckout } = useCheckout();

	if (!paymentData) return null;

	return (
		<div className="space-y-6">
			{paymentData.clientSecret ? (
				<StripePayment
					clientSecret={paymentData.clientSecret}
					stripeAccountId={paymentData.stripeAccountId}
					publishableKey={paymentData.publishableKey}
					onSuccess={(piId) => handleSubmitCheckout(piId)}
					onError={(msg) => setError(msg)}
					disabled={isExpired || submitting}
					payLabel={payLabel}
					onProcessingChange={onProcessingChange}
				/>
			) : (
				<div className="rounded-field border border-line bg-cream/60 p-6">
					<p className="font-display text-[1.25rem] text-ink">{offlineTitle(selectedProvider)}</p>
					<p className="mt-2 text-sm text-ink-muted">{offlineCopy(selectedProvider)}</p>
					<Button variant="primary" size="lg" className="mt-6" onClick={() => handleSubmitCheckout()} disabled={submitting || isExpired}>
						{submitting ? 'Confirming…' : 'Confirm visit'}
					</Button>
				</div>
			)}

			<button
				type="button"
				onClick={() => setStep('payment-select')}
				disabled={submitting}
				className="link-underline rounded-full text-xs text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-steel disabled:opacity-40"
			>
				← Choose another way to pay
			</button>
		</div>
	);
}

function StripeSkeleton() {
	return (
		<div className="space-y-4" aria-busy="true" aria-label="Loading the secure payment form">
			<div className="flex gap-3">
				<div className="image-placeholder h-16 flex-1 rounded-field" />
				<div className="image-placeholder h-16 flex-1 rounded-field" />
			</div>
			<div className="image-placeholder h-12 rounded-field" />
			<div className="grid grid-cols-2 gap-3">
				<div className="image-placeholder h-12 rounded-field" />
				<div className="image-placeholder h-12 rounded-field" />
			</div>
		</div>
	);
}

function offlineTitle(provider: string | null): string {
	switch (provider) {
		case 'cash':
			return 'Pay at the clinic';
		case 'bank_transfer':
			return 'Pay by bank transfer';
		case 'stripe_invoice':
			return 'Pay by invoice';
		default:
			return 'Confirm your visit';
	}
}

function offlineCopy(provider: string | null): string {
	switch (provider) {
		case 'cash':
			return 'We’ll hold your time. Pay at reception on the day.';
		case 'bank_transfer':
			return 'We’ll show the transfer details next and email them to you.';
		case 'stripe_invoice':
			return 'We’ll email an invoice you can pay online.';
		default:
			return 'We’ll hold your time and email you the details.';
	}
}
