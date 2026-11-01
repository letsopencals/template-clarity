import type {
	AppointmentDetailOrder,
	AppointmentStatusType,
	CustomerProviderCatalogItem,
	FeedbackQuestionResponse,
	InvoiceResponse,
	MarketingConsentState,
	StorefrontAppointmentPendingReason,
} from '@opencals/storefront-sdk';
import type { Patient } from '@/lib/intake';

/**
 * The public-safe "care record" shapes My Care renders. Built server-side in
 * `app/api/account/_lib/care.ts` from the SDK's appointment detail: no
 * internal notes, no staff contact details, no customer credentials. Client-safe
 * (types only).
 */

export interface CareFile {
	id: string;
	url: string | null;
	filename: string | null;
	mime: string | null;
}

export interface CareAnswer {
	questionId: string | null;
	question: string;
	answer: string | null;
	files: CareFile[];
}

export interface CareProduct {
	/** Variant id (what availability, questions and reschedule take). */
	id: string;
	/** Group id ("group-cardiology"). */
	productId: string;
	slug: string;
	title: string;
	variantTitle: string | null;
	/** Seconds. */
	duration: number;
	price: number;
	imageUrl: string | null;
	allowCustomDuration: boolean;
	allowCustomerCancel: boolean;
	allowCustomerReschedule: boolean;
	cancelGap: number;
	rescheduleGap: number;
}

export interface CareClinician {
	id: string;
	slug: string;
	name: string;
	firstName: string;
	imageUrl: string | null;
	title: string;
}

export interface CarePlace {
	id: string;
	slug: string;
	title: string;
	video: boolean;
	addressLines: string[];
	latitude: number | null;
	longitude: number | null;
	/** Video link — only ever sent to the visit's own patient. */
	link: string | null;
}

export interface CareAddOn {
	id: string;
	title: string;
	quantity: number;
	price: number;
	durationMultiplied: boolean;
}

export interface CareCharge {
	orderId: string;
	orderName: string;
	currency: string;
	taxesIncluded: boolean;
	/** This visit's base line. */
	originalSubtotal: number;
	totalDiscount: number;
	discountedSubtotal: number;
	totalTax: number;
	addOnSubtotal: number;
	addOnTotalTax: number;
	/** The order this visit was paid on. */
	orderTotal: number;
	paidTotal: number;
	refundedTotal: number;
	balance: number;
	/** The SDK's full union, including `voided` (cancelled before anything was paid). */
	paymentStatus: AppointmentDetailOrder['paymentStatus'];
	/** Pay-by deadline for manual payments (ISO), when the clinic sets one. */
	paymentDueAt: string | null;
	refundStatus: AppointmentDetailOrder['refundStatus'];
	/** Payment methods used ("stripe", "cash"…). */
	providers: CustomerProviderCatalogItem['name'][];
}

export interface CareVisit {
	id: string;
	status: AppointmentStatusType;
	/** Why a `pending` visit waits. Null when it doesn't (or is only briefly pending while being confirmed). */
	pendingReason: StorefrontAppointmentPendingReason | null;
	/** UTC ISO. */
	from: string;
	to: string;
	createdAt: string;
	product: CareProduct;
	/** Department (collection) slug. */
	department: string | null;
	video: boolean;
	patient: Patient;
	clinician: CareClinician | null;
	place: CarePlace | null;
	/** Pre-visit notes (checkout answers), in the order they were asked. */
	answers: CareAnswer[];
	/** Feedback already given. */
	feedback: CareAnswer[];
	addOns: CareAddOn[];
	charge: CareCharge | null;
}

export interface CareRecord {
	visits: CareVisit[];
	/** More appointments exist than were loaded. */
	truncated: boolean;
}

export interface CareInvoice {
	id: string;
	number: string;
	kind: InvoiceResponse['kind'];
	status: InvoiceResponse['status'];
	amountDue: number;
	currency: string;
	issuedAt: string | null;
	dueAt: string | null;
	paidAt: string | null;
	/** Hosted invoice / receipt page, when the provider has one. */
	url: string | null;
}

export interface CareFeedbackQuestion {
	id: string;
	type: FeedbackQuestionResponse['type'];
	required: boolean;
	title: string;
	description: string | null;
	options: string[];
}

export interface CareConsent {
	email: MarketingConsentState;
	sms: MarketingConsentState;
	whatsapp: MarketingConsentState;
}
