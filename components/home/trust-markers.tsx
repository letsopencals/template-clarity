import { WindowFrame } from '@/components/motifs/window-frame';
import { DepartmentIcon } from '@/components/ui/department-icon';
import { SectionHeader } from '@/components/ui/section-header';
import { Reveal } from '@/components/motion/reveal';
import { imagePath } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';

/** Why Clear Care: four plain promises beside a window. */
export function TrustMarkers() {
	return (
		<section id="why-clear-care" className="section-y bg-paper">
			<div className="container-x grid grid-cols-1 items-center gap-14 lg:grid-cols-12">
				<div className="min-w-0 lg:col-span-5">
					<WindowFrame src={imagePath(siteConfig.about.trustImage)} alt="A Clear Care nurse with a patient" aspect="aspect-[4/5]" sizes="(min-width: 1024px) 36vw, 100vw" daylight />
				</div>
				<div className="min-w-0 lg:col-span-7">
					<SectionHeader
						eyebrow="08 · Why Clear Care"
						title={
							<>
								Care you can <em>trust</em>, prices you can read.
							</>
						}
					/>
					<ul className="mt-12 grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-2">
						{siteConfig.trust.map((t, i) => (
							<Reveal as="li" key={t.title} delay={i * 0.06} className="min-w-0 border-t border-line pt-6">
								<span className="flex h-11 w-11 items-center justify-center rounded-full border border-brass/50 text-oak">
									<DepartmentIcon name={t.icon} className="h-5 w-5" />
								</span>
								<h3 className="mt-5 font-display text-[1.35rem] leading-tight tracking-tight text-ink">{t.title}</h3>
								<p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{t.body}</p>
							</Reveal>
						))}
					</ul>
				</div>
			</div>
		</section>
	);
}
