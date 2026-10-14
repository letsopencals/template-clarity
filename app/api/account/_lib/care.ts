import '@/lib/opencals';
import {
	CheckoutQuestionService,
	type AppointmentDetailResponse,
	type CheckoutQuestionResponse,
	type InvoiceResponse,
} from '@opencals/storefront-sdk';
import { keyMapOf, patientOf, type IntakeKeyMap } from '@/lib/intake';
import { siteConfig } from '@/lib/site-config';
import type { CareAnswer, CareCharge, CareClinician, CareInvoice, CarePlace, CareVisit } from '@/components/account/care-types';

/**
 * Server-only mappers from the SDK's appointment detail to My Care's public-safe
 * `CareVisit`. Explicit allow-lists: nothing from the customer object, no
 * internal note, no staff email / user id, only the fields the portal renders.
 */

export type DepartmentIndex = Record<string, string>;

/** questionId → intake key, per variant id. Each product's questions are fetched once per request. */
export async function intakeKeysFor(variantIds: string[]): Promise<Record<string, IntakeKeyMap>> {
	const unique = [...new Set(variantIds.filter(Boolean))];
	const entries = await Promise.all(
		unique.map(async (productId) => {
			try {
				const { data } = await CheckoutQuestionService.listTranslations({ path: { productId, language: 'en' } });
				return [productId, keyMapOf((data ?? []) as CheckoutQuestionResponse[])] as const;
			} catch {
				return [productId, {} as IntakeKeyMap] as const;
			}
		}),
	);
	return Object.fromEntries(entries);
}

function answersOf(list: AppointmentDetailResponse['checkoutQuestionAnswers'] | undefined): CareAnswer[] {
	return (list ?? []).map((a) => ({
		questionId: a.questionId ?? null,
		question: a.question,
		answer: a.answer ?? null,
		files: (a.files ?? []).map((f) => ({ id: f.id, url: f.url ?? null, filename: f.filename ?? null, mime: f.mime ?? null })),
	}));
}

function clinicianOf(detail: AppointmentDetailResponse, department: string | null): CareClinician | null {
	const s = detail.staffMember;
	if (!s) return null;
	const firstName = s.firstName ?? '';
	const name = [firstName, s.lastName].filter(Boolean).join(' ');
	const title = siteConfig.clinicians[s.slug]?.title ?? (department ? siteConfig.clinicianRoles[department] : undefined) ?? 'Clinician';
	return { id: s.id, slug: s.slug, name, firstName, imageUrl: s.image?.url ?? null, title };
}

function placeOf(detail: AppointmentDetailResponse): CarePlace | null {
	const l = detail.location;
	if (!l) return null;
	const video = l.type === 'online';
	const cityLine = [l.city, [l.state, l.postalCode].filter(Boolean).join(' ')].filter(Boolean).join(', ');
	const display = detail.displayAddress ?? l.displayAddress ?? null;
	const addressLines = video
		? []
		: display
			? display.split(/\n|,(?=\s*\S)/).map((x) => x.trim()).filter(Boolean).slice(0, 3)
			: [l.addressLine1, l.addressLine2, cityLine].filter((x): x is string => !!x);
	return {
		id: l.id,
		slug: l.slug,
		title: l.title ?? (video ? 'Video visit' : siteConfig.shortName),
		video,
		addressLines,
		latitude: l.latitude ?? null,
		longitude: l.longitude ?? null,
		link: video ? (l.link ?? null) : null,
	};
}

function chargeOf(detail: AppointmentDetailResponse): CareCharge | null {
	const order = detail.order ?? detail.orderLineItem?.order ?? null;
	const line = detail.orderLineItem;
	if (!order) return null;
	const providers = [
		...new Set(
			(order.transactions ?? [])
				.filter((t) => t.status === 'success' && t.type !== 'refund' && t.type !== 'void')
				.map((t) => t.provider),
		),
	];
	return {
		orderId: order.id,
		orderName: order.name,
		currency: order.paymentCurrencyCode,
		taxesIncluded: !!order.taxesIncluded,
		originalSubtotal: line?.originalSubtotal ?? 0,
		totalDiscount: line?.totalDiscount ?? 0,
		discountedSubtotal: line?.discountedSubtotal ?? 0,
		totalTax: line?.totalTax ?? 0,
		addOnSubtotal: line?.addOnSubtotal ?? 0,
		addOnTotalTax: line?.addOnTotalTax ?? 0,
		orderTotal: order.total,
		paidTotal: order.paidTotal,
		refundedTotal: order.refundedTotal,
		balance: order.balance,
		paymentStatus: order.paymentStatus,
		refundStatus: order.refundStatus,
		providers,
	};
}

export function toCareVisit(detail: AppointmentDetailResponse, departments: DepartmentIndex, keys: IntakeKeyMap | undefined): CareVisit {
	const p = detail.product;
	const department = (p?.slug && departments[p.slug]) || null;
	const answers = answersOf(detail.checkoutQuestionAnswers);
	const place = placeOf(detail);
	return {
		id: detail.id,
		status: detail.status,
		from: detail.from,
		to: detail.to,
		createdAt: detail.createdAt,
		product: {
			id: p.id,
			productId: p.productId,
			slug: p.slug,
			title: p.title,
			variantTitle: p.variantTitle ?? null,
			duration: p.duration,
			price: p.price,
			imageUrl: (p as { image?: { url?: string | null } | null }).image?.url ?? null,
			allowCustomDuration: !!p.allowCustomDuration,
			allowCustomerCancel: p.allowCustomerCancel !== false,
			allowCustomerReschedule: p.allowCustomerReschedule !== false,
			cancelGap: p.cancelGap ?? 0,
			rescheduleGap: p.rescheduleGap ?? 0,
		},
		department,
		video: !!place?.video,
		patient: patientOf(answers, keys),
		clinician: clinicianOf(detail, department),
		place,
		answers,
		feedback: answersOf(detail.feedbackQuestionAnswers),
		addOns: (detail.addOns ?? []).map((a) => ({
			id: a.id,
			title: a.addOn?.title ?? 'Add-on',
			quantity: a.quantity,
			price: a.addOn?.price ?? 0,
			durationMultiplied: !!a.addOn?.durationMultiplied,
		})),
		charge: chargeOf(detail),
	};
}

export function toCareInvoice(i: InvoiceResponse): CareInvoice {
	const raw = i as InvoiceResponse & { issuedAt?: string | null; dueAt?: string | null; paidAt?: string | null };
	return {
		id: i.id,
		number: i.number,
		kind: i.kind,
		status: i.status,
		amountDue: i.amountDue,
		currency: i.currencyCode,
		issuedAt: raw.issuedAt ?? null,
		dueAt: raw.dueAt ?? null,
		paidAt: raw.paidAt ?? null,
		url: i.externalUrl || null,
	};
}

/** Strip the customer's password hash from any payload that nests a customer. */
export function withoutSecrets<T>(payload: T): T {
	const walk = (v: unknown): unknown => {
		if (Array.isArray(v)) return v.map(walk);
		if (!v || typeof v !== 'object') return v;
		const out: Record<string, unknown> = {};
		for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
			if (k === 'password' || k === 'refreshToken') continue;
			out[k] = walk(val);
		}
		return out;
	};
	return walk(payload) as T;
}
