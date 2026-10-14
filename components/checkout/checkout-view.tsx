'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useCart } from '@/contexts/cart-context';
import { useCheckout, type CheckoutStep } from '@/contexts/checkout-context';
import { useSmoothScroll } from '@/components/motion/smooth-scroll';
import { CareLine } from '@/components/motifs/care-line';
import { EmptyCard } from '@/components/cart/empty-card';
import { formatPrice } from '@/lib/format';
import { siteConfig } from '@/lib/site-config';
import { CheckoutMasthead } from './checkout-masthead';
import { CheckoutSection, type SectionState } from './checkout-section';
import { CustomerStep } from './customer-step';
import { PaymentMethods, methodActionLabel } from './payment-methods';
import { PaymentStep } from './payment-step';
import { OrderStack } from './order-stack';
import { MobileSummary } from './mobile-summary';
import { PayBar, type PrimaryAction } from './pay-bar';
import { DETAILS_FORM_ID, PAYMENT_METHOD_FORM_ID, STRIPE_FORM_ID } from './form-ids';

const SECTION_IDS = { details: 'checkout-step-details', payment: 'checkout-step-payment' };

function sectionState(step: CheckoutStep, mine: 0 | 1): SectionState {
	const current = step === 'customer' ? 0 : 1;
	if (current === mine) return 'open';
	return current > mine ? 'done' : 'locked';
}

function sectionFor(step: CheckoutStep): string {
	return step === 'customer' ? SECTION_IDS.details : SECTION_IDS.payment;
}

/** /checkout — two numbered sheets on the left, the appointment-card stack on the right. */
export function CheckoutView() {
	const { cart, cartId, isLoaded } = useCart();
	const { checkoutComplete } = useCheckout();

	if (checkoutComplete) {
		return (
			<CheckoutShell>
				<div className="flex min-h-[40vh] flex-col items-center justify-center text-center" role="status">
					<CareLine settled trigger="mount" tone="steel" className="h-10 w-48" />
					<p className="display-sm mt-6 text-ink">
						Confirming your <em>visit</em>
					</p>
					<p className="mt-2 text-sm text-ink-muted">Taking you to your visit pass.</p>
				</div>
			</CheckoutShell>
		);
	}

	// Wait for CartProvider to read the stored cart (and for the cart to load)
	// before deciding anything — a hard reload must not bounce or flash empty.
	if (!isLoaded || (cartId && !cart)) {
		return (
			<CheckoutShell>
				<CheckoutSkeleton />
			</CheckoutShell>
		);
	}

	if (!cartId || !cart || (cart.items ?? []).length === 0) {
		return (
			<CheckoutShell>
				<EmptyCard className="flex flex-col items-center py-16 text-center" />
			</CheckoutShell>
		);
	}

	return <CheckoutBody />;
}

function CheckoutShell({ children }: { children: ReactNode }) {
	return (
		<section className="bg-paper pt-28 pb-24 sm:pt-32 lg:pt-40">
			<div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">
				<CheckoutMasthead />
				{children}
			</div>
		</section>
	);
}

