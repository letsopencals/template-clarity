'use client';

import { motion } from 'framer-motion';
import { siteConfig } from '@/lib/site-config';

const stepIcons: Record<string, React.ReactNode> = {
	browse: <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h7" />,
	clinician: <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
	calendar: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" />,
	check: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
};

export function HowItWorks() {
	const { process } = siteConfig;

	return (
		<section id="how-it-works" className="relative scroll-mt-24 overflow-hidden bg-[var(--color-sand)] py-20 lg:py-28">
			<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
				<div className="mx-auto max-w-2xl text-center">
					<span className="chip">
						<span className="h-1.5 w-1.5 rounded-full bg-[var(--color-leaf)]" />
						{process.eyebrow}
					</span>
					<h2 className="heading-display mt-5 text-4xl text-[var(--color-ink)] lg:text-5xl">
						{process.heading} <span className="heading-display-italic text-[var(--color-primary)]">{process.headingAccent}</span>
					</h2>
					<p className="mt-5 text-lg leading-relaxed text-[var(--color-ink-muted)]">{process.body}</p>
				</div>

				<div className="relative mt-16">
					{/* animated sage vine connector (desktop) */}
					<svg className="pointer-events-none absolute inset-x-0 top-7 hidden h-8 w-full lg:block" viewBox="0 0 1000 40" fill="none" preserveAspectRatio="none" aria-hidden>
						<motion.path
							initial={{ pathLength: 0 }}
							whileInView={{ pathLength: 1 }}
							viewport={{ once: true }}
							transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
							d="M125 20C300 -6 360 46 500 20s340 -18 375 0"
							stroke="var(--color-sage)"
							strokeWidth="2.5"
							strokeDasharray="2 9"
							strokeLinecap="round"
						/>
					</svg>

					<div className="relative grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						{process.steps.map((step, i) => (
							<motion.div
								key={step.number}
								initial={{ opacity: 0, y: 22 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: '-60px' }}
								transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
								className="group relative flex flex-col items-center rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] px-6 pb-7 pt-10 text-center card-shadow transition-all hover:-translate-y-1 hover:card-shadow-lg"
							>
								{/* number node sitting on the vine */}
								<span className="absolute -top-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-lg font-semibold text-white ring-8 ring-[var(--color-sand)] transition-colors group-hover:bg-[var(--color-primary-bright)]">
									{step.number}
								</span>

								<span className="mt-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-sage-soft)] text-[var(--color-leaf)]">
									<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
										{stepIcons[step.icon] ?? stepIcons.check}
									</svg>
								</span>

								<h3 className="mt-5 text-lg font-semibold text-[var(--color-ink)]">{step.title}</h3>
								<p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">{step.body}</p>
							</motion.div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
