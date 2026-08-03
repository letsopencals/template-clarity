'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { siteConfig } from '@/lib/site-config';
import { DepartmentIcon, type DepartmentIconName } from '@/components/ui/department-icon';

export function DepartmentsGrid() {
	const { departments, departmentsSection: copy } = siteConfig;

	return (
		<section id="departments" className="relative bg-[var(--color-bg)] py-20 lg:py-28">
			<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
				<div className="max-w-2xl">
					<span className="chip">{copy.eyebrow}</span>
					<h2 className="heading-display mt-5 whitespace-pre-line text-4xl text-[var(--color-ink)] lg:text-5xl">
						{copy.heading}
					</h2>
					<p className="mt-5 text-lg leading-relaxed text-[var(--color-ink-muted)]">{copy.body}</p>
				</div>

				<div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{departments.map((dept, i) => (
						<motion.div
							key={dept.slug}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: '-60px' }}
							transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
						>
							<Link
								href={`/departments/${dept.slug}`}
								className="group flex h-full flex-col rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-7 transition-all hover:-translate-y-1 hover:border-[var(--color-primary)]/30 hover:card-shadow-lg"
							>
								<span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-brass-soft)] text-[var(--color-primary)] transition-colors group-hover:bg-[var(--color-primary)] group-hover:text-white">
									<DepartmentIcon name={dept.icon as DepartmentIconName} className="h-7 w-7" />
								</span>
								<h3 className="mt-6 text-lg font-semibold text-[var(--color-ink)]">{dept.name}</h3>
								<p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--color-ink-muted)]">{dept.blurb}</p>
								<span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)]">
									Book now
									<svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
									</svg>
								</span>
							</Link>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
