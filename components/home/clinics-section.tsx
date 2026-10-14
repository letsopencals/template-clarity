import Link from 'next/link';
import { WindowFrame } from '@/components/motifs/window-frame';
import { SectionHeader } from '@/components/ui/section-header';
import { DepartmentIcon } from '@/components/ui/department-icon';
import { Reveal } from '@/components/motion/reveal';
import { OpenStatus } from '@/components/contact/open-status';
import type { ClinicView } from '@/components/contact/clinic-view';

/** The three clinics, each in its window, with a live open/closed status. */
export function ClinicsSection({ clinics }: { clinics: ClinicView[] }) {
	if (clinics.length === 0) return null;
	return (
		<section id="clinics" className="section-y bg-paper">
			<div className="container-x">
				<SectionHeader
					eyebrow="06 · Our clinics"
					title={
						<>
							Three quiet clinics, <em>full of daylight.</em>
						</>
					}
					lead="Every clinic has every department and the same unhurried rooms. Pick the one closest to you — or don’t leave home at all."
					action={
						<Link href="/contact#clinics" className="link-underline text-sm font-medium text-steel">
							Hours & directions
						</Link>
					}
				/>
				<ul className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-7">
					{clinics.map((c, i) => (
						<Reveal as="li" key={c.id} delay={i * 0.08} className="min-w-0">
							<WindowFrame src={c.image} alt={`The ${c.name} clinic`} aspect="aspect-[4/5]" sizes="(min-width: 768px) 30vw, 100vw">
								<div className="absolute left-5 top-5 z-[3]">
									<OpenStatus timezone={c.timezone} className="bg-paper/90" />
								</div>
							</WindowFrame>
							<div className="mt-5 flex items-start justify-between gap-4">
								<div className="min-w-0">
									<h3 className="display-xs text-ink">{c.name}</h3>
									{c.tagline ? <p className="mt-1 text-[15px] text-ink-muted">{c.tagline}</p> : null}
								</div>
								<span className="tabular text-xs text-ink-dim">{String(i + 1).padStart(2, '0')}</span>
							</div>
							<address className="mt-4 not-italic text-[14px] leading-relaxed text-ink">
								{c.addressLines.map((l) => (
									<span key={l} className="block">
										{l}
									</span>
								))}
							</address>
							{c.note ? <p className="mt-2 text-[13px] text-ink-dim">{c.note}</p> : null}
							<a href={c.mapHref} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-steel hover:text-steel-deep">
								<DepartmentIcon name="pin" className="h-4 w-4" />
								<span className="link-underline">Directions</span>
							</a>
						</Reveal>
					))}
				</ul>
			</div>
		</section>
	);
}
