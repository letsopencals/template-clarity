import Link from 'next/link';
import { SectionHeader } from '@/components/ui/section-header';
import { Reveal } from '@/components/motion/reveal';
import { ClinicianCard } from '@/components/clinicians/clinician-card';
import type { PublicClinician } from '@/lib/clinicians';

/** A few of the faces patients know, with a path to the full directory. */
export function AboutTeam({ clinicians, total }: { clinicians: PublicClinician[]; total: number }) {
	if (clinicians.length === 0) return null;
	return (
		<section className="section-y border-t border-line bg-paper">
			<div className="container-x">
				<SectionHeader
					eyebrow="The team"
					title={
						<>
							{total} clinicians, <em>one way of working.</em>
						</>
					}
					action={
						<Link href="/clinicians" className="link-underline text-sm font-medium text-steel">
							Meet everyone
						</Link>
					}
				/>
				<ul className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
					{clinicians.map((c, i) => (
						<Reveal as="li" key={c.id} delay={(i % 4) * 0.06} className="min-w-0">
							<ClinicianCard clinician={c} sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 46vw" />
						</Reveal>
					))}
				</ul>
			</div>
		</section>
	);
}
