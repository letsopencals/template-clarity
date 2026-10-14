import { FaqAccordion } from '@/components/ui/faq-accordion';
import { SectionHeader } from '@/components/ui/section-header';
import { EmergencyNotice } from '@/components/care/emergency-notice';
import { siteConfig } from '@/lib/site-config';

/** Home questions, with the emergency line always in view beside them. */
export function HomeFaq() {
	return (
		<section id="faq" className="section-y bg-paper">
			<div className="container-x grid grid-cols-1 gap-12 lg:grid-cols-12">
				<div className="min-w-0 lg:col-span-4">
					<SectionHeader
						eyebrow="09 · Questions"
						title={
							<>
								Good to <em>know.</em>
							</>
						}
						lead="The things patients most often ask before their first visit."
						size="sm"
					/>
					<EmergencyNotice className="mt-10" />
				</div>
				<div className="min-w-0 lg:col-span-8">
					<FaqAccordion items={siteConfig.faqs} />
				</div>
			</div>
		</section>
	);
}
