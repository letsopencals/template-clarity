import { siteConfig } from '@/lib/site-config';
import { firstName } from '@/lib/intake';
import type { CalendarEvent } from '@/lib/calendar';
import type { CareClinician, CarePlace, CareVisit } from '@/components/account/care-types';

/** "General consultation · Extended", without repeating the title. */
export function serviceTitle(v: Pick<CareVisit, 'product'>): string {
	const { title, variantTitle } = v.product;
	if (!variantTitle || variantTitle === title || /default/i.test(variantTitle)) return title;
	return variantTitle.toLowerCase().includes(title.toLowerCase()) ? variantTitle : `${title} · ${variantTitle}`;
}

export function departmentLabel(slug: string | null | undefined): string | null {
	if (!slug) return null;
	return siteConfig.departments[slug]?.short ?? slug.replace(/-/g, ' ');
}

export function isUpcoming(v: Pick<CareVisit, 'status' | 'to'>, nowMs: number): boolean {
	return (v.status === 'scheduled' || v.status === 'pending') && new Date(v.to).getTime() > nowMs;
}

/** The next visit still ahead (soonest first). */
export function nextVisit(visits: CareVisit[], nowMs: number): CareVisit | null {
	return (
		visits
			.filter((v) => isUpcoming(v, nowMs))
			.sort((a, b) => new Date(a.from).getTime() - new Date(b.from).getTime())[0] ?? null
	);
}

/** "in 3 days, 4 h" / "in 2 h 10 min" / "in 12 min" / "starting now". */
export function formatCountdown(targetMs: number, nowMs: number): string {
	const diff = targetMs - nowMs;
	if (diff <= 60_000) return 'starting now';
	const minutes = Math.floor(diff / 60_000);
	const days = Math.floor(minutes / 1440);
	const hours = Math.floor((minutes % 1440) / 60);
	const mins = minutes % 60;
	if (days >= 1) return hours ? `in ${days} ${days === 1 ? 'day' : 'days'}, ${hours} h` : `in ${days} ${days === 1 ? 'day' : 'days'}`;
	if (hours >= 1) return mins ? `in ${hours} h ${mins} min` : `in ${hours} h`;
	return `in ${mins} min`;
}

export type JoinState = 'early' | 'open' | 'ended';

/** Video link opens `joinWindowMinutes` before the start and closes at the end. */
export function joinState(v: Pick<CareVisit, 'from' | 'to'>, nowMs: number): JoinState {
	const opens = new Date(v.from).getTime() - siteConfig.videoVisit.joinWindowMinutes * 60_000;
	if (nowMs < opens) return 'early';
	if (nowMs > new Date(v.to).getTime()) return 'ended';
	return 'open';
}

export function directionsHref(place: CarePlace): string | null {
	if (place.video) return null;
	const q =
		place.latitude != null && place.longitude != null
			? `${place.latitude},${place.longitude}`
			: [place.title, ...place.addressLines].join(', ');
	return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;
}

export function toCalendarEvent(v: CareVisit): CalendarEvent {
	const where = v.place?.video ? 'Video visit (join from My Care)' : [v.place?.title, ...(v.place?.addressLines ?? [])].filter(Boolean).join(', ');
	const who = v.clinician ? ` with ${v.clinician.name}` : '';
	return {
		uid: `${v.id}@clear-care`,
		title: `${serviceTitle(v)}${who} · ${siteConfig.shortName}`,
		start: new Date(v.from).getTime(),
		end: new Date(v.to).getTime(),
		location: where || undefined,
		description: `Manage this visit in My Care. ${siteConfig.emergency.short}`,
	};
}

/* ── Family: who each visit was for ─────────────────────────────── */

export const ME = 'me';

export interface CarePerson {
	key: string;
	/** "Me", "Mia", "Dad". */
	label: string;
	relation: 'self' | 'child' | 'other';
	visits: number;
}

