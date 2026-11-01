'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { signIn as nextAuthSignIn, useSession } from 'next-auth/react';
import type {
	BillingAddress,
	CartItem,
	CheckoutFieldRequirement,
	CheckoutSetting,
	CheckoutResponse,
	CheckoutErrorResponse,
	CheckoutStartResponse,
	CustomerProviderCatalogItem,
	ExistingOrderCustomer,
	MarketingConsentInput,
	NewOrderCustomer,
	PaymentProviderName,
	SaveCustomerResponse,
	StartCheckout,
	SubmitCheckout,
} from '@opencals/storefront-sdk';
import { useCart } from '@/contexts/cart-context';
import { useSettings } from '@/contexts/settings-context';
import { usePaymentProviders } from '@/hooks/use-payment-providers';
import { outcomeOf, saveCheckoutReceipt } from '@/lib/visit-outcome';
import { fieldErrorsOf, phoneFormatError } from '@/lib/field-errors';

/**
 * Clinic checkout is two steps — contact details, then payment. Intake
 * questions are answered per visit in the booking composer, so there is no
 * questions step here.
 */
export type CheckoutStep = 'customer' | 'payment-select' | 'payment';

export type ConsentChannel = keyof MarketingConsentInput;
type ProviderName = PaymentProviderName;

/** What the store asks for at checkout, with safe defaults when settings are missing. */
export interface CheckoutFields {
	firstNameRequired: boolean;
	phone: CheckoutFieldRequirement;
	billingAddress: CheckoutFieldRequirement;
	companyName: CheckoutFieldRequirement;
	taxId: CheckoutFieldRequirement;
	/** Marketing channels offered at checkout, in display order. */
	consentChannels: ConsentChannel[];
}

export interface BillingDraft {
	companyName: string;
	addressLine1: string;
	addressLine2: string;
	city: string;
	state: string;
	postalCode: string;
	/** ISO 3166-1 alpha-2. */
	country: string;
	taxRegistrationId: string;
}

export type ConsentDraft = Record<ConsentChannel, boolean>;

const EMPTY_BILLING: BillingDraft = {
	companyName: '',
	addressLine1: '',
	addressLine2: '',
	city: '',
	state: '',
	postalCode: '',
	country: 'US',
	taxRegistrationId: '',
};
const EMPTY_CONSENT: ConsentDraft = { email: false, sms: false, whatsapp: false };

type CheckoutMode = CustomerProviderCatalogItem['checkoutMode'];

/**
 * How the provider checkout actually started with is paid. The backend can swap the requested provider for
 * "no payment required" when nothing is collectible, so look up the RESPONSE provider first.
 */
function modeOf(started: ProviderName, requested: ProviderName, providers: CustomerProviderCatalogItem[]): CheckoutMode | undefined {
	if (started === 'no_payment_required') return 'none';
	return (providers.find((p) => p.name === started) ?? providers.find((p) => p.name === requested))?.checkoutMode;
}

/** CHECKOUT_IN_PROGRESS: another click or tab is placing this order. Ask again a few times, then give up politely. */
const IN_PROGRESS_RETRIES = 3;
const IN_PROGRESS_DELAY_MS = 1500;
const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

function requirement(value: string | null | undefined): CheckoutFieldRequirement {
	return value === 'required' || value === 'optional' ? value : 'hidden';
}

function shown(value: string | null | undefined): boolean {
	return value === 'checkout_only' || value === 'checkout_and_account';
}

export function checkoutFieldsOf(cs: CheckoutSetting | null | undefined): CheckoutFields {
	const consentChannels: ConsentChannel[] = [];
	if (shown(cs?.emailMarketingOptIn)) consentChannels.push('email');
	if (shown(cs?.smsMarketingOptIn)) consentChannels.push('sms');
	if (shown(cs?.whatsappMarketingOptIn)) consentChannels.push('whatsapp');
	return {
		firstNameRequired: cs?.customerFirstNameRequired ?? false,
		phone: requirement(cs?.customerPhoneRequirement ?? 'optional'),
		billingAddress: requirement(cs?.customerBillingAddressRequirement),
		companyName: requirement(cs?.customerCompanyNameRequirement),
		taxId: requirement(cs?.customerCompanyVatNumberRequirement),
		consentChannels,
	};
}

