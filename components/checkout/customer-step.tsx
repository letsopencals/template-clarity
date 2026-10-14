'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { useCheckout, type BillingDraft, type ConsentChannel, type FieldErrors } from '@/contexts/checkout-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { describedBy, Field } from './field';
import { DETAILS_FORM_ID } from './form-ids';
import { countryOptions } from './countries';

const CONSENT_COPY: Record<ConsentChannel, { label: string; hint: string }> = {
	email: { label: 'Email me health tips and clinic news', hint: 'A few times a year. Unsubscribe whenever you like.' },
	sms: { label: 'Text me clinic news and offers', hint: 'Appointment reminders come either way.' },
	whatsapp: { label: 'Message me clinic news on WhatsApp', hint: 'You can stop these at any time.' },
};

/** First error for a field, accepting both "phone" and "customer.phone" style paths. */
function errorFor(errors: FieldErrors, ...keys: string[]): string | undefined {
	for (const k of keys) {
		const hit = errors[k] ?? errors[`customer.${k}`];
		if (hit) return hit;
	}
	return undefined;
}

/** 01 — Your details. Patient or guardian; follows the store's checkout settings. */
export function CustomerStep() {
	const {
		fields,
		fieldErrors,
		email,
		firstName,
		lastName,
		phone,
		billing,
		billingOpen,
		consent,
		signedIn,
		setEmail,
		setFirstName,
		setLastName,
		setPhone,
		updateBilling,
		setBillingOpen,
		setConsent,
		submitting,
		isExpired,
		handleSaveCustomer,
	} = useCheckout();

	const emailError = errorFor(fieldErrors, 'email');
	const firstError = errorFor(fieldErrors, 'firstName');
	const lastError = errorFor(fieldErrors, 'lastName');
	const phoneError = errorFor(fieldErrors, 'phone');

	return (
		<form id={DETAILS_FORM_ID} onSubmit={handleSaveCustomer} className="space-y-6">
			{signedIn ? (
				<p className="rounded-field bg-sage-soft px-4 py-3 text-sm text-sage-deep">
					Signed in. We&rsquo;ve filled in what we have on file, so check it&rsquo;s still right.
				</p>
			) : (
				<p className="text-sm text-ink-muted">
					Been to see us before?{' '}
					<Link href="/auth/sign-in?callbackUrl=/checkout" className="link-underline font-semibold text-steel-deep hover:text-steel">
						Sign in
					</Link>{' '}
					and we&rsquo;ll fill this in and add the visit to your care record.
				</p>
			)}

			<p className="flex gap-3 rounded-field border border-dashed border-line-strong px-4 py-3 text-sm leading-relaxed text-ink-muted">
				<span aria-hidden className="mt-0.5 text-brass">
					<GuardianGlyph />
				</span>
				<span>
					These are the details we contact. If you&rsquo;re booking for your child, use your own details. The patient&rsquo;s name is
					on each visit.
				</span>
			</p>

			<Field htmlFor="checkout-email" label="Email" required error={emailError} hint={signedIn ? 'The email on your care record.' : undefined}>
				<Input
					id="checkout-email"
					type="email"
					required
					readOnly={signedIn}
					autoComplete="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="you@example.com"
					aria-invalid={emailError ? true : undefined}
					aria-describedby={describedBy('checkout-email', signedIn, emailError)}
					className={signedIn ? 'bg-cream text-ink-muted' : undefined}
				/>
			</Field>

			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
				<Field htmlFor="checkout-first-name" label="First name" required={fields.firstNameRequired} error={firstError}>
					<Input
						id="checkout-first-name"
						type="text"
						required={fields.firstNameRequired}
						autoComplete="given-name"
						value={firstName}
						onChange={(e) => setFirstName(e.target.value)}
						placeholder="Maya"
						aria-invalid={firstError ? true : undefined}
						aria-describedby={describedBy('checkout-first-name', false, firstError)}
					/>
				</Field>
				<Field htmlFor="checkout-last-name" label="Last name" required error={lastError}>
					<Input
						id="checkout-last-name"
						type="text"
						required
						autoComplete="family-name"
						value={lastName}
						onChange={(e) => setLastName(e.target.value)}
						placeholder="Patel"
						aria-invalid={lastError ? true : undefined}
						aria-describedby={describedBy('checkout-last-name', false, lastError)}
					/>
				</Field>
			</div>

			{fields.phone !== 'hidden' ? (
				<Field
					htmlFor="checkout-phone"
					label="Mobile"
					required={fields.phone === 'required'}
					optional={fields.phone === 'optional'}
					hint="So the clinic can reach you if a time has to move."
					error={phoneError}
				>
					<Input
						id="checkout-phone"
						type="tel"
						required={fields.phone === 'required'}
						autoComplete="tel"
						inputMode="tel"
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						placeholder="+1 212 555 0148"
						aria-invalid={phoneError ? true : undefined}
						aria-describedby={describedBy('checkout-phone', true, phoneError)}
					/>
				</Field>
			) : null}

			{fields.billingAddress === 'optional' ? (
				<label className="flex cursor-pointer items-start gap-3 text-sm text-ink">
					<input
						type="checkbox"
						checked={billingOpen}
						onChange={(e) => setBillingOpen(e.target.checked)}
						className="mt-0.5 h-4 w-4 shrink-0 rounded border-line-strong accent-steel"
					/>
					<span>
						Add a billing address
						<span className="block text-xs text-ink-muted">For receipts you claim back from insurance or an employer.</span>
					</span>
				</label>
			) : null}

			{billingOpen ? <BillingFields billing={billing} errors={fieldErrors} onChange={updateBilling} fields={fields} /> : null}

			{fields.consentChannels.length > 0 ? (
				<fieldset className="space-y-3 border-t border-line pt-6">
					<legend className="eyebrow mb-3 text-[0.62rem] text-ink-muted">Staying in touch</legend>
					{fields.consentChannels.map((ch) => (
						<label key={ch} className="flex cursor-pointer items-start gap-3 text-sm text-ink">
							<input
								type="checkbox"
								checked={consent[ch]}
								onChange={(e) => setConsent(ch, e.target.checked)}
								className="mt-0.5 h-4 w-4 shrink-0 rounded border-line-strong accent-steel"
							/>
							<span>
								{CONSENT_COPY[ch].label}
								<span className="block text-xs text-ink-muted">{CONSENT_COPY[ch].hint}</span>
							</span>
						</label>
					))}
				</fieldset>
			) : null}

			<p className="text-xs leading-relaxed text-ink-muted">
				We&rsquo;ll send your confirmation and a reminder before the visit. Your details stay with the clinic.
			</p>

			<Button type="submit" variant="primary" size="lg" className="max-lg:hidden" disabled={submitting || !email || isExpired}>
				{submitting ? 'Saving…' : 'Continue to payment'}
				{submitting ? null : <span aria-hidden>→</span>}
			</Button>
		</form>
	);
}

