'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { siteConfig } from '@/lib/site-config';

const icons: Record<string, React.ReactNode> = {
	shield: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
	lock: <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />,
	clock: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
	card: <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />,
	users: <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-1a4 4 0 00-3-3.87M9 20H4v-1a4 4 0 013-3.87m6-1.13a4 4 0 10-4 0m8-4a3 3 0 11-6 0 3 3 0 016 0z" />,
	star: <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.5l2.05 4.19 4.62.68-3.34 3.26.79 4.6-4.12-2.17-4.13 2.17.79-4.6L4.8 8.37l4.62-.68 2.06-4.19z" />,
};

const toneStyles = {
	light: 'bg-[var(--color-surface)] border border-[var(--color-line)] text-[var(--color-ink)]',
	blue: 'gradient-medical text-white',
	dark: 'bg-[var(--color-charcoal)] text-white',
} as const;

export function TrustBand() {
	const { trust } = siteConfig;

	return (
		<section id="why-clear-care" className="scroll-mt-24 bg-[var(--color-sand)] py-20 lg:py-28">
			<div className="mx-auto grid max-w-[1400px] items-center gap-14 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-10">
				{/* ── Left: photo + floating trust card ── */}
				<motion.div
					initial={{ opacity: 0, y: 24 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: '-80px' }}
					transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
					className="relative"
				>
					<div className="relative aspect-[4/4.6] w-full overflow-hidden rounded-[2rem] card-shadow-lg ring-1 ring-[var(--color-line)]">
						<Image src={`/images/${trust.image}`} alt="Inside a Clear Care Medical clinic" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 560px" />
						{/* soft sage aura overlay for warmth */}
						<div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(70% 40% at 80% 5%, rgba(124,154,110,0.18) 0%, transparent 60%)' }} />
					</div>

					{/* floating trust badge card */}
					<motion.div
						initial={{ opacity: 0, y: 16 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.25, duration: 0.5 }}
						className="glass-strong absolute -bottom-6 left-4 flex max-w-[19rem] items-start gap-3 rounded-2xl p-4 lg:left-8"
					>
						<span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
							<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
								{icons.shield}
							</svg>
						</span>
						<div>
							<p className="text-sm font-semibold text-[var(--color-ink)]">{trust.badge.title}</p>
							<p className="mt-0.5 text-[0.8rem] leading-snug text-[var(--color-ink-muted)]">{trust.badge.body}</p>
						</div>
					</motion.div>
				</motion.div>

				{/* ── Right: copy + markers + stat cards ── */}
				<div>
					<motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
						<span className="chip">
							<span className="h-1.5 w-1.5 rounded-full bg-[var(--color-leaf)]" />
							{trust.eyebrow}
						</span>
						<h2 className="heading-display mt-5 text-4xl leading-[1.05] text-[var(--color-ink)] lg:text-5xl">
							{trust.heading} <span className="heading-display-italic text-[var(--color-primary)]">{trust.headingAccent}</span>
						</h2>
						<p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--color-ink-muted)]">{trust.body}</p>
					</motion.div>

					{/* markers checklist */}
					<div className="mt-7 grid gap-x-6 gap-y-3.5 sm:grid-cols-2">
						{trust.markers.map((marker, i) => (
							<motion.div
								key={marker.title}
								initial={{ opacity: 0, y: 14 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: '-40px' }}
								transition={{ duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
								className="flex items-start gap-3"
							>
								<span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-[var(--color-sage-soft)] text-[var(--color-leaf)]">
									<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
										{icons[marker.icon] ?? icons.shield}
									</svg>
								</span>
								<div>
									<p className="text-sm font-semibold text-[var(--color-ink)]">{marker.title}</p>
									<p className="mt-0.5 text-[0.8rem] leading-snug text-[var(--color-ink-dim)]">{marker.body}</p>
								</div>
							</motion.div>
						))}
					</div>

					{/* stat cards (light / blue / dark) */}
					<div className="mt-8 grid gap-4 sm:grid-cols-3">
						{trust.statCards.map((stat, i) => (
							<motion.div
								key={stat.label}
								initial={{ opacity: 0, y: 18 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: '-40px' }}
								transition={{ duration: 0.5, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
								className={`relative overflow-hidden rounded-2xl p-5 card-shadow ${toneStyles[stat.tone]}`}
							>
								{stat.tone !== 'light' && (
									<span aria-hidden className="pointer-events-none absolute -right-4 -top-6 h-20 w-20 rounded-full bg-white/10" />
								)}
								<span className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.tone === 'light' ? 'bg-[var(--color-tint)] text-[var(--color-primary)]' : 'bg-white/15 text-white'}`}>
									<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
										{icons[stat.icon] ?? icons.star}
									</svg>
								</span>
								<p className={`heading-display mt-6 text-3xl lg:text-4xl ${stat.tone === 'light' ? 'text-[var(--color-primary)]' : 'text-white'}`}>{stat.value}</p>
								<p className={`mt-1 text-sm font-medium ${stat.tone === 'light' ? 'text-[var(--color-ink-muted)]' : 'text-white/80'}`}>{stat.label}</p>
							</motion.div>
						))}
					</div>

					<motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} className="mt-8">
						<Link
							href={trust.cta.href}
							className="group inline-flex items-center gap-2.5 rounded-full bg-[var(--color-primary)] px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[var(--color-primary-bright)] card-shadow"
						>
							{trust.cta.label}
							<svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
							</svg>
						</Link>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
