import { WindowFrame } from '@/components/motifs/window-frame';
import { Seal } from '@/components/motifs/seal';
import { Reveal } from '@/components/motion/reveal';
import { imagePath } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';

const { about, founded } = siteConfig;

/** The story, set on ruled paper beside two windows into the practice. */
export function AboutStory() {
	const [a, b] = about.images;
	return (
		<section className="section-y bg-paper">
			<div className="container-x grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
				<div className="relative min-w-0 lg:col-span-5">
					{a ? <WindowFrame src={imagePath(a)} alt="Inside a Clear Care clinic" aspect="aspect-[4/5]" sizes="(min-width: 1024px) 34vw, 100vw" /> : null}
					{b ? (
						<div className="relative -mt-24 ml-auto w-[58%] md:-mt-32">
							<WindowFrame src={imagePath(b)} alt="A detail of a consultation room" aspect="aspect-square" sizes="(min-width: 1024px) 20vw, 58vw" className="shadow-float" />
						</div>
					) : null}
					<div className="absolute -left-2 bottom-6 md:-left-6">
						<Seal ring={`Clear Care Medical · Since ${founded} · `} center={String(founded)} size={112} className="rounded-full bg-paper shadow-card" />
					</div>
				</div>
				<div className="min-w-0 lg:col-span-7 lg:pt-10">
					<Reveal>
						<p className="eyebrow text-oak">Our story</p>
						<h2 className="display-md mt-4 text-ink">
							No ten-minute <em>appointments.</em>
						</h2>
					</Reveal>
					<Reveal delay={0.1}>
						<div className="paper mt-10 p-8 md:p-10">
							<div className="ruled flex flex-col gap-[2.1rem] text-[17px] leading-[2.1rem] text-ink">
								{about.story.map((p) => (
									<p key={p.slice(0, 24)}>{p}</p>
								))}
							</div>
							<p className="mt-8 text-right font-display text-xl italic text-steel">— The Clear Care team</p>
						</div>
					</Reveal>
				</div>
			</div>
		</section>
	);
}
