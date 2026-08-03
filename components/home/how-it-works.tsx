'use client';

import { motion } from 'framer-motion';
import { siteConfig } from '@/lib/site-config';

export function HowItWorks() {
	const { process } = siteConfig;

	return (
		<section className="relative bg-[var(--color-sand)] py-20 lg:py-28">
			<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
				<div className="mx-auto max-w-2xl text-center">
					<span className="chip">{process.eyebrow}</span>
					<h2 className="heading-display mt-5 text-4xl text-[var(--color-ink)] lg:text-5xl">
						Booking care, made effortless
					</h2>
					<p className="mt-5 text-lg leading-relaxed text-[var(--color-ink-muted)]">
						From choosing a department to walking into your appointment — four simple steps, all online.
					</p>
				</div>

				<div className="relative mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
					{process.steps.map((step, i) => (
						<motion.div
							key={step.number}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: '-60px' }}
							transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
							className="relative rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-7 card-shadow"
						>
							<span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-base font-semibold text-white">
								{step.number}
							</span>
							<h3 className="mt-6 text-lg font-semibold text-[var(--color-ink)]">{step.title}</h3>
							<p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">{step.body}</p>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
