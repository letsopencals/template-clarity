import { WindowFrame } from '@/components/motifs/window-frame';
import { Reveal } from '@/components/motion/reveal';
import { DepartmentIcon } from '@/components/ui/department-icon';
import { OpenStatus } from './open-status';
import { ClinicTimetable } from './clinic-timetable';
import type { ClinicView } from './clinic-view';

/** Contact page clinics: window, live status, address, timetable and directions. */
export function ClinicDirectory({ clinics }: { clinics: ClinicView[] }) {
	return (
		<section id="clinics" className="section-y scroll-mt-20 bg-paper">
			<div className="container-x">
				<p className="eyebrow text-oak">Our clinics</p>
				<h2 className="display-md mt-4 text-ink">
					Come and <em>see us.</em>
				</h2>
				{clinics.length ? (
					<ul className="mt-14 flex flex-col gap-16">
						{clinics.map((c, i) => (
							<Reveal as="li" key={c.id} className="grid min-w-0 grid-cols-1 gap-8 md:grid-cols-12 md:gap-12">
								<div className="min-w-0 md:col-span-5">
									<WindowFrame src={c.image} alt={`The ${c.name} clinic`} aspect="aspect-[4/3]" sizes="(min-width: 768px) 40vw, 100vw">
										<div className="absolute left-5 top-5 z-[3]">
											<OpenStatus timezone={c.timezone} className="bg-paper/90" />
										</div>
									</WindowFrame>
								</div>
								<div className="grid min-w-0 grid-cols-1 gap-8 md:col-span-7 lg:grid-cols-2">
									<div className="min-w-0">
										<span className="tabular text-xs text-ink-dim">{String(i + 1).padStart(2, '0')}</span>
										<h3 className="display-sm mt-2 text-ink">{c.name}</h3>
										{c.tagline ? <p className="mt-2 font-display text-[17px] italic text-steel">{c.tagline}</p> : null}
										<address className="mt-5 not-italic text-[15px] leading-relaxed text-ink">
											{c.addressLines.map((l) => (
												<span key={l} className="block">
													{l}
												</span>
											))}
										</address>
										{c.note ? <p className="mt-3 text-[13px] text-ink-dim">{c.note}</p> : null}
										<a href={c.mapHref} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-steel hover:text-steel-deep">
											<DepartmentIcon name="pin" className="h-4 w-4" />
											<span className="link-underline">Get directions</span>
										</a>
									</div>
									<div className="min-w-0">
										<p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-dim">Opening hours · local time</p>
										<ClinicTimetable />
									</div>
								</div>
							</Reveal>
						))}
					</ul>
				) : (
					<p className="mt-10 rounded-card border border-dashed border-line-strong p-8 text-ink-muted">We couldn’t load our clinic details just now — please call us for directions.</p>
				)}
			</div>
		</section>
	);
}
