import { SectionHeader } from '@/components/ui/section-header';
import { VisitFeeRow } from '@/components/services/visit-fee-row';
import type { Visit } from '@/lib/catalog';

/** Every visit bookable at the online location, linking into the composer in video mode. */
export function VideoServices({ visits, currency, departmentLabel }: { visits: Visit[]; currency: string; departmentLabel: Record<string, string> }) {
	return (
		<section id="video-services" className="section-y scroll-mt-24 bg-paper">
			<div className="container-x grid grid-cols-1 gap-12 lg:grid-cols-12">
				<div className="min-w-0 lg:col-span-4">
					<SectionHeader
						eyebrow="Visits you can take by video"
						size="sm"
						title={
							<>
								Same fee, <em>no commute.</em>
							</>
						}
						lead="Video visits cost the same as in clinic and are with the same clinicians."
					/>
				</div>
				<div className="min-w-0 lg:col-span-8">
					{visits.length ? (
						<ul>
							{visits.map((v) => (
								<VisitFeeRow
									key={v.slug}
									visit={{ ...v, groupTitle: v.department ? (departmentLabel[v.department] ?? v.groupTitle) : v.groupTitle }}
									currency={currency}
									mode="video"
									showReason
								/>
							))}
						</ul>
					) : (
						<p className="rounded-card border border-dashed border-line-strong p-8 text-ink-muted">Video visits are being set up. Please call us to book one.</p>
					)}
				</div>
			</div>
		</section>
	);
}
