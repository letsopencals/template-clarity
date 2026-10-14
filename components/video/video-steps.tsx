import { Reveal } from '@/components/motion/reveal';
import { CareLine } from '@/components/motifs/care-line';
import { siteConfig } from '@/lib/site-config';

/** Three steps from booking to joining, on a steel-deep spread. */
export function VideoSteps() {
	const { steps, joinWindowMinutes } = siteConfig.videoVisit;
	return (
		<section className="section-y relative overflow-hidden bg-steel-deep text-paper">
			<div className="container-x">
				<p className="eyebrow text-honey">How it works</p>
				<h2 className="display-md mt-4 max-w-3xl text-paper [&_em]:text-honey">
					No app, no waiting room. <em>Just a link.</em>
				</h2>
				<ol className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
					{steps.map((s, i) => (
						<Reveal as="li" key={s.n} delay={i * 0.1} className="min-w-0 border-t border-paper/20 pt-6">
							<span className="tabular font-display text-5xl italic text-honey">{s.n}</span>
							<h3 className="mt-4 font-display text-2xl text-paper">{s.title}</h3>
							<p className="mt-3 max-w-[36ch] text-[15px] leading-relaxed text-paper/75">{s.body}</p>
						</Reveal>
					))}
				</ol>
				<p className="mt-12 text-sm text-paper/60">The join button in My Care opens {joinWindowMinutes} minutes before your visit.</p>
			</div>
			<div className="container-x mt-10">
				<CareLine tone="light" />
			</div>
		</section>
	);
}