function slugOf(name: string): string {
	return name
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

/** Stable key for a visit's patient: "me" or the slugged full name. */
export function personKey(v: Pick<CareVisit, 'patient'>): string {
	if (v.patient.visitFor === 'self' || !v.patient.name) return ME;
	return slugOf(v.patient.name) || ME;
}

/** Display name for a visit's patient ("You" for the account holder). */
export function personLabel(v: Pick<CareVisit, 'patient'>): string {
	return v.patient.visitFor === 'self' || !v.patient.name ? 'You' : firstName(v.patient.name);
}

/** Everyone seen across the record — "Me" first, then by number of visits. */
export function peopleOf(visits: CareVisit[]): CarePerson[] {
	const map = new Map<string, CarePerson>();
	map.set(ME, { key: ME, label: 'Me', relation: 'self', visits: 0 });
	for (const v of visits) {
		const key = personKey(v);
		const existing = map.get(key);
		if (existing) existing.visits += 1;
		else map.set(key, { key, label: firstName(v.patient.name) || 'Someone', relation: v.patient.visitFor, visits: 1 });
	}
	const [me, ...rest] = [...map.values()];
	return [me!, ...rest.sort((a, b) => b.visits - a.visits)];
}

export function forPerson(visits: CareVisit[], key: string | null): CareVisit[] {
	if (!key) return visits;
	return visits.filter((v) => personKey(v) === key);
}

/* ── Recalls ("Due for") ────────────────────────────────────────── */

export interface DueRecall {
	label: string;
	book: string;
	/** When the last matching visit was. Null = never seen for it here. */
	lastAt: string | null;
	dueAt: string;
	overdue: boolean;
	person: string;
}

function addMonths(iso: string, months: number): Date {
	const d = new Date(iso);
	d.setMonth(d.getMonth() + months);
	return d;
}

/**
 * Recalls from `siteConfig.recalls` crossed with completed visits: a recall is
 * due when the last matching visit was `months` ago (or soon will be) and no
 * matching visit is already booked. Only recalls the patient has had before.
 */
export function recallsDue(visits: CareVisit[], nowMs: number, personLabelText = 'You'): DueRecall[] {
	const out: DueRecall[] = [];
	const horizon = nowMs + 30 * 86_400_000;
	for (const r of siteConfig.recalls) {
		const matching = visits.filter((v) => r.services.includes(v.product.slug));
		if (!matching.some((v) => v.status === 'completed')) continue;
		if (matching.some((v) => isUpcoming(v, nowMs))) continue;
		const last = matching
			.filter((v) => v.status === 'completed')
			.sort((a, b) => new Date(b.from).getTime() - new Date(a.from).getTime())[0]!;
		const due = addMonths(last.from, r.months);
		if (due.getTime() > horizon) continue;
		out.push({ label: r.label, book: r.book, lastAt: last.from, dueAt: due.toISOString(), overdue: due.getTime() < nowMs, person: personLabelText });
	}
	return out.sort((a, b) => a.dueAt.localeCompare(b.dueAt));
}

/* ── Care team ──────────────────────────────────────────────────── */

export interface TeamMember {
	clinician: CareClinician;
	department: string | null;
	visits: number;
	lastAt: string;
	/** Variant slug to "book again". */
	lastService: string;
}

export function careTeamOf(visits: CareVisit[]): TeamMember[] {
	const map = new Map<string, TeamMember>();
	for (const v of visits) {
		if (!v.clinician || v.status === 'canceled') continue;
		const existing = map.get(v.clinician.id);
		if (!existing) {
			map.set(v.clinician.id, { clinician: v.clinician, department: v.department, visits: 1, lastAt: v.from, lastService: v.product.slug });
			continue;
		}
		existing.visits += 1;
		if (v.from > existing.lastAt) {
			existing.lastAt = v.from;
			existing.lastService = v.product.slug;
			existing.department = v.department;
		}
	}
	return [...map.values()].sort((a, b) => b.lastAt.localeCompare(a.lastAt));
}

/** `/booking/<variant>` with optional clinician and patient hints for the composer. */
export function bookHref(slug: string, opts: { staff?: string | null; forChild?: boolean } = {}): string {
	const params = new URLSearchParams();
	if (opts.staff) params.set('staff', opts.staff);
	if (opts.forChild) params.set('for', 'child');
	const qs = params.toString();
	return `/booking/${slug}${qs ? `?${qs}` : ''}`;
}

/** Initials for a portrait placeholder. */
export function initialsOf(name: string): string {
	const parts = name.replace(/^dr\.?\s+/i, '').trim().split(/\s+/);
	return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}
