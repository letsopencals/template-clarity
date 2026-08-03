'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { siteConfig } from '@/lib/site-config';
import { FaqAccordion } from '@/components/ui/faq-accordion';
import { CtaBand } from '@/components/home/cta-band';

export default function TelehealthPage() {
	const t = siteConfig.telehealthPage;

	return (
		<>
			{/* Hero */}
			<section className="bg-[var(--color-bg)] pt-32 pb-16 lg:pt-40 lg:pb-24">
				<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
					<div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
						<div>
							<span className="chip">{t.eyebrow}</span>
							<motion.h1
								initial={{ opacity: 0, y: 24 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.7 }}
								className="heading-display mt-5 text-5xl text-[var(--color-ink)] md:text-6xl lg:text-7xl"
							>
								{t.heading[0]}
								<br />
								<span className="heading-display-italic text-[var(--color-primary)]">{t.heading[1]}</span>
							</motion.h1>
							<p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--color-ink-muted)]">{t.body}</p>
							<Link
								href={t.cta.href}
								className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-[var(--color-primary)] px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-bright)] card-shadow"
							>
								{t.cta.label}
								<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
								</svg>
							</Link>
						</div>

						<motion.div
							initial={{ opacity: 0, scale: 0.98 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
							className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-[var(--color-line)] card-shadow-lg"
						>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={`/images/${t.heroImage}`} alt="Online consultation" className="h-full w-full object-cover" />
						</motion.div>
					</div>
				</div>
			</section>

			{/* How it works */}
			<section className="bg-[var(--color-sand)] py-20 lg:py-28">
				<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
					<div className="mx-auto max-w-2xl text-center">
						<span className="chip">How It Works</span>
						<h2 className="heading-display mt-5 text-4xl text-[var(--color-ink)] lg:text-5xl">
							An online visit in three steps
						</h2>
					</div>
					<div className="mt-14 grid gap-6 md:grid-cols-3">
						{t.steps.map((step, i) => (
							<motion.div
								key={step.number}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: '-60px' }}
								transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
								className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-7 card-shadow"
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

			{/* Good for / Best in clinic */}
			<section className="bg-[var(--color-bg)] py-20 lg:py-28">
				<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
					<div className="grid gap-6 lg:grid-cols-2">
						<div className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8 card-shadow lg:p-10">
							<h3 className="text-xl font-semibold text-[var(--color-ink)]">{t.goodFor.title}</h3>
							<ul className="mt-6 space-y-4">
								{t.goodFor.points.map((point) => (
									<li key={point} className="flex items-start gap-3.5">
										<span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
											<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
												<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
											</svg>
										</span>
										<span className="text-base text-[var(--color-ink)]">{point}</span>
									</li>
								))}
							</ul>
						</div>

						<div className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface-2)]/50 p-8 lg:p-10">
							<h3 className="text-xl font-semibold text-[var(--color-ink)]">{t.notFor.title}</h3>
							<ul className="mt-6 space-y-4">
								{t.notFor.points.map((point) => (
									<li key={point} className="flex items-start gap-3.5">
										<span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--color-line-strong)] text-[var(--color-ink-dim)]">
											<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
												<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
											</svg>
										</span>
										<span className="text-base text-[var(--color-ink-muted)]">{point}</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* FAQ */}
			<section className="bg-[var(--color-sand)] py-20 lg:py-28">
				<div className="mx-auto max-w-[900px] px-6 lg:px-10">
					<h2 className="heading-display text-3xl text-[var(--color-ink)] lg:text-4xl">Telehealth questions</h2>
					<div className="mt-8">
						<FaqAccordion items={t.faqs} />
					</div>
				</div>
			</section>

			<CtaBand />
		</>
	);
}
