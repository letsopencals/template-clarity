import { SectionHeader } from '@/components/ui/section-header';
import { VisitFeeRow } from '@/components/services/visit-fee-row';
import { shortName, type PublicClinician } from '@/lib/clinicians';
import type { Visit } from '@/lib/catalog';

/** What you can book with this clinician — each Book link carries `?staff=` into the composer. */
export function ClinicianVisits({ clinician, visits, currency }: { clinician: PublicClinician; visits: Visit[]; currency: string }) {
	return (
		<section id="visits" className="section-y scroll-mt-24 bg-paper">
			<div className="container-x grid grid-cols-1 gap-12 lg:grid-cols-12">
				<div className="min-w-0 lg:col-span-4">
					<SectionHeader
						eyebrow="Visits & fees"
						size="sm"
						title={
							<>
								Book with <em>{shortName(clinician)}.</em>
							</>
						}
						lead="Choose a visit and we’ll show their open times first."
					/>
				</div>
				<div className="min-w-0 lg:col-span-8">
					{visits.length ? (
						<ul>
							{visits.map((v) => (
								<VisitFeeRow key={v.slug} visit={v} currency={currency} staff={clinician.slug} showReason />
							))}
						</ul>
					) : (
						<p className="rounded-card border border-dashed border-line-strong p-8 text-ink-muted">
							{shortName(clinician)} isn’t taking online bookings right now. Call us and we’ll find a time.
						</p>
					)}
				</div>
			</div>
		</section>
	);
}