/** Form field (`phone`, `billingAddress.city`, see `fieldKeyOf`) → message. */
export type FieldErrors = Record<string, string>;

/** Billing contact fields are copied from the contact inputs, so their errors show there. */
const BILLING_FROM_CONTACT: Record<string, string> = {
	'billingAddress.firstName': 'firstName',
	'billingAddress.lastName': 'lastName',
	'billingAddress.email': 'email',
	'billingAddress.phone': 'phone',
};

/** The details-step inputs a field error can sit under, given the store's checkout settings. */
function visibleFields(fields: CheckoutFields, billingOpen: boolean): Set<string> {
	const keys = ['email', 'firstName', 'lastName'];
	if (fields.phone !== 'hidden') keys.push('phone');
	if (billingOpen) {
		keys.push('billingAddress.addressLine1', 'billingAddress.city', 'billingAddress.postalCode', 'billingAddress.country');
		if (fields.companyName !== 'hidden') keys.push('billingAddress.companyName');
		if (fields.taxId !== 'hidden') keys.push('billingAddress.taxRegistrationId', 'billingAddress.companyVatNumber');
	}
	return new Set(keys);
}

/** Splits field errors into the ones a details input shows and whether any are left over for the banner. */
function placeFieldErrors(errors: FieldErrors, visible: Set<string>): { placed: FieldErrors; unplaced: boolean } {
	const placed: FieldErrors = {};
	let unplaced = false;
	for (const [key, message] of Object.entries(errors)) {
		const target = BILLING_FROM_CONTACT[key] && visible.has(BILLING_FROM_CONTACT[key]) ? BILLING_FROM_CONTACT[key] : key;
		if (visible.has(target)) placed[target] = placed[target] && placed[target] !== message ? `${placed[target]} ${message}` : message;
		else unplaced = true;
	}
	return { placed, unplaced };
}

interface CheckoutContextValue {
	step: CheckoutStep;
	error: string | null;
	fieldErrors: FieldErrors;
	submitting: boolean;
	checkoutComplete: boolean;
	/** The held time was taken while the patient was checking out (409 CART_EXPIRED); the cart is gone. */
	holdLost: boolean;

	fields: CheckoutFields;
	email: string;
	firstName: string;
	lastName: string;
	phone: string;
	billing: BillingDraft;
	/** Optional billing address opened by the patient. Always true when required. */
	billingOpen: boolean;
	consent: ConsentDraft;
	/** Signed-in patient (details prefilled, email locked). */
	signedIn: boolean;
	customerId: string | null;
	setEmail: (v: string) => void;
	setFirstName: (v: string) => void;
	setLastName: (v: string) => void;
	setPhone: (v: string) => void;
	updateBilling: (patch: Partial<BillingDraft>) => void;
	setBillingOpen: (v: boolean) => void;
	setConsent: (channel: ConsentChannel, value: boolean) => void;

	providers: CustomerProviderCatalogItem[];
	selectedProvider: ProviderName | null;
	paymentData: CheckoutStartResponse | null;

	items: CartItem[];
	isExpired: boolean;
	timeRemaining: number | null;

	setStep: (step: CheckoutStep) => void;
	setError: (error: string | null) => void;
	handleSaveCustomer: (e: React.FormEvent) => Promise<void>;
	handleStartCheckout: (providerName: ProviderName) => Promise<void>;
	handleSubmitCheckout: (stripePaymentIntentId?: string) => Promise<void>;
	extendCart: () => Promise<void>;
}

const CheckoutContext = createContext<CheckoutContextValue | undefined>(undefined);

function trimmed(v: string): string | undefined {
	const t = v.trim();
	return t ? t : undefined;
}

