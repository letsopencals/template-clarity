import type { Metadata } from 'next';
import { getCatalog } from '@/lib/catalog-server';
import { siteConfig } from '@/lib/site-config';
import type { VisitFor } from '@/lib/catalog';
import { CareFinder, type CareFinderInitial } from '@/components/care/care-finder';
import type { FinderVisit, SeenMode } from '@/components/care/match';

export const metadata: Metadata = {
	title: 'Find care',
	description: 'Three quick questions and we’ll suggest the right visit, clinician and next free time — in clinic or by video.',
};

const FOR: VisitFor[] = ['self', 'child', 'other'];
const MODES: SeenMode[] = ['clinic', 'video', 'any'];

function one(v: string | string[] | undefined): string | null {
	return (Array.isArray(v) ? v[0] : v) ?? null;
}

export default async function CarePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
	const [sp, { visits, departments, currency }] = await Promise.all([searchParams, getCatalog()]);
	const deptLabel = new Map(departments.map((d) => [d.slug, d.short]));
	const finderVisits: FinderVisit[] = visits.map((v) => ({
		slug: v.slug,
		title: v.title,
		groupTitle: v.groupTitle,
		department: v.department,
		departmentLabel: v.department ? (deptLabel.get(v.department) ?? null) : null,
		price: v.price,
		duration: v.duration,
		video: v.video,
		group: v.group,
		reason: v.reason ?? v.description,
		image: v.image,
	}));

	const who = one(sp.for);
	const mode = one(sp.mode);
	const need = one(sp.need);
	const initial: CareFinderInitial = {
		who: who && (FOR as string[]).includes(who) ? (who as VisitFor) : null,
		need: need && siteConfig.careFinder.needs.some((n) => n.id === need) ? need : null,
		q: one(sp.q)?.slice(0, 120) ?? '',
		mode: mode && (MODES as string[]).includes(mode) ? (mode as SeenMode) : null,
	};

	return (
		<section className="grain relative min-h-screen overflow-hidden bg-paper pb-24 pt-32 md:pt-36">
			<div aria-hidden className="pointer-events-none absolute -left-40 top-0 h-[36rem] w-[36rem] rounded-full bg-honey-soft/60 blur-3xl" />
			<div className="container-x relative z-10">
				<header className="max-w-3xl">
					<p className="eyebrow text-oak">01 · {siteConfig.careFinder.eyebrow}</p>
					<h1 className="display-lg mt-5 text-ink">
						Tell us what’s <em>going on.</em>
					</h1>
					<p className="mt-6 max-w-[56ch] text-[17px] leading-relaxed text-ink-muted">{siteConfig.careFinder.lead}</p>
				</header>
				<div className="mt-14">
					<CareFinder key={JSON.stringify(initial)} initial={initial} visits={finderVisits} currency={currency} />
				</div>
			</div>
		</section>
	);
}
