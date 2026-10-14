import { siteConfig } from '@/lib/site-config';
import type { VisitRow } from './visit-model';

interface PrepGroup {
	key: string;
	heading: string;
	bring: string[];
	tips: string[];
}

/** One "What to bring" list per kind of visit (in-clinic by department, video), de-duplicated. */
function groupsOf(rows: VisitRow[]): PrepGroup[] {
	const groups = new Map<string, PrepGroup>();
	for (const r of rows) {
		const key = r.video ? 'video' : (r.department ?? 'default');
		const g = groups.get(key) ?? {
			key,
			heading: r.video ? 'For your video visit' : rows.length > 1 ? `For ${r.title}` : 'What to bring',
			bring: [],
			tips: [],
		};
		for (const b of r.prep.bring) if (!g.bring.includes(b)) g.bring.push(b);
		if (r.prep.tip && !g.tips.includes(r.prep.tip)) g.tips.push(r.prep.tip);
		groups.set(key, g);
	}
	return [...groups.values()];
}

/** "How to prepare" from prepFor(department, video), on lined pre-visit paper. */
export function PrepNotes({ rows }: { rows: VisitRow[] }) {
	const groups = groupsOf(rows);
	const hasVideo = rows.some((r) => r.video);
	const hasClinic = rows.some((r) => !r.video);
	if (groups.length === 0) return null;

	return (
		<section aria-labelledby="prep-title" className="paper border border-line px-6 py-7 sm:px-8">
			<p className="eyebrow text-[0.62rem] text-brass">Before your visit</p>
			<h2 id="prep-title" className="display-xs mt-3 text-ink">
				How to <em>prepare</em>
			</h2>

			<div className="mt-6 space-y-7">
				{groups.map((g) => (
					<div key={g.key}>
						<p className="eyebrow text-[0.6rem] text-ink-muted">{g.heading}</p>
						<ul className="ruled mt-3">
							{g.bring.map((b) => (
								<li key={b} className="flex items-start gap-3 py-2.5 text-sm text-ink">
									<span aria-hidden className="mt-[0.4rem] h-3 w-3 shrink-0 rounded-[4px] border border-line-strong" />
									{b}
								</li>
							))}
						</ul>
						{g.tips.map((t) => (
							<p key={t} className="mt-3 text-sm leading-relaxed text-ink-muted italic-display">
								{t}
							</p>
						))}
					</div>
				))}
			</div>

			<div className="mt-7 space-y-3 border-t border-line pt-5 text-sm leading-relaxed text-ink-muted">
				{hasClinic ? <p>Please check in at reception when you arrive. We&rsquo;ll check your insurance at the visit.</p> : null}
				{hasVideo ? (
					<p>
						Your video link opens {siteConfig.videoVisit.joinWindowMinutes} minutes before, from the email we sent and from My Care.
					</p>
				) : null}
				<p>
					Need to change something? Call us on{' '}
					<a href={siteConfig.contact.phoneHref} className="link-underline tabular text-ink">
						{siteConfig.contact.phone}
					</a>
					.
				</p>
				<p className="text-xs text-ink-dim">{siteConfig.emergency.long}</p>
			</div>
		</section>
	);
}
