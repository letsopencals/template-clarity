import { siteConfig, type CareNeed } from '@/lib/site-config';
import type { VisitFor } from '@/lib/catalog';

/*
 * Care Finder matching — a concierge, not triage. Maps a chosen need or the
 * patient's own words to 1–3 visit slugs. Pure and client-safe.
 */

export type SeenMode = 'clinic' | 'video' | 'any';

export interface FinderVisit {
	slug: string;
	title: string;
	groupTitle: string;
	department: string | null;
	departmentLabel: string | null;
	price: number;
	duration: number;
	video: boolean;
	group: boolean;
	reason: string | null;
	image: string | null;
}

export const NEEDS: CareNeed[] = siteConfig.careFinder.needs;

/** For a child, pediatrics first — ordered by what the parent picked. */
const CHILD_ROUTES: Record<string, string[]> = {
	checkup: ['pediatrics-well-child', 'pediatrics-immunization', 'vaccination-child'],
	tests: ['vaccination-child', 'pediatrics-immunization', 'pediatrics-well-child'],
	teeth: ['dental-checkup', 'pediatrics-well-child'],
	child: ['pediatrics-sick-visit', 'pediatrics-well-child', 'vaccination-child'],
};
const CHILD_DEFAULT = ['pediatrics-sick-visit', 'pediatrics-well-child', 'vaccination-child'];

export function needById(id: string | null | undefined): CareNeed | null {
	return (id && NEEDS.find((n) => n.id === id)) || null;
}

/** Needs whose keywords appear in the text, best first. */
export function needsForText(text: string): CareNeed[] {
	const q = text.trim().toLowerCase();
	if (!q) return [];
	const scored = NEEDS.map((n) => ({
		n,
		score: n.keywords.reduce((s, k) => (q.includes(k) ? s + k.length : s), 0) + (n.label.toLowerCase().includes(q) ? 3 : 0),
	}))
		.filter((x) => x.score > 0)
		.sort((a, b) => b.score - a.score);
	return scored.map((x) => x.n);
}

/** Visits whose names contain the words typed. */
function visitsForText(text: string, visits: FinderVisit[]): string[] {
	const words = text.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
	if (!words.length) return [];
	return visits.filter((v) => words.some((w) => `${v.title} ${v.groupTitle}`.toLowerCase().includes(w))).map((v) => v.slug);
}

export interface MatchResult {
	visits: FinderVisit[];
	/** Short explanation shown above the results. */
	note: string | null;
	/** Nothing matched — showing the general consult. */
	fallback: boolean;
}

export function matchVisits(opts: { need: string | null; q: string; who: VisitFor | null; mode: SeenMode | null; visits: FinderVisit[] }): MatchResult {
	const { need, q, who, mode, visits } = opts;
	const bySlug = new Map(visits.map((v) => [v.slug, v]));
	const chosen = needById(need);
	const textNeeds = chosen ? [] : needsForText(q);
	const primary = chosen ?? textNeeds[0] ?? null;

	let slugs: string[] = [];
	if (who === 'child') {
		slugs = CHILD_ROUTES[primary?.id ?? ''] ?? CHILD_DEFAULT;
	} else if (primary) {
		slugs = [...primary.services, ...textNeeds.slice(1).flatMap((n) => n.services.slice(0, 1))];
	} else if (q.trim()) {
		slugs = visitsForText(q, visits);
	}
	let list = [...new Set(slugs)].map((s) => bySlug.get(s)).filter((v): v is FinderVisit => !!v);

	let note: string | null = who === 'child' ? 'For children we start with our pediatric team — they see newborns to teens.' : null;
	let fallback = false;

	if (mode === 'video') {
		const video = list.filter((v) => v.video);
		if (video.length) list = video;
		else {
			note = 'These visits need to happen in clinic. If you’d still rather start by video, a doctor can see you first and guide you.';
			const consult = bySlug.get(siteConfig.careFinder.fallbackService);
			list = consult && consult.video ? [consult, ...list] : list;
		}
	}

	if (!list.length) {
		const consult = bySlug.get(siteConfig.careFinder.fallbackService);
		list = consult ? [consult] : visits.slice(0, 1);
		note = siteConfig.careFinder.noMatch;
		fallback = true;
	}
	return { visits: list.slice(0, 3), note, fallback };
}
