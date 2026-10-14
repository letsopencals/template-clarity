import { clsx } from 'clsx';
import { WindowFrame } from '@/components/motifs/window-frame';
import { CareLine } from '@/components/motifs/care-line';
import { Reveal } from '@/components/motion/reveal';

export interface PageHeroProps {
	eyebrow: string;
	/** Headline with the emotional word in <em>. */
	title: React.ReactNode;
	lead?: React.ReactNode;
	/** Optional window photo on the right. */
	image?: string | null;
	imageAlt?: string;
	/** Floating chip/caption inside the window. */
	imageChildren?: React.ReactNode;
	/** Actions / meta under the lead. */
	children?: React.ReactNode;
	/** Draw the care line along the bottom. */
	line?: boolean;
	className?: string;
}

/**
 * The opener for every inner page: eyebrow, Fraunces headline, lead, and
 * (optionally) a photo in a window. Server component; motion comes from the
 * Reveal / WindowFrame primitives.
 */
export function PageHero({ eyebrow, title, lead, image, imageAlt = '', imageChildren, children, line = true, className }: PageHeroProps) {
	return (
		<section className={clsx('grain relative overflow-hidden bg-paper pt-32 md:pt-36', className)}>
			<div aria-hidden className="pointer-events-none absolute -right-48 -top-48 h-[38rem] w-[38rem] rounded-full bg-honey-soft/60 blur-3xl" />
			<div className={clsx('container-x relative z-10 grid grid-cols-1 gap-12 pb-12 lg:gap-14', image ? 'items-end lg:grid-cols-12' : '')}>
				<div className={clsx('min-w-0', image ? 'lg:col-span-7' : 'max-w-4xl')}>
					<Reveal>
						<p className="eyebrow text-oak">{eyebrow}</p>
					</Reveal>
					<Reveal delay={0.08}>
						<h1 className="display-lg mt-5 text-ink">{title}</h1>
					</Reveal>
					{lead ? (
						<Reveal delay={0.16}>
							<p className="mt-6 max-w-[56ch] text-[17px] leading-relaxed text-ink-muted md:text-lg">{lead}</p>
						</Reveal>
					) : null}
					{children ? (
						<Reveal delay={0.24} className="mt-9">
							{children}
						</Reveal>
					) : null}
				</div>
				{image ? (
					<div className="min-w-0 lg:col-span-5">
						<WindowFrame src={image} alt={imageAlt} aspect="aspect-[4/5] lg:aspect-[5/6]" sizes="(min-width: 1024px) 38vw, 100vw" priority daylight>
							{imageChildren}
						</WindowFrame>
					</div>
				) : null}
			</div>
			{line ? (
				<div className="container-x relative z-10">
					<CareLine settled trigger="mount" tone="brass" />
				</div>
			) : null}
		</section>
	);
}
