'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { siteConfig } from '@/lib/site-config';

export function TelehealthBand() {
	const { telehealth } = siteConfig;

	return (
		<section className="relative bg-[var(--color-bg)] py-20 lg:py-28">
			<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
				<div className="gradient-medical relative overflow-hidden rounded-[2.5rem] px-8 py-14 card-shadow-lg lg:px-16 lg:py-20">
					{/* Decorative glass blobs */}
					<div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
					<div className="pointer-events-none absolute -bottom-20 left-10 h-52 w-52 rounded-full bg-[var(--color-brass)]/30 blur-2xl" />

					<div className="relative grid items-center gap-12 lg:grid-cols-2">
						<div>
							<span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
								{telehealth.eyebrow}
							</span>
							<h2 className="heading-display mt-6 whitespace-pre-line text-4xl text-white lg:text-5xl">
								{telehealth.heading}
							</h2>
							<p className="mt-5 max-w-md text-lg leading-relaxed text-white/85">{telehealth.body}</p>
							<Link
								href={telehealth.cta.href}
								className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-4 text-sm font-semibold text-[var(--color-primary)] transition-transform hover:-translate-y-0.5"
							>
								{telehealth.cta.label}
								<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
								</svg>
							</Link>
						</div>

						{/* Glass checklist card */}
						<motion.div
							initial={{ opacity: 0, y: 24 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: '-60px' }}
							transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
							className="glass-dark rounded-3xl p-7 lg:p-9"
						>
							<ul className="space-y-4">
								{telehealth.points.map((point) => (
									<li key={point} className="flex items-start gap-3.5">
										<span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[var(--color-primary)]">
											<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
												<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
											</svg>
										</span>
										<span className="text-base font-medium text-white">{point}</span>
									</li>
								))}
							</ul>
						</motion.div>
					</div>
				</div>
			</div>
		</section>
	);
}
