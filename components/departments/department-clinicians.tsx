import Link from 'next/link';
import { SectionHeader } from '@/components/ui/section-header';
import { Reveal } from '@/components/motion/reveal';
import { ClinicianCard } from '@/components/clinicians/clinician-card';
import type { PublicClinician } from '@/lib/clinicians';

/** Who you'll see in this department — curated faces first, linked to the full directory. */
export function DepartmentClinicians({ clinicians, slug, short }: { clinicians: PublicClinician[]; slug: string; short: string }) {
	if (clinicians.length === 0) return null;
	const shown = clinicians.slice(0, 8);
	return (
		<section className="section-y bg-paper pt-0">
			<div className="container-x">
				<SectionHeader
					eyebrow="Who you’ll see"
					title={
						<>
							The {short.toLowerCase()} <em>team.</em>
						</>
					}
					action={
						<Link href={`/clinicians?department=${slug}`} className="link-underline text-sm font-medium text-steel">
							All {clinicians.length} clinicians
						</Link>
					}
				/>
				<ul className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
					{shown.map((c, i) => (
						<Reveal as="li" key={c.id} delay={(i % 4) * 0.06} className="min-w-0">
							<ClinicianCard clinician={c} sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 46vw" />
						</Reveal>
					))}
				</ul>
			</div>
		</section>
	);
}
