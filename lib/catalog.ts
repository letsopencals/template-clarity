import type { ProductCollectionResponse, ProductListItemResponse } from '@opencals/storefront-sdk';
import { siteConfig } from '@/lib/site-config';
import type { DepartmentIndex } from '@/lib/clinicians';

/**
 * The discovery catalogue: every bookable visit (product variant) and every
 * department (collection), flattened into small, public-safe shapes for the
 * home page, Care Finder, department rooms, "Visits & fees" and video visits.
 * Built on the server from `getProducts()` / `getCollections()` and passed to
 * client components as plain props — no staff or schedules travel with it.
 * Client-safe (no SDK calls).
 */

export interface Visit {
	/** Variant slug — what `/booking/<slug>` takes. */
	slug: string;
	/** Visible name, e.g. "Check-up & Clean". */
	title: string;
	/** Product-group name, e.g. "Dental Care". */
	groupTitle: string;
	description: string | null;
	price: number;
	/** Seconds. */
	duration: number;
	image: string | null;
	/** Department (collection) slug. */
	department: string | null;
	/** Bookable at the online location → can be a video visit. */
	video: boolean;
	/** Small-group session (workshops, classes). */
	group: boolean;
	/** Why it fits, from `siteConfig.serviceReasons`. */
	reason: string | null;
}

export interface Department {
	slug: string;
	title: string;
	short: string;
	tagline: string;
	intro: string;
	description: string | null;
	/** Local photo path (`/images/...`). */
	image: string;
	icon: string;
	treats: string[];
	faqs: { q: string; a: string }[];
	/** Visits in collection order. */
	visits: Visit[];
	fromPrice: number | null;
	video: boolean;
}

export type VisitFor = 'self' | 'child' | 'other';
export type VisitMode = 'clinic' | 'video';

/** `/images/<rel>` for a siteConfig image path. */
export function imagePath(rel: string): string {
	return rel.startsWith('/') || rel.startsWith('http') ? rel : `/images/${rel}`;
}

export function toVisits(products: ProductListItemResponse[], departments: DepartmentIndex): Visit[] {
	const out: Visit[] = [];
	for (const p of products) {
		for (const v of p.variants ?? []) {
			const locations = v.locations ?? [];
			const video = locations.length > 0 ? locations.some((l) => l.type === 'online') : siteConfig.videoVisit.services.includes(v.slug);
			out.push({
				slug: v.slug,
				title: v.variantTitle || v.title || p.title,
				groupTitle: v.title || p.title,
				description: v.description ?? null,
				price: v.price ?? 0,
				duration: v.duration ?? 0,
				image: v.image?.url ?? v.images?.[0]?.url ?? null,
				department: departments[v.slug] ?? null,
				video,
				group: (v.maxAttendees ?? 1) > 1,
				reason: siteConfig.serviceReasons[v.slug] ?? null,
			});
		}
	}
	return out;
}

/**
 * Departments in the curated `siteConfig.departments` order, then any extra
 * collections the store adds. A collection without editorial content still
 * renders from the API alone.
 */
export function toDepartments(collections: ProductCollectionResponse[], visits: Visit[]): Department[] {
	const bySlug = new Map(visits.map((v) => [v.slug, v]));
	const curated = Object.keys(siteConfig.departments);
	const sorted = [...collections]
		.filter((c) => c.isVisible !== false)
		.sort((a, b) => {
			const ai = curated.indexOf(a.slug);
			const bi = curated.indexOf(b.slug);
			return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
		});
	return sorted.map((c, i) => {
		const content = siteConfig.departments[c.slug];
		const list = (c.products ?? []).map((p) => bySlug.get(p.slug)).filter((v): v is Visit => !!v);
		const prices = list.map((v) => v.price).filter((n) => n > 0);
		return {
			slug: c.slug,
			title: c.title,
			short: content?.short ?? c.title,
			tagline: content?.tagline ?? c.description ?? '',
			intro: content?.intro ?? c.description ?? '',
			description: c.description ?? null,
			image: imagePath(content?.heroImage ?? siteConfig.about.gallery[i % siteConfig.about.gallery.length]!.image),
			icon: content?.icon ?? 'stethoscope',
			treats: content?.treats ?? [],
			faqs: content?.faqs ?? [],
			visits: list,
			fromPrice: prices.length ? Math.min(...prices) : null,
			video: list.some((v) => v.video),
		};
	});
}

/** The composer deep link that Agent B's booking page reads. */
export function bookingHref(slug: string, opts: { for?: VisitFor | null; mode?: VisitMode | null; staff?: string | null } = {}): string {
	const params = new URLSearchParams();
	if (opts.for) params.set('for', opts.for);
	if (opts.mode) params.set('mode', opts.mode);
	if (opts.staff) params.set('staff', opts.staff);
	const qs = params.toString();
	return `/booking/${slug}${qs ? `?${qs}` : ''}`;
}

/** "30 min", "1 hr", "1 hr 30". Visits are short, so keep it plain. */
export function visitLength(seconds: number): string {
	const mins = Math.round(seconds / 60);
	if (mins < 60) return `${mins} min`;
	const h = Math.floor(mins / 60);
	const m = mins % 60;
	return m ? `${h} hr ${m}` : `${h} hr`;
}

/** "$95", "$42.50", "Free" — fee-card style (no trailing .00). */
export function formatFee(amount: number, currency = 'USD'): string {
	if (amount === 0) return 'Free';
	const whole = Number.isInteger(amount);
	return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 }).format(amount);
}
