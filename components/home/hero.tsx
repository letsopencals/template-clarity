import { WindowFrame } from '@/components/motifs/window-frame';
import { CareLine } from '@/components/motifs/care-line';
import { CountUp } from '@/components/motion/count-up';
import { Reveal } from '@/components/motion/reveal';
import { imagePath } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';
import { HeroHeadline } from './hero-headline';
import { CareFinderStrip } from './care-finder-strip';
import { NextOpenChip } from './next-open-chip';

const { hero } = siteConfig;

/** Home hero: the promise, the front door to the Care Finder, and the portrait in a window. */
export function Hero() {
	return (
		<section className="grain relative overflow-hidden bg-paper pt-28 md:pt-32" id="hero">
			<div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[42rem] w-[42rem] rounded-full bg-honey-soft/70 blur-3xl" />
			<div className="container-x relative z-10 grid grid-cols-1 items-end gap-12 pb-12 lg:grid-cols-12 lg:gap-14 lg:pb-16">
				<div className="min-w-0 lg:col-span-7">
					<Reveal>
						<p className="eyebrow text-oak">{hero.eyebrow}</p>
					</Reveal>
					<div className="mt-6">
						<HeroHeadline lead={hero.lead} accent={hero.accent} />
					</div>
					<Reveal delay={0.35}>
						<p className="mt-7 max-w-[46ch] text-[17px] leading-relaxed text-ink-muted md:text-lg">{hero.body}</p>
					</Reveal>
					<Reveal delay={0.45} className="mt-9 max-w-[40rem]">
						<CareFinderStrip />
					</Reveal>
					<dl className="mt-10 grid max-w-[40rem] grid-cols-3 gap-4 border-t border-line pt-6">
						{hero.proof.map((p) => (
							<div key={p.label} className="min-w-0">
								<dt className="sr-only">{p.label}</dt>
								<dd className="font-display text-[2rem] leading-none tracking-tight text-ink md:text-[2.5rem]">
									<CountUp value={p.value} decimals={p.decimals} suffix={p.suffix} />
								</dd>
								<dd className="mt-2 text-[13px] leading-snug text-ink-muted">{p.label}</dd>
							</div>
						))}
					</dl>
				</div>

				<div className="relative min-w-0 lg:col-span-5">
					<WindowFrame
						src={imagePath(hero.image)}
						alt={hero.imageAlt}
						aspect="aspect-[4/5]"
						sizes="(min-width: 1024px) 38vw, 100vw"
						priority
						daylight
						className="shadow-float"
					/>
					<NextOpenChip className="absolute -bottom-5 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-[22rem]" />
				</div>
			</div>
			<CareLine trigger="mount" className="relative z-10 h-10" />
		</section>
	);
}
