'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { siteConfig } from '@/lib/site-config';
import { DepartmentIcon, type DepartmentIconName } from '@/components/ui/department-icon';

export function DepartmentsGrid() {
	const { departments, departmentsSection: copy } = siteConfig;

	return (
		<section id="departments" className="relative bg-[var(--color-bg)] py-20 lg:py-28">
			<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
				{/* Header */}
				<div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
					<div className="max-w-2xl">
						<span className="chip">
							<span className="h-1.5 w-1.5 rounded-full bg-[var(--color-leaf)]" />
							{copy.eyebrow}
						</span>
						<h2 className="heading-display mt-5 whitespace-pre-line text-4xl text-[var(--color-ink)] lg:text-5xl">
							{copy.heading}
						</h2>
						<p className="mt-5 text-lg leading-relaxed text-[var(--color-ink-muted)]">{copy.body}</p>
					</div>
					<Link
						href="/departments"
						className="group inline-flex flex-none items-center gap-2 rounded-full border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-6 py-3 text-sm font-semibold text-[var(--color-ink)] transition-all hover:border-[var(--color-primary)]/40 card-shadow"
					>
						View all departments
						<svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
						</svg>
					</Link>
				</div>

				{/* Grid */}
				<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{departments.map((dept, i) => (
						<motion.div
							key={dept.slug}
							initial={{ opacity: 0, y: 22 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: '-60px' }}
							transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
						>
							<Link
								href={`/departments/${dept.slug}`}
								className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] transition-all hover:-translate-y-1.5 hover:border-[var(--color-primary)]/25 hover:card-shadow-lg"
							>
								{/* image header */}
								<div className="relative aspect-[16/10] w-full overflow-hidden">
									<Image
										src={`/images/departments/${dept.slug}.jpg`}
										alt={dept.name}
										fill
										className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
										sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)]/45 via-transparent to-transparent" />
									{/* overlapping icon chip */}
									<span className="glass-strong absolute -bottom-5 left-5 flex h-14 w-14 items-center justify-center rounded-2xl text-[var(--color-primary)]">
										<DepartmentIcon name={dept.icon as DepartmentIconName} className="h-7 w-7" />
									</span>
								</div>

								{/* body */}
								<div className="flex flex-1 flex-col px-6 pb-6 pt-8">
									<h3 className="text-lg font-semibold text-[var(--color-ink)]">{dept.name}</h3>
									<p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--color-ink-muted)]">{dept.blurb}</p>
									<span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)]">
										Book now
										<svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
											<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
										</svg>
									</span>
								</div>
							</Link>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
