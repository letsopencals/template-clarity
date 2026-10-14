import Link from 'next/link';
import { WindowFrame } from '@/components/motifs/window-frame';
import { CareLine } from '@/components/motifs/care-line';
import { buttonClasses } from '@/components/ui/button';
import { DepartmentIcon } from '@/components/ui/department-icon';
import { Reveal } from '@/components/motion/reveal';
import { imagePath } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';

const { videoVisit } = siteConfig;
const BARS = [0.35, 0.7, 0.5, 0.9, 0.6, 0.4, 0.75, 0.55, 0.3];

/** Steel spread: video visits, with a device-check teaser. */
export function VideoBand({ count }: { count: number }) {
	return (
		<section id="telehealth-band" className="grain relative overflow-hidden bg-steel-deep text-paper">
			<div className="container-x section-y relative z-10 grid grid-cols-1 items-center gap-14 lg:grid-cols-12">
				<div className="min-w-0 lg:col-span-6">
					<Reveal>
						<p className="eyebrow text-honey">05 · {videoVisit.eyebrow}</p>
						<h2 className="display-lg mt-5 text-paper [&_em]:text-honey">
							{videoVisit.title} <em>{videoVisit.accent}</em>
						</h2>
						<p className="mt-6 max-w-[48ch] text-[17px] leading-relaxed text-paper/75">{videoVisit.body}</p>
					</Reveal>
					<Reveal delay={0.1}>
						<ul className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2">
							{videoVisit.goodFor.slice(0, 4).map((g) => (
								<li key={g} className="flex items-center gap-3 text-[15px] text-paper/85">
									<DepartmentIcon name="check" className="h-4 w-4 shrink-0 text-honey" />
									{g}
								</li>
							))}
						</ul>
						<div className="mt-10 flex flex-wrap items-center gap-3">
							<Link href="/video-visits" className={buttonClasses({ variant: 'quiet', size: 'lg' })}>
								Check your camera
							</Link>
							<Link href="/video-visits#video-services" className="link-underline px-3 text-sm font-medium text-paper/85 hover:text-paper">
								{count ? `${count} visits available by video` : 'See video visits'}
							</Link>
						</div>
					</Reveal>
				</div>
				<div className="relative min-w-0 lg:col-span-6">
					<WindowFrame src={imagePath(videoVisit.image)} alt="A patient on a video visit at home" aspect="aspect-[5/4]" sizes="(min-width: 1024px) 45vw, 100vw" daylight>
						<div className="absolute inset-x-5 bottom-5 z-[3] flex items-end justify-between gap-4">
							<div className="glass-nav flex items-center gap-3 rounded-full py-2 pl-3 pr-4 text-ink">
								<span className="live-dot" aria-hidden />
								<span className="text-[13px] font-medium">Camera and mic look good</span>
							</div>
							<div aria-hidden className="hidden h-10 items-end gap-1 rounded-full bg-steel-night/70 px-3 py-2 sm:flex">
								{BARS.map((h, i) => (
									<span key={i} className="w-1 origin-bottom animate-breathe rounded-full bg-honey" style={{ height: `${h * 100}%`, animationDelay: `${i * 0.18}s` }} />
								))}
							</div>
						</div>
					</WindowFrame>
					<div className="absolute -left-3 -top-5 hidden rounded-card bg-paper px-4 py-3 text-ink shadow-float md:block">
						<p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-dim">Join window</p>
						<p className="tabular mt-0.5 text-sm">Opens {videoVisit.joinWindowMinutes} min before</p>
					</div>
				</div>
			</div>
			<CareLine tone="light" className="relative z-10 h-8" />
		</section>
	);
}