function CheckoutBody() {
	const { cart } = useCart();
	const { step, error, submitting, email, firstName, lastName, providers, selectedProvider, isExpired, setStep, setError, handleSubmitCheckout } =
		useCheckout();
	const lenis = useSmoothScroll();

	const [chosen, setChosen] = useState<string | undefined>();
	const method = chosen && providers.some((p) => p.name === chosen) ? chosen : providers[0]?.name;
	const [stripeProcessing, setStripeProcessing] = useState(false);

	const total = formatPrice(cart?.total ?? cart?.subtotal ?? 0, cart?.paymentCurrencyCode);

	// Bring the newly opened section into view and move focus into it, so
	// keyboard users don't land on <body> when the previous form folds away.
	const previousStep = useRef(step);
	useEffect(() => {
		if (previousStep.current === step) return;
		previousStep.current = step;
		const el = document.getElementById(sectionFor(step));
		if (!el) return;
		if (lenis) lenis.scrollTo(el, { offset: -110 });
		else el.scrollIntoView({ block: 'start', behavior: 'smooth' });
		const t = window.setTimeout(() => {
			el.querySelector<HTMLElement>('[data-section-body] :is(input, select, textarea, button)')?.focus({ preventScroll: true });
		}, 450);
		return () => window.clearTimeout(t);
	}, [step, lenis]);

	const fullName = [firstName, lastName].filter(Boolean).join(' ');

	const action = primaryAction({
		step,
		submitting,
		isExpired,
		hasEmail: Boolean(email),
		hasProviders: providers.length > 0,
		method,
		selectedProvider,
		stripeProcessing,
		total,
		onConfirmOffline: () => void handleSubmitCheckout(),
	});

	return (
		<section className="bg-paper pt-28 pb-32 sm:pt-32 lg:pt-40 lg:pb-28">
			<div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">
				<CheckoutMasthead />

				<div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14 xl:gap-20">
					<div className="min-w-0 space-y-5 lg:col-span-7">
						<MobileSummary />

						{error ? (
							<div role="alert" className="flex items-start gap-4 rounded-field border border-clay/30 bg-clay-soft px-5 py-4 text-sm text-ink">
								<span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />
								<p className="flex-1">{error}</p>
								<button
									type="button"
									onClick={() => setError(null)}
									className="eyebrow shrink-0 rounded-full text-[0.6rem] text-clay underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-steel"
								>
									Dismiss
								</button>
							</div>
						) : null}

						<CheckoutSection
							id={SECTION_IDS.details}
							index="01"
							title="Your details"
							state={sectionState(step, 0)}
							summary={[fullName, email].filter(Boolean).join(' · ')}
							onEdit={submitting ? undefined : () => setStep('customer')}
						>
							<CustomerStep />
						</CheckoutSection>

						<CheckoutSection
							id={SECTION_IDS.payment}
							index="02"
							title="Payment"
							state={sectionState(step, 1)}
							lockedHint="Card, or pay at the clinic where offered."
						>
							{step === 'payment' ? (
								<PaymentStep payLabel={total} onProcessingChange={setStripeProcessing} />
							) : (
								<PaymentMethods method={method} onMethodChange={setChosen} />
							)}
						</CheckoutSection>

						<TrustRow />
						<p className="text-xs leading-relaxed text-ink-muted lg:hidden">{siteConfig.emergency.long}</p>
					</div>

					<aside aria-label="Your visits" className="hidden min-w-0 lg:col-span-5 lg:block">
						<div className="sticky top-28">
							<OrderStack />
						</div>
					</aside>
				</div>
			</div>

			<PayBar total={total} action={action} />
		</section>
	);
}

/** Quiet reassurance row from siteConfig.trust. */
function TrustRow() {
	return (
		<ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-xs text-ink-muted">
			{siteConfig.trust.map((t) => (
				<li key={t.title} className="flex items-center gap-2">
					<span aria-hidden className="h-1 w-1 rounded-full bg-brass" />
					{t.title}
				</li>
			))}
		</ul>
	);
}

interface ActionInput {
	step: CheckoutStep;
	submitting: boolean;
	isExpired: boolean;
	hasEmail: boolean;
	hasProviders: boolean;
	method: string | undefined;
	selectedProvider: string | null;
	stripeProcessing: boolean;
	total: string;
	onConfirmOffline: () => void;
}

/** What the mobile pay bar does at each step — mirrors the section's own submit button. */
function primaryAction(i: ActionInput): PrimaryAction | null {
	const blocked = i.submitting || i.isExpired;
	switch (i.step) {
		case 'customer':
			return {
				label: i.submitting ? 'Saving…' : 'Continue to payment',
				form: DETAILS_FORM_ID,
				disabled: blocked || !i.hasEmail,
				busy: i.submitting,
			};
		case 'payment-select':
			if (!i.hasProviders) return null;
			return {
				label: i.submitting ? 'One moment…' : methodActionLabel(i.method),
				form: PAYMENT_METHOD_FORM_ID,
				disabled: blocked || !i.method,
				busy: i.submitting,
			};
		case 'payment':
			if (i.selectedProvider === 'stripe') {
				const busy = i.stripeProcessing || i.submitting;
				return { label: busy ? 'Processing…' : `Pay ${i.total}`, form: STRIPE_FORM_ID, disabled: busy || i.isExpired, busy };
			}
			return { label: i.submitting ? 'Confirming…' : 'Confirm visit', onClick: i.onConfirmOffline, disabled: blocked, busy: i.submitting };
	}
}

function CheckoutSkeleton() {
	return (
		<div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14" aria-busy="true" aria-label="Loading your visits">
			<div className="min-w-0 space-y-5 lg:col-span-7">
				<div className="image-placeholder h-72 rounded-card" />
				<div className="image-placeholder h-24 rounded-card" />
			</div>
			<div className="hidden min-w-0 lg:col-span-5 lg:block">
				<div className="image-placeholder h-80 rounded-card" />
			</div>
		</div>
	);
}
