import Link from 'next/link';
import { FaqAccordion } from '@/components/ui/faq-accordion';
import { EmergencyNotice } from '@/components/care/emergency-notice';
import { DepartmentIcon } from '@/components/ui/department-icon';
import type { Department } from '@/lib/catalog';

/** Department questions, the emergency line, and the next room along the corridor. */
export function DepartmentFaq({ department: d, next }: { department: Department; next: Department | null }) {
	return (
		<section className="section-y border-t border-line bg-paper">
			<div className="container-x grid grid-cols-1 gap-12 lg:grid-cols-12">
				<div className="min-w-0 lg:col-span-4">
					<p className="eyebrow text-oak">Questions</p>
					<h2 className="display-sm mt-4 text-ink">
						Before you <em>book.</em>
					</h2>
					<EmergencyNotice className="mt-8" compact />
				</div>
				<div className="min-w-0 lg:col-span-8">
					{d.faqs.length ? <FaqAccordion items={d.faqs} /> : <p className="text-ink-muted">Call us with any question — a real person answers.</p>}
					{next ? (
						<Link
							href={`/departments/${next.slug}`}
							className="group mt-14 flex items-center justify-between gap-6 rounded-card border border-line bg-card p-6 shadow-card transition-shadow hover:shadow-float"
						>
							<span className="min-w-0">
								<span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-dim">Next room</span>
								<span className="mt-1 block font-display text-2xl text-ink group-hover:text-steel-deep">{next.title}</span>
								<span className="mt-1 block truncate text-sm text-ink-muted">{next.tagline}</span>
							</span>
							<DepartmentIcon name="arrow" className="h-5 w-5 shrink-0 text-steel transition-transform group-hover:translate-x-1" />
						</Link>
					) : null}
				</div>
			</div>
		</section>
	);
}