interface ApiFailure {
	message: string;
	fields: FieldErrors;
	/** The API's machine-readable reason, e.g. CART_EXPIRED or PAYMENT_NOT_AUTHORIZED. */
	code?: CheckoutErrorResponse['code'];
	/** CART_ALREADY_CHECKED_OUT: the order this cart already became. */
	orderId?: CheckoutErrorResponse['orderId'];
}

async function readError(res: Response, fallback: string): Promise<ApiFailure> {
	try {
		const data = (await res.json()) as { error?: string; errors?: unknown; fieldErrors?: unknown } & Pick<
			Partial<CheckoutErrorResponse>,
			'code' | 'orderId'
		>;
		return { message: data.error || fallback, fields: fieldErrorsOf(data), code: data.code, orderId: data.orderId };
	} catch {
		return { message: fallback, fields: {} };
	}
}

export function CheckoutProvider({ children }: { children: ReactNode }) {
	const router = useRouter();
	const { data: session } = useSession();
	const { settings } = useSettings();
	const { cart, cartId, isLoaded, timeRemaining, extendCart, clearCart } = useCart();
	const fields = useMemo(() => checkoutFieldsOf(settings?.checkoutSettings), [settings?.checkoutSettings]);

	const [step, setStep] = useState<CheckoutStep>('customer');
	const [error, setError] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
	const [submitting, setSubmitting] = useState(false);
	const [checkoutComplete, setCheckoutComplete] = useState(false);
	const [holdLost, setHoldLost] = useState(false);

	const [email, setEmailState] = useState('');
	const [firstName, setFirstNameState] = useState('');
	const [lastName, setLastNameState] = useState('');
	const [phone, setPhoneState] = useState('');
	const [billing, setBilling] = useState<BillingDraft>(EMPTY_BILLING);
	const [billingOpenState, setBillingOpen] = useState(false);
	const [consent, setConsentState] = useState<ConsentDraft>(EMPTY_CONSENT);
	/** Id returned by save-customer (trusted only); used when starting checkout. */
	const [customerId, setCustomerId] = useState<string | null>(null);
	const [prefilled, setPrefilled] = useState(false);

	const sessionCustomerId = session?.customer?.id ?? null;

	// Prefill from the session once.
	useEffect(() => {
		if (session?.customer && !prefilled) {
			if (session.customer.id) setCustomerId(session.customer.id);
			if (session.customer.email) setEmailState(session.customer.email);
			if (session.customer.firstName) setFirstNameState(session.customer.firstName);
			if (session.customer.lastName) setLastNameState(session.customer.lastName);
			setPrefilled(true);
		}
	}, [session, prefilled]);

	const providers = usePaymentProviders(cartId);
	const [selectedProvider, setSelectedProvider] = useState<ProviderName | null>(null);
	const [paymentData, setPaymentData] = useState<CheckoutStartResponse | null>(null);

	// No cart at all → back to Find care. Only once CartProvider has read the
	// stored cart id from localStorage (before that cartId is always null, so a
	// hard reload of /checkout would otherwise bounce away).
	useEffect(() => {
		if (isLoaded && !cartId && !checkoutComplete && !holdLost) {
			router.replace('/care');
		}
	}, [isLoaded, cartId, checkoutComplete, holdLost, router]);

	/** A held time was taken meanwhile: drop the dead cart and ask the patient to pick again. */
	const loseHold = useCallback(() => {
		setHoldLost(true);
		setSubmitting(false);
		clearCart();
	}, [clearCart]);

	/** The cart is already an order: show that visit pass instead of checking out twice. */
	const goToOrder = useCallback(
		(orderId: string) => {
			setCheckoutComplete(true);
			clearCart();
			router.push(`/thank-you?orderId=${encodeURIComponent(orderId)}`);
		},
		[clearCart, router],
	);

	/** Editing a field clears its error. */
	const clearFieldErrors = useCallback((...keys: string[]) => {
		setFieldErrors((prev) => {
			if (!keys.some((k) => k in prev)) return prev;
			const next = { ...prev };
			for (const k of keys) delete next[k];
			return next;
		});
	}, []);
	const setEmail = useCallback((v: string) => {
		setEmailState(v);
		clearFieldErrors('email');
	}, [clearFieldErrors]);
	const setFirstName = useCallback((v: string) => {
		setFirstNameState(v);
		clearFieldErrors('firstName');
	}, [clearFieldErrors]);
	const setLastName = useCallback((v: string) => {
		setLastNameState(v);
		clearFieldErrors('lastName');
	}, [clearFieldErrors]);
	const setPhone = useCallback((v: string) => {
		setPhoneState(v);
		clearFieldErrors('phone');
	}, [clearFieldErrors]);
	const updateBilling = useCallback(
		(patch: Partial<BillingDraft>) => {
			setBilling((b) => ({ ...b, ...patch }));
			const keys = Object.keys(patch).map((k) => `billingAddress.${k}`);
			// The tax ID input also shows the older companyVatNumber error.
			if ('taxRegistrationId' in patch) keys.push('billingAddress.companyVatNumber');
			clearFieldErrors(...keys);
		},
		[clearFieldErrors],
	);
	const setConsent = useCallback(
		(channel: ConsentChannel, value: boolean) => setConsentState((c) => ({ ...c, [channel]: value })),
		[],
	);
	const billingOpen = fields.billingAddress === 'required' || (fields.billingAddress === 'optional' && billingOpenState);

	/**
	 * Puts a failed request's field errors under the details inputs and goes back to that step. Returns the banner
	 * message: the generic one only when some error has no field to sit under.
	 */
	const showFieldErrors = useCallback(
		(errors: FieldErrors, message: string): string | null => {
			const { placed, unplaced } = placeFieldErrors(errors, visibleFields(fields, billingOpen));
			setFieldErrors(placed);
			if (Object.keys(placed).length > 0) setStep('customer');
			return unplaced || Object.keys(placed).length === 0 ? message : null;
		},
		[fields, billingOpen],
	);

	const cartHeaders = useCallback(
		(): Record<string, string> =>
			cartId ? { 'X-Cart-Id': cartId, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
		[cartId],
	);

	/** The contact fields the store asks for, shared by save-customer and checkout start. */
	const contactFields = useCallback(() => {
		let billingAddress: BillingAddress | undefined;
		if (billingOpen) {
			billingAddress = {
				firstName: trimmed(firstName),
				lastName: trimmed(lastName),
				email: trimmed(email),
				phone: trimmed(phone),
				companyName: fields.companyName !== 'hidden' ? trimmed(billing.companyName) : undefined,
				taxRegistrationId: fields.taxId !== 'hidden' ? trimmed(billing.taxRegistrationId) : undefined,
				addressLine1: trimmed(billing.addressLine1),
				addressLine2: trimmed(billing.addressLine2),
				city: trimmed(billing.city),
				state: trimmed(billing.state),
				postalCode: trimmed(billing.postalCode),
				country: billing.country || undefined,
			};
		}
		let marketingConsent: MarketingConsentInput | undefined;
		if (fields.consentChannels.length > 0) {
			marketingConsent = {};
			for (const ch of fields.consentChannels) marketingConsent[ch] = consent[ch];
		}
		return {
			firstName: trimmed(firstName),
			lastName: trimmed(lastName),
			phone: fields.phone !== 'hidden' ? trimmed(phone) : undefined,
			billingAddress,
			marketingConsent,
		};
	}, [billing, billingOpen, consent, email, fields, firstName, lastName, phone]);

	// 01 — Save contact details.
	const handleSaveCustomer = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			setError(null);
			setFieldErrors({});

			// The API wants international numbers; say so before the round trip. The API stays the judge.
			const phoneError = fields.phone !== 'hidden' ? phoneFormatError(phone) : undefined;
			if (phoneError) {
				setFieldErrors({ phone: phoneError });
				return;
			}
			setSubmitting(true);

			try {
				// A signed-in patient checks out as themselves; everyone else by email.
				const customer: ExistingOrderCustomer | NewOrderCustomer = sessionCustomerId
					? { kind: 'existing', customerId: sessionCustomerId, ...contactFields() }
					: { kind: 'new', email: email.trim(), ...contactFields() };

				const res = await fetch('/api/checkout/save-customer', {
					method: 'POST',
					headers: cartHeaders(),
					body: JSON.stringify({ customer }),
				});

				if (!res.ok) {
					const { message, fields: errs } = await readError(res, 'We couldn’t save your details. Please check them and try again.');
					setError(showFieldErrors(errs, message));
					return;
				}

				const saved = (await res.json().catch(() => ({}))) as SaveCustomerResponse;
				// Only trusted ids come back; an email already on file stays attached to the cart server-side.
				setCustomerId(saved.customerId ?? sessionCustomerId);
				setStep('payment-select');
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
			} finally {
				setSubmitting(false);
			}
		},
		[sessionCustomerId, contactFields, email, cartHeaders, fields.phone, phone, showFieldErrors],
	);

	// Final — submit the order.
	const handleSubmitCheckout = useCallback(
		async (stripePaymentIntentId?: string) => {
			setError(null);
			setSubmitting(true);

			try {
				const submitPayload: SubmitCheckout = {
					appointmentsSettings: { markAsScheduled: true },
				};
				if (stripePaymentIntentId) submitPayload.stripePaymentIntentId = stripePaymentIntentId;

				let res: Response;
				for (let attempt = 0; ; attempt++) {
					res = await fetch('/api/checkout/submit', {
						method: 'POST',
						headers: cartHeaders(),
						body: JSON.stringify(submitPayload),
					});
					if (res.ok || attempt >= IN_PROGRESS_RETRIES) break;
					const { code } = await readError(res.clone(), '');
					if (code !== 'CHECKOUT_IN_PROGRESS') break;
					await wait(IN_PROGRESS_DELAY_MS);
				}

				if (!res.ok) {
					const failure = await readError(res, 'We couldn’t confirm your visit. Please try again.');
					if (failure.code === 'CART_EXPIRED') {
						loseHold();
						return;
					}
					if (failure.code === 'PAYMENT_NOT_AUTHORIZED') {
						throw new Error('Your card wasn’t authorised, so nothing was charged and your time is still held. Please try the card again or use another one.');
					}
					if (failure.code === 'CHECKOUT_IN_PROGRESS') {
						throw new Error('We’re still confirming this visit. Give it a moment, then try again; you won’t be booked twice.');
					}
					throw new Error(failure.message);
				}

				const data = (await res.json()) as CheckoutResponse;
				const orderId = data.order?.id;
				if (!orderId) throw new Error('We couldn’t confirm your visit. Please try again.');

				// Auto-authenticate the patient if tokens came back.
				if (data.auth?.accessToken) {
					await nextAuthSignIn('checkout-token', {
						accessToken: data.auth.accessToken,
						refreshToken: data.auth.refreshToken,
						redirect: false,
					});
				}

				// The visit pass reads the order back, but only submit returns the payment instructions.
				saveCheckoutReceipt({
					orderId,
					orderName: data.order.name ?? null,
					outcome: outcomeOf((data.order.lineItems ?? []).map((li) => li.appointment)),
					paymentInstructions: data.paymentInstructions ?? null,
				});

				setCheckoutComplete(true);
				clearCart();
				router.push(`/thank-you?orderId=${encodeURIComponent(orderId)}`);
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
				setSubmitting(false);
			}
		},
		[cartHeaders, clearCart, loseHold, router],
	);

	// 02 — Start checkout with the chosen method.
	const handleStartCheckout = useCallback(
		async (providerName: ProviderName) => {
			setError(null);
			setSubmitting(true);
			setSelectedProvider(providerName);

			try {
				// Re-send the contact fields: start re-validates the store's requirements. Without a
				// trusted id (an email already on file) they go by email, so billing / consent still
				// reach the booking.
				const startPayload: StartCheckout = {
					provider: providerName,
					customer: customerId
						? { kind: 'existing', customerId, ...contactFields() }
						: { kind: 'new', email: email.trim(), ...contactFields() },
				};

				const res = await fetch('/api/checkout/start', {
					method: 'POST',
					headers: cartHeaders(),
					body: JSON.stringify(startPayload),
				});

				if (!res.ok) {
					const failure = await readError(res, 'We couldn’t start payment. Please try again.');
					if (failure.code === 'CART_ALREADY_CHECKED_OUT') {
						// Already booked (a second tab, a double click). A repeated submit returns that order.
						if (failure.orderId) goToOrder(failure.orderId);
						else await handleSubmitCheckout();
						return;
					}
					if (failure.code === 'CART_EXPIRED') {
						loseHold();
						return;
					}
					if (failure.code === 'CHECKOUT_IN_PROGRESS') {
						throw new Error('We’re already confirming this visit. Give it a moment, then try again.');
					}
					if (Object.keys(failure.fields).length > 0) {
						// Start re-validates the contact details: back to that step, each message under its field.
						setError(showFieldErrors(failure.fields, failure.message));
						setSubmitting(false);
						return;
					}
					throw new Error(failure.message);
				}

				const data: CheckoutStartResponse = await res.json();
				setPaymentData(data);
				setSelectedProvider(data.provider);

				// Route on how the provider is paid, not on its name. Card → the Stripe step; a hosted
				// page → redirect; manual methods (pay in clinic, bank transfer, invoice) and "nothing to
				// pay" → place the order now, no card form.
				const mode = modeOf(data.provider, providerName, providers);
				if (mode === 'redirect' && data.redirectUrl) {
					window.location.href = data.redirectUrl;
				} else if (mode === 'internal' || (mode === undefined && data.clientSecret)) {
					setStep('payment');
					setSubmitting(false);
				} else {
					await handleSubmitCheckout();
				}
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
				setSubmitting(false);
			}
		},
		[cartHeaders, customerId, contactFields, email, providers, goToOrder, loseHold, handleSubmitCheckout, showFieldErrors],
	);

	const items = useMemo(() => cart?.items ?? [], [cart?.items]);
	const isExpired = timeRemaining !== null && timeRemaining <= 0;

	const value = useMemo<CheckoutContextValue>(
		() => ({
			step,
			error,
			fieldErrors,
			submitting,
			checkoutComplete,
			holdLost,
			fields,
			email,
			firstName,
			lastName,
			phone,
			billing,
			billingOpen,
			consent,
			signedIn: Boolean(sessionCustomerId),
			customerId,
			setEmail,
			setFirstName,
			setLastName,
			setPhone,
			updateBilling,
			setBillingOpen,
			setConsent,
			providers,
			selectedProvider,
			paymentData,
			items,
			isExpired,
			timeRemaining,
			setStep,
			setError,
			handleSaveCustomer,
			handleStartCheckout,
			handleSubmitCheckout,
			extendCart,
		}),
		[
			step,
			error,
			fieldErrors,
			submitting,
			checkoutComplete,
			holdLost,
			fields,
			email,
			firstName,
			lastName,
			phone,
			billing,
			billingOpen,
			consent,
			sessionCustomerId,
			customerId,
			setEmail,
			setFirstName,
			setLastName,
			setPhone,
			updateBilling,
			setConsent,
			providers,
			selectedProvider,
			paymentData,
			items,
			isExpired,
			timeRemaining,
			handleSaveCustomer,
			handleStartCheckout,
			handleSubmitCheckout,
			extendCart,
		],
	);

	return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckout(): CheckoutContextValue {
	const ctx = useContext(CheckoutContext);
	if (!ctx) {
		throw new Error('useCheckout must be used within CheckoutProvider');
	}
	return ctx;
}
