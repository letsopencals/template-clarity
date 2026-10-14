'use client';

import { useMemo, useState } from 'react';
import { useNow } from '@/hooks/use-now';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { EmptyState, LoadError } from '@/components/account/empty-state';
import { ListSkeleton } from '@/components/account/skeletons';
import { useCareRecord, useFilteredCare, usePersonFilter } from '@/components/account/use-care';
import { isUpcoming } from '@/components/account/care-utils';
import { VisitFilters, type StatusFilter } from '@/components/account/visits/visit-filters';
import { VisitRow } from '@/components/account/visits/visit-row';
import type { CareVisit } from '@/components/account/care-types';

interface Group {
	key: string;
	label: string;
	upcoming: boolean;
	visits: CareVisit[];
}

function matches(v: CareVisit, status: StatusFilter, nowMs: number): boolean {
	if (status === 'all') return true;
	if (status === 'canceled') return v.status === 'canceled';
	if (status === 'upcoming') return isUpcoming(v, nowMs);
	return v.status !== 'canceled' && !isUpcoming(v, nowMs);
}

/** Every visit as a timeline: "Coming up", then each year, newest first. */
export function VisitsView() {
	const now = useNow();
	const nowMs = now?.getTime() ?? null;
	const { formatCustom } = useDateFormatter();
	const { visits, all, isLoading, error, truncated } = useFilteredCare();
	const { mutate } = useCareRecord();
	const { hrefWith } = usePersonFilter();
	const [status, setStatus] = useState<StatusFilter>('all');
	const [department, setDepartment] = useState<string | null>(null);

	const departments = useMemo(() => [...new Set(visits.map((v) => v.department).filter((d): d is string => !!d))].sort(), [visits]);
	const inDept = useMemo(() => (department ? visits.filter((v) => v.department === department) : visits), [visits, department]);

	const counts = useMemo<Record<StatusFilter, number>>(() => {
		const c = { all: inDept.length, upcoming: 0, past: 0, canceled: 0 };
		if (!nowMs) return c;
		for (const v of inDept) {
			if (v.status === 'canceled') c.canceled += 1;
			else if (isUpcoming(v, nowMs)) c.upcoming += 1;
			else c.past += 1;
		}
		return c;
	}, [inDept, nowMs]);

	const groups = useMemo<Group[]>(() => {
		if (!nowMs) return [];
		const shown = inDept.filter((v) => matches(v, status, nowMs));
		const upcoming = shown.filter((v) => isUpcoming(v, nowMs)).sort((a, b) => a.from.localeCompare(b.from));
		const rest = shown.filter((v) => !isUpcoming(v, nowMs)).sort((a, b) => b.from.localeCompare(a.from));
		const out: Group[] = upcoming.length ? [{ key: 'upcoming', label: 'Coming up', upcoming: true, visits: upcoming }] : [];
		for (const v of rest) {
			const year = formatCustom(v.from, 'YYYY');
			const last = out[out.length - 1];
			if (last && !last.upcoming && last.key === year) last.visits.push(v);
			else out.push({ key: year, label: year, upcoming: false, visits: [v] });
		}
		return out;
	}, [inDept, status, nowMs, formatCustom]);

	if (error && !all.length) return <LoadError what="your visits" onRetry={() => void mutate()} />;
	if (isLoading || !nowMs) return <ListSkeleton />;
	if (!all.length) {
		return <EmptyState title="No visits yet" body="Your visits will be listed here — upcoming first, then every past visit by year, with notes and receipts." href="/services" cta="Book a visit" />;
	}

	return (
		<div className="min-w-0">
			<VisitFilters status={status} onStatus={setStatus} department={department} onDepartment={setDepartment} departments={departments} counts={counts} />

			{groups.length ? (
				<ol className="mt-10 space-y-12">
					{groups.map((g) => (
						<li key={g.key} aria-labelledby={`group-${g.key}`}>
							<div className="flex items-center gap-4">
								<h2 id={`group-${g.key}`} className={g.upcoming ? 'eyebrow text-brass' : 'tabular text-lg text-ink'}>
									{g.label}
								</h2>
								<span aria-hidden className="h-px flex-1 bg-line" />
								<span className="tabular text-xs text-ink-dim">
									{g.visits.length} {g.visits.length === 1 ? 'visit' : 'visits'}
								</span>
							</div>
							<ul className="relative mt-5 space-y-3 border-l border-line pl-4 sm:ml-2 sm:pl-6">
								{g.visits.map((v) => (
									<li key={v.id} className="relative">
										<span aria-hidden className={`absolute top-1/2 -left-[1.3rem] size-2 -translate-y-1/2 rounded-full ring-4 ring-paper sm:-left-[1.8rem] ${g.upcoming ? 'bg-steel' : 'bg-line-strong'}`} />
										<VisitRow visit={v} past={!g.upcoming} href={hrefWith(`/account/appointments/${v.id}`)} />
									</li>
								))}
							</ul>
						</li>
					))}
				</ol>
			) : (
				<p className="mt-10 rounded-card border border-dashed border-line-strong px-6 py-8 text-center text-sm text-ink-muted">No visits match these filters.</p>
			)}

			{truncated ? <p className="mt-10 text-center text-xs text-ink-dim">Showing your 30 most recent visits. For older records, please call the clinic.</p> : null}
		</div>
	);
}
