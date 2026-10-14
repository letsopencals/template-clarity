import type { Patient } from '@/lib/intake';

/**
 * The public-safe "care record" shapes My Care renders. Built server-side in
 * `app/api/account/_lib/care.ts` from the SDK's appointment detail: no
 * internal notes, no staff contact details, no customer credentials. Client-safe
 * (types only).
 */

export type VisitStatus = 'pending' | 'scheduled' | 'completed' | 'canceled';

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
	paymentStatus: 'unpaid' | 'paid' | 'partially-paid';
	refundStatus: 'refund-owed' | 'partially-refunded' | 'fully-refunded' | 'unrefunded';
	/** Payment methods used ("stripe", "cash"…). */
	providers: string[];
}

export interface CareVisit {
	id: string;
	status: VisitStatus;
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
	kind: 'collectible' | 'receipt';
	status: 'draft' | 'sent' | 'paid' | 'void' | 'failed';
	amountDue: number;
	currency: string;
	issuedAt: string | null;
	dueAt: string | null;
	paidAt: string | null;
	/** Hosted invoice / receipt page, when the provider has one. */
	url: string | null;
}

export type FeedbackQuestionType = 'single-line-text-field' | 'multi-line-text-field' | 'dropdown' | 'rating' | 'checkbox' | 'file-upload';

export interface CareFeedbackQuestion {
	id: string;
	type: FeedbackQuestionType;
	required: boolean;
	title: string;
	description: string | null;
	options: string[];
}

export type ConsentState = 'not_subscribed' | 'subscribed' | 'unsubscribed';

export interface CareConsent {
	email: ConsentState;
	sms: ConsentState;
	whatsapp: ConsentState;
}
