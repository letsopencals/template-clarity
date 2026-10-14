import { Reveal } from '@/components/motion/reveal';
import { SectionHeader } from '@/components/ui/section-header';
import { siteConfig } from '@/lib/site-config';
import { clsx } from 'clsx';

const TILT = ['md:-rotate-[1.2deg]', 'md:rotate-[0.8deg] md:translate-y-10', 'md:rotate-[-0.6deg]', 'md:rotate-[1deg] md:translate-y-10'];

/** Patient words, as notes left on the reception desk. */
export function Testimonials() {
	return (
		<section id="testimonials" className="section-y grain relative bg-cream">
			<div className="container-x relative z-10">
				<SectionHeader
					eyebrow="07 · In their words"
					title={
						<>
							Notes left at <em>reception.</em>
						</>
					}
					align="center"
				/>
				<ul className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 xl:grid-cols-4">
					{siteConfig.testimonials.map((t, i) => (
						<Reveal as="li" key={t.author} delay={i * 0.07} className={clsx('min-w-0', TILT[i % TILT.length])}>
							<figure className="ruled paper relative flex h-full flex-col p-7 pt-9">
								<span aria-hidden className="absolute left-1/2 top-0 h-5 w-16 -translate-x-1/2 -translate-y-1/2 rotate-[-2deg] rounded-sm bg-honey-soft/90 shadow-sm" />
								<blockquote className="flex-1 font-display text-[1.2rem] leading-[2.1rem] tracking-tight text-ink">“{t.quote}”</blockquote>
								<figcaption className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-4 text-[13px]">
									<span className="font-semibold text-ink">{t.author}</span>
									<span className="text-ink-muted">{t.context}</span>
								</figcaption>
							</figure>
						</Reveal>
					))}
				</ul>
			</div>
		</section>
	);
}
