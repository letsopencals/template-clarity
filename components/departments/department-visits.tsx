import { SectionHeader } from '@/components/ui/section-header';
import { VisitFeeRow } from '@/components/services/visit-fee-row';
import type { Visit } from '@/lib/catalog';

/** The department's printed fee card. */
export function DepartmentVisits({ visits, currency, title }: { visits: Visit[]; currency: string; title: string }) {
	return (
		<section id="visits" className="section-y scroll-mt-24 bg-paper">
			<div className="container-x grid grid-cols-1 gap-12 lg:grid-cols-12">
				<div className="min-w-0 lg:col-span-4">
					<SectionHeader
						eyebrow="Visits & fees"
						size="sm"
						title={
							<>
								Clear prices, <em>up front.</em>
							</>
						}
						lead={`Every ${title.toLowerCase()} visit, how long it takes and what it costs. Insurance details can go in your pre-visit notes.`}
					/>
				</div>
				<div className="min-w-0 lg:col-span-8">
					{visits.length ? (
						<ul>
							{visits.map((v) => (
								<VisitFeeRow key={v.slug} visit={v} currency={currency} showReason />
							))}
						</ul>
					) : (
						<p className="rounded-card border border-dashed border-line-strong p-8 text-ink-muted">
							Visits for this department are being updated. Call us and we’ll book you in by phone.
						</p>
					)}
				</div>
			</div>
		</section>
	);
}
