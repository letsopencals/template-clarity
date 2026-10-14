'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useNow } from '@/hooks/use-now';
import { buttonClasses } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { EmptyState, LoadError } from '@/components/account/empty-state';
import { OverviewSkeleton } from '@/components/account/skeletons';
import { useCareRecord, useFilteredCare, usePersonFilter } from '@/components/account/use-care';
import { careTeamOf, forPerson, isUpcoming, nextVisit, recallsDue } from '@/components/account/care-utils';
import { NextVisit } from '@/components/account/overview/next-visit';
import { RecallsDue, type RecallItem } from '@/components/account/overview/recalls-due';
import { CareTeam } from '@/components/account/overview/care-team';
import { HelpCard } from '@/components/account/overview/help-card';
import { VisitRow } from '@/components/account/visits/visit-row';

const RECENT = 3;
const LATER = 3;

/** My Care home: next visit, what's due, care team, recent visits. */
export function OverviewView() {
	const now = useNow();
	const nowMs = now?.getTime() ?? null;
	const { visits, all, people, person, isLoading, error } = useFilteredCare();
	const { mutate } = useCareRecord();
	const { hrefWith } = usePersonFilter();

	const next = useMemo(() => (nowMs ? nextVisit(visits, nowMs) : null), [visits, nowMs]);
	const later = useMemo(
		() =>
			nowMs
				? visits
						.filter((v) => v.id !== next?.id && isUpcoming(v, nowMs))
						.sort((a, b) => a.from.localeCompare(b.from))
						.slice(0, LATER)
				: [],
		[visits, next, nowMs],
	);
	const recent = useMemo(() => (nowMs ? visits.filter((v) => !isUpcoming(v, nowMs) && v.status !== 'canceled').slice(0, RECENT) : []), [visits, nowMs]);
	const team = useMemo(() => careTeamOf(visits), [visits]);
	const recalls = useMemo<RecallItem[]>(() => {
		if (!nowMs) return [];
		const scope = person ? people.filter((p) => p.key === person) : people;
		return scope.flatMap((p) =>
			recallsDue(forPerson(all, p.key), nowMs, p.relation === 'self' ? 'You' : p.label).map((r) => ({ ...r, key: `${p.key}:${r.book}`, forChild: p.relation === 'child' })),
		);
	}, [all, people, person, nowMs]);

	if (error && !all.length) return <LoadError what="your care record" onRetry={() => void mutate()} />;
	if (isLoading || !nowMs) return <OverviewSkeleton />;

	if (!all.length) {
		return (
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
				<div className="min-w-0">
					<EmptyState
						title="Nothing booked yet"
						body="When you book a visit — for yourself or someone you care for — it will appear here with everything you need to prepare."
						href="/services"
						cta="Book a visit"
					/>
				</div>
				<div className="min-w-0">
					<HelpCard />
				</div>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:gap-12">
			<div className="min-w-0 space-y-10">
				<Reveal>
					{next ? (
						<NextVisit visit={next} />
					) : (
						<div className="paper flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
							<div>
								<p className="eyebrow text-brass">Next visit</p>
								<p className="display-xs mt-2 text-ink">Nothing coming up.</p>
								<p className="mt-1 text-sm text-ink-muted">Whenever you need us, booking takes a minute.</p>
							</div>
							<Link href="/services" className={buttonClasses({ size: 'md' })}>
								Book a visit
							</Link>
						</div>
					)}
				</Reveal>

				{later.length ? (
					<section aria-labelledby="later-title">
						<h2 id="later-title" className="eyebrow text-ink-muted">
							Also coming up
						</h2>
						<ul className="mt-4 space-y-3">
							{later.map((v) => (
								<li key={v.id}>
									<VisitRow visit={v} past={false} href={hrefWith(`/account/appointments/${v.id}`)} />
								</li>
							))}
						</ul>
					</section>
				) : null}

				{recent.length ? (
					<section aria-labelledby="recent-title">
						<div className="flex items-baseline justify-between gap-4">
							<h2 id="recent-title" className="eyebrow text-ink-muted">
								Recent visits
							</h2>
							<Link href={hrefWith('/account/appointments')} className="link-underline rounded-sm text-sm font-medium text-steel hover:text-steel-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-steel">
								All visits
							</Link>
						</div>
						<ul className="mt-4 space-y-3">
							{recent.map((v) => (
								<li key={v.id}>
									<VisitRow visit={v} past href={hrefWith(`/account/appointments/${v.id}`)} />
								</li>
							))}
						</ul>
					</section>
				) : null}
			</div>

			<div className="min-w-0 space-y-10">
				<RecallsDue recalls={recalls} />
				<CareTeam team={team} />
				<HelpCard />
			</div>
		</div>
	);
}
