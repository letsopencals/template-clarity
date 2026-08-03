'use client';

import { motion } from 'framer-motion';
import { siteConfig } from '@/lib/site-config';

const icons: Record<string, React.ReactNode> = {
	shield: (
		<path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
	),
	lock: (
		<path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
	),
	clock: (
		<path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
	),
	card: (
		<path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
	),
};

export function TrustBand() {
	const { trust, statsBand } = siteConfig;

	return (
		<section className="bg-[var(--color-sand)] py-20 lg:py-28">
			<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
				<div className="max-w-2xl">
					<span className="chip">{trust.eyebrow}</span>
					<h2 className="heading-display mt-5 text-4xl text-[var(--color-ink)] lg:text-5xl">{trust.heading}</h2>
				</div>

				<div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
					{trust.markers.map((marker, i) => (
						<motion.div
							key={marker.title}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: '-60px' }}
							transition={{ duration: 0.5, delay: (i % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
							className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-7 card-shadow"
						>
							<span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-brass-soft)] text-[var(--color-primary)]">
								<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
									{icons[marker.icon] ?? icons.shield}
								</svg>
							</span>
							<h3 className="mt-5 text-base font-semibold text-[var(--color-ink)]">{marker.title}</h3>
							<p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">{marker.body}</p>
						</motion.div>
					))}
				</div>

				{/* Stats row */}
				<div className="mt-6 grid gap-5 rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8 text-center sm:grid-cols-3 card-shadow lg:p-10">
					{statsBand.stats.map((stat) => (
						<div key={stat.label}>
							<p className="heading-display text-4xl text-[var(--color-primary)] lg:text-5xl">{stat.value}</p>
							<p className="mt-2 text-sm font-medium text-[var(--color-ink-muted)]">{stat.label}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
