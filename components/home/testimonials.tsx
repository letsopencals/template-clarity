'use client';

import { motion } from 'framer-motion';
import { siteConfig } from '@/lib/site-config';

export function Testimonials() {
	const { testimonials, statsBand } = siteConfig;

	return (
		<section className="relative bg-[var(--color-sand)] py-20 lg:py-28">
			<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
				{/* Stats band */}
				<div className="grid gap-6 rounded-[2rem] border border-[var(--color-line)] bg-[var(--color-surface)] p-8 card-shadow sm:grid-cols-3 lg:p-10">
					{statsBand.stats.map((stat) => (
						<div key={stat.label} className="text-center">
							<p className="heading-display text-4xl text-[var(--color-primary)] lg:text-5xl">{stat.value}</p>
							<p className="mt-2 text-sm font-medium text-[var(--color-ink-muted)]">{stat.label}</p>
						</div>
					))}
				</div>

				<div className="mt-16 max-w-2xl">
					<span className="chip">Patient Stories</span>
					<h2 className="heading-display mt-5 text-4xl text-[var(--color-ink)] lg:text-5xl">
						Loved by patients across Boston
					</h2>
				</div>

				<div className="mt-10 grid gap-6 md:grid-cols-2">
					{testimonials.map((t, i) => (
						<motion.figure
							key={t.author}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: '-60px' }}
							transition={{ duration: 0.5, delay: (i % 2) * 0.08, ease: [0.22, 1, 0.36, 1] }}
							className="flex flex-col rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-7 card-shadow"
						>
							<div className="flex items-center gap-0.5 text-[var(--color-brass)]">
								{[0, 1, 2, 3, 4].map((s) => (
									<svg key={s} className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
										<path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 15l-5.3 2.6 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
									</svg>
								))}
							</div>
							<blockquote className="mt-4 flex-1 text-base leading-relaxed text-[var(--color-ink)]">
								“{t.quote}”
							</blockquote>
							<figcaption className="mt-6 flex items-center gap-3">
								<span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brass-soft)] text-sm font-semibold text-[var(--color-primary)]">
									{t.author.charAt(0)}
								</span>
								<div>
									<p className="text-sm font-semibold text-[var(--color-ink)]">{t.author}</p>
									<p className="text-xs text-[var(--color-ink-dim)]">{t.role}</p>
								</div>
							</figcaption>
						</motion.figure>
					))}
				</div>
			</div>
		</section>
	);
}
