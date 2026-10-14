import Link from 'next/link';
import type { PublicClinician } from '@/lib/clinicians';
import { siteConfig } from '@/lib/site-config';
import { SectionHeader } from '@/components/ui/section-header';
import { Reveal } from '@/components/motion/reveal';
import { ClinicianCard } from '@/components/clinicians/clinician-card';

/** The featured clinicians, resolved against the live staff list (missing ones skipped). */
export function CliniciansRail({ clinicians, total }: { clinicians: PublicClinician[]; total: number }) {
	if (clinicians.length === 0) return null;
	return (
		<section id="doctors" className="section-y overflow-hidden bg-cream">
			<div className="container-x">
				<SectionHeader
					eyebrow="04 · The people"
					title={
						<>
							Clinicians who <em>take their time.</em>
						</>
					}
					lead={`${total || 'Eighty'} doctors, nurses, therapists and dentists — the same faces whether you come in or join by video.`}
					action={
						<Link href="/clinicians" className="link-underline text-sm font-medium text-steel">
							Meet everyone
						</Link>
					}
				/>
			</div>
			<ul
				className="no-scrollbar mt-14 flex snap-x snap-mandatory overflow-y-hidden scroll-px-5 gap-5 overflow-x-auto px-5 pb-4 md:scroll-px-10 md:gap-7 md:px-10 xl:scroll-px-[max(2.5rem,calc((100vw-1360px)/2+2.5rem))] xl:px-[max(2.5rem,calc((100vw-1360px)/2+2.5rem))]"
				aria-label="Featured clinicians"
			>
				{clinicians.map((c, i) => (
					<Reveal as="li" key={c.slug} delay={Math.min(i, 4) * 0.06} className="w-[15rem] shrink-0 snap-start md:w-[17rem]">
						<ClinicianCard
							clinician={c}
							departmentLabel={c.departments[0] ? (siteConfig.departments[c.departments[0]]?.short ?? null) : null}
							sizes="272px"
						/>
					</Reveal>
				))}
				<li className="flex w-[15rem] shrink-0 snap-start md:w-[17rem]">
					<Link
						href="/clinicians"
						className="group flex aspect-[4/5] w-full flex-col justify-between rounded-card border border-brass/40 p-6 text-ink transition-colors hover:border-steel hover:bg-paper"
					>
						<span className="eyebrow text-oak">Directory</span>
						<span className="font-display text-[1.9rem] leading-tight tracking-tight">
							Find your <em className="italic text-steel">clinician</em>
						</span>
						<span className="text-sm text-ink-muted">By department, clinic or video →</span>
					</Link>
				</li>
			</ul>
		</section>
	);
}
