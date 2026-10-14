'use client';

import Link from 'next/link';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { ClinicianPortrait } from '@/components/account/clinician-portrait';
import { bookHref, departmentLabel, type TeamMember } from '@/components/account/care-utils';

const MAX = 4;

/** Clinicians who've seen this family, newest first, with "Book again". */
export function CareTeam({ team }: { team: TeamMember[] }) {
	const { formatCustom } = useDateFormatter();
	if (!team.length) return null;
	return (
		<section aria-labelledby="team-title">
			<h2 id="team-title" className="eyebrow text-ink-muted">
				Your care team
			</h2>
			<ul className="mt-4 divide-y divide-line rounded-card border border-line bg-card">
				{team.slice(0, MAX).map((m) => (
					<li key={m.clinician.id} className="flex min-w-0 items-center gap-4 px-5 py-4">
						<ClinicianPortrait name={m.clinician.name} imageUrl={m.clinician.imageUrl} size={48} />
						<div className="min-w-0 flex-1">
							<p className="truncate font-medium text-ink">{m.clinician.name}</p>
							<p className="truncate text-xs text-ink-muted">
								{m.clinician.title}
								{m.department ? ` · ${departmentLabel(m.department)}` : ''} · last {formatCustom(m.lastAt, 'MMM YYYY')}
							</p>
						</div>
						<Link
							href={bookHref(m.lastService, { staff: m.clinician.slug })}
							className="link-underline shrink-0 rounded-sm text-sm font-medium text-steel hover:text-steel-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-steel"
							aria-label={`Book again with ${m.clinician.name}`}
						>
							Book again
						</Link>
					</li>
				))}
			</ul>
		</section>
	);
}
