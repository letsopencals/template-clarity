import { Reveal } from '@/components/motion/reveal';
import { prepFor } from '@/lib/site-config';
import { DepartmentIcon } from '@/components/ui/department-icon';

/**
 * Two pieces of clinic stationery side by side: "What we see" on ruled paper,
 * and the "What to bring" card (in clinic, and by video when offered).
 */
export function DepartmentTreats({ slug, title, treats, video }: { slug: string; title: string; treats: string[]; video: boolean }) {
	const inClinic = prepFor(slug, false);
	const byVideo = video ? prepFor(slug, true) : null;
	return (
		<section className="section-y bg-cream">
			<div className="container-x grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
				{treats.length ? (
					<Reveal className="min-w-0 lg:col-span-6">
						<div className="paper h-full p-8 md:p-10">
							<p className="eyebrow text-oak">What we see</p>
							<h2 className="display-sm mt-4 text-ink">
								In {title.toLowerCase()}, <em>we help with</em>
							</h2>
							<ul className="ruled mt-7">
								{treats.map((t, i) => (
									<li key={t} className="flex min-h-[2.1rem] items-center gap-4 text-[16px] text-ink">
										<span className="tabular w-6 text-xs text-ink-dim">{String(i + 1).padStart(2, '0')}</span>
										{t}
									</li>
								))}
							</ul>
							<p className="mt-6 text-[13px] text-ink-dim">Not sure it fits? Book a general consult and we’ll point you to the right room.</p>
						</div>
					</Reveal>
				) : null}
				<Reveal delay={0.08} className="min-w-0 lg:col-span-6">
					<div className="flex h-full flex-col gap-6">
						<PrepCard heading="Coming in to the clinic" icon="pin" prep={inClinic} />
						{byVideo ? <PrepCard heading="Joining by video" icon="video" prep={byVideo} /> : null}
					</div>
				</Reveal>
			</div>
		</section>
	);
}

function PrepCard({ heading, icon, prep }: { heading: string; icon: string; prep: ReturnType<typeof prepFor> }) {
	return (
		<div className="flex-1 rounded-card border border-line bg-card p-7 shadow-card md:p-8">
			<div className="flex items-center justify-between gap-4">
				<p className="eyebrow text-oak">What to bring</p>
				<span className="inline-flex items-center gap-2 text-[13px] font-medium text-steel">
					<DepartmentIcon name={icon} className="h-4 w-4" />
					{heading}
				</span>
			</div>
			<ul className="mt-5 flex flex-col gap-3">
				{prep.bring.map((b) => (
					<li key={b} className="flex items-start gap-3 text-[15px] text-ink">
						<DepartmentIcon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-sage-deep" />
						{b}
					</li>
				))}
			</ul>
			<div aria-hidden className="perforation mt-6" />
			<p className="mt-4 font-display text-[16px] italic leading-snug text-ink-muted">{prep.tip}</p>
			{prep.arriveEarly ? <p className="tabular mt-2 text-[12px] text-ink-dim">Arrive {prep.arriveEarly} minutes early.</p> : null}
		</div>
	);
}