interface BillingFieldsProps {
	billing: BillingDraft;
	errors: FieldErrors;
	onChange: (patch: Partial<BillingDraft>) => void;
	fields: ReturnType<typeof useCheckout>['fields'];
}

function BillingFields({ billing, errors, onChange, fields }: BillingFieldsProps) {
	const countries = useMemo(() => countryOptions(), []);
	const required = fields.billingAddress === 'required';
	const err = (k: string) => errorFor(errors, `billingAddress.${k}`);

	return (
		<fieldset className={clsx('space-y-5 rounded-field border border-line bg-cream/50 p-4 sm:p-5')}>
			<legend className="eyebrow px-1 text-[0.62rem] text-ink-muted">Billing address</legend>
			{fields.companyName !== 'hidden' ? (
				<Field
					htmlFor="billing-company"
					label="Company"
					required={fields.companyName === 'required'}
					optional={fields.companyName === 'optional'}
					error={err('companyName')}
				>
					<Input
						id="billing-company"
						autoComplete="organization"
						required={fields.companyName === 'required'}
						value={billing.companyName}
						onChange={(e) => onChange({ companyName: e.target.value })}
						aria-invalid={err('companyName') ? true : undefined}
					/>
				</Field>
			) : null}
			<Field htmlFor="billing-line1" label="Address" required={required} error={err('addressLine1')}>
				<Input
					id="billing-line1"
					autoComplete="address-line1"
					required={required}
					value={billing.addressLine1}
					onChange={(e) => onChange({ addressLine1: e.target.value })}
					aria-invalid={err('addressLine1') ? true : undefined}
				/>
			</Field>
			<Field htmlFor="billing-line2" label="Apartment, suite" optional>
				<Input
					id="billing-line2"
					autoComplete="address-line2"
					value={billing.addressLine2}
					onChange={(e) => onChange({ addressLine2: e.target.value })}
				/>
			</Field>
			<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
				<Field htmlFor="billing-city" label="City" required={required} error={err('city')}>
					<Input
						id="billing-city"
						autoComplete="address-level2"
						required={required}
						value={billing.city}
						onChange={(e) => onChange({ city: e.target.value })}
						aria-invalid={err('city') ? true : undefined}
					/>
				</Field>
				<Field htmlFor="billing-state" label="State / region" optional>
					<Input
						id="billing-state"
						autoComplete="address-level1"
						value={billing.state}
						onChange={(e) => onChange({ state: e.target.value })}
					/>
				</Field>
				<Field htmlFor="billing-postal" label="ZIP / postcode" required={required} error={err('postalCode')}>
					<Input
						id="billing-postal"
						autoComplete="postal-code"
						required={required}
						value={billing.postalCode}
						onChange={(e) => onChange({ postalCode: e.target.value })}
						aria-invalid={err('postalCode') ? true : undefined}
					/>
				</Field>
				<Field htmlFor="billing-country" label="Country" required={required} error={err('country')}>
					<select
						id="billing-country"
						autoComplete="country"
						required={required}
						value={billing.country}
						onChange={(e) => onChange({ country: e.target.value })}
						className="w-full rounded-field border border-line-strong bg-card px-4 py-3 text-[15px] text-ink outline-none transition-[border-color,box-shadow] focus:border-steel focus:shadow-[0_0_0_4px_rgba(63,110,140,0.12)]"
					>
						{countries.map((c) => (
							<option key={c.code} value={c.code}>
								{c.name}
							</option>
						))}
					</select>
				</Field>
			</div>
			{fields.taxId !== 'hidden' ? (
				<Field
					htmlFor="billing-tax"
					label="Tax ID"
					required={fields.taxId === 'required'}
					optional={fields.taxId === 'optional'}
					error={err('taxRegistrationId') ?? err('companyVatNumber')}
				>
					<Input
						id="billing-tax"
						required={fields.taxId === 'required'}
						value={billing.taxRegistrationId}
						onChange={(e) => onChange({ taxRegistrationId: e.target.value })}
					/>
				</Field>
			) : null}
		</fieldset>
	);
}

function GuardianGlyph() {
	return (
		<svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden>
			<circle cx="7" cy="6" r="2.6" />
			<circle cx="14" cy="9" r="1.9" />
			<path d="M2.5 17c.6-3.2 2.4-5 4.5-5s3.9 1.8 4.5 5M11.5 17c.4-2.1 1.4-3.3 2.5-3.3s2.1 1.2 2.5 3.3" />
		</svg>
	);
}
