'use client';

import { siteConfig } from '@/lib/site-config';
import { FaqAccordion } from '@/components/ui/faq-accordion';

export function FaqSection() {
	return (
		<section id="faq" className="bg-[var(--color-bg)] py-20 lg:py-28">
			<div className="mx-auto max-w-[900px] px-6 lg:px-10">
				<div className="text-center">
					<span className="chip">Good to Know</span>
					<h2 className="heading-display mt-5 text-4xl text-[var(--color-ink)] lg:text-5xl">
						Questions, answered
					</h2>
					<p className="mt-5 text-lg leading-relaxed text-[var(--color-ink-muted)]">
						Everything you need to know before your first visit.
					</p>
				</div>
				<div className="mt-12">
					<FaqAccordion items={siteConfig.faqs} />
				</div>
			</div>
		</section>
	);
}
