'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { siteConfig } from '@/lib/site-config';

const fadeUp = {
	hidden: { opacity: 0, y: 24 },
	show: (i: number) => ({
		opacity: 1,
		y: 0,
		transition: { duration: 0.6, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] as const },
	}),
};

export function Hero() {
	const { hero } = siteConfig;

	return (
		<section id="hero" className="aura-blue relative overflow-hidden bg-[var(--color-bg)]">
			<div className="relative mx-auto grid max-w-[1400px] items-center gap-12 px-6 pt-32 pb-16 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:pt-40 lg:pb-28">
				{/* Left — copy */}
				<div className="relative z-10">
					<motion.div variants={fadeUp} custom={0} initial="hidden" animate="show">
						<span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-ink-muted)] card-shadow">
							<span className="flex items-center gap-0.5 text-[var(--color-brass)]">
								{[0, 1, 2, 3, 4].map((i) => (
									<svg key={i} className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
										<path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 15l-5.3 2.6 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
									</svg>
								))}
							</span>
							<span className="font-semibold text-[var(--color-ink)]">{hero.rating.score}</span>
							<span className="text-[var(--color-ink-dim)]">· {hero.rating.reviews}</span>
						</span>
					</motion.div>

					<motion.h1
						variants={fadeUp}
						custom={1}
						initial="hidden"
						animate="show"
						className="heading-display mt-7 text-5xl leading-[1.05] text-[var(--color-ink)] sm:text-6xl lg:text-[4.25rem]"
					>
						{hero.heading.map((line) => (
							<span key={line} className="block">
								{line}
							</span>
						))}
						<span className="block text-[var(--color-primary)]">{hero.headingAccent}</span>
					</motion.h1>

					<motion.p
						variants={fadeUp}
						custom={2}
						initial="hidden"
						animate="show"
						className="mt-6 max-w-lg text-lg leading-relaxed text-[var(--color-ink-muted)]"
					>
						{hero.body}
					</motion.p>

					<motion.div
						variants={fadeUp}
						custom={3}
						initial="hidden"
						animate="show"
						className="mt-9 flex flex-wrap items-center gap-4"
					>
						<Link
							href={hero.cta.href}
							className="group inline-flex items-center gap-2.5 rounded-full bg-[var(--color-primary)] px-7 py-4 text-sm font-semibold text-white transition-all hover:bg-[var(--color-primary-bright)] card-shadow"
						>
							{hero.cta.label}
							<svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
							</svg>
						</Link>
						<Link
							href={hero.secondaryCta.href}
							className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line-strong)] bg-[var(--color-surface)]/60 px-7 py-4 text-sm font-semibold text-[var(--color-ink)] transition-all hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-surface)]"
						>
							{hero.secondaryCta.label}
						</Link>
					</motion.div>

					<motion.p
						variants={fadeUp}
						custom={4}
						initial="hidden"
						animate="show"
						className="mt-8 text-sm text-[var(--color-ink-dim)]"
					>
						{hero.trust}
					</motion.p>
				</div>

				{/* Right — photo with floating glass cards */}
				<motion.div
					initial={{ opacity: 0, scale: 0.96 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
					className="relative"
				>
					<div
						className="image-placeholder relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] card-shadow-lg sm:aspect-[5/5] lg:aspect-[4/4.4]"
						style={{
							backgroundImage: `url('/images/hero/hero-portrait.jpg')`,
							backgroundSize: 'cover',
							backgroundPosition: 'center',
						}}
					/>

					{/* Floating availability chip — top left */}
					<motion.div
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5, duration: 0.5 }}
						className="glass absolute -left-3 top-8 flex items-center gap-3 rounded-2xl px-4 py-3 lg:-left-8"
					>
						<span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-brass-soft)] text-[var(--color-brass)]">
							<span className="relative flex h-2.5 w-2.5">
								<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-brass)] opacity-60" />
								<span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-brass)]" />
							</span>
						</span>
						<div>
							<p className="text-[0.7rem] font-medium text-[var(--color-ink-dim)]">{hero.availabilityChip.label}</p>
							<p className="text-sm font-semibold text-[var(--color-ink)]">{hero.availabilityChip.value}</p>
						</div>
					</motion.div>

					{/* Floating stat cards — bottom */}
					<motion.div
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.65, duration: 0.5 }}
						className="glass absolute -bottom-6 -right-2 flex gap-5 rounded-3xl px-6 py-4 lg:-right-8"
					>
						{hero.floatingStats.map((stat) => (
							<div key={stat.label} className="text-center">
								<p className="heading-display text-2xl text-[var(--color-primary)] lg:text-3xl">{stat.value}</p>
								<p className="mt-0.5 text-[0.7rem] font-medium text-[var(--color-ink-muted)]">{stat.label}</p>
							</div>
						))}
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}
