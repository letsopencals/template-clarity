import { Reveal } from '@/components/motion/reveal';
import { siteConfig } from '@/lib/site-config';

/** Four promises, numbered like notes on a chart. */
export function AboutValues() {
	return (
		<section className="section-y bg-cream">
			<div className="container-x">
				<p className="eyebrow text-oak">What we promise</p>
				<h2 className="display-md mt-4 max-w-3xl text-ink">
					Four things <em>we won’t compromise on.</em>
				</h2>
				<ol className="mt-14 grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
					{siteConfig.about.values.map((v, i) => (
						<Reveal as="li" key={v.n} delay={i * 0.08} className="min-w-0 border-t border-line-strong pt-6">
							<span className="tabular font-display text-4xl italic text-brass">{v.n}</span>
							<h3 className="mt-4 font-display text-2xl text-ink">{v.title}</h3>
							<p className="mt-3 text-[15px] leading-relaxed text-ink-muted">{v.body}</p>
						</Reveal>
					))}
				</ol>
			</div>
		</section>
	);
}
