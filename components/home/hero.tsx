'use client';

/**
 * Hero — "Editorial + Reframed Photo"
 * Oversized editorial display type with an animated leaf/pulse vine drawn
 * through the headline, alongside the clinic photograph reframed inside an
 * organic arched mask. Warm pastel-wood + brass + organic sage palette.
 */

import Link from 'next/link';
import Image from 'next/image';
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
	// Split the accent so its first word gets the italic editorial treatment
	// (e.g. "made simple." → italic "made" + "simple.").
	const [accentLead, ...accentRest] = hero.headingAccent.split(' ');

	return (
		<section id="hero" className="aura-organic relative overflow-hidden bg-[var(--color-bg)]">
			<div className="relative mx-auto max-w-[1400px] px-6 pt-32 pb-16 lg:px-10 lg:pt-40 lg:pb-24">
				{/* ── Editorial heading row ── */}
				<div className="relative">
					<motion.span variants={fadeUp} custom={0} initial="hidden" animate="show" className="chip">
						<span className="h-1.5 w-1.5 rounded-full bg-[var(--color-leaf)]" />
						{hero.subtitle} · Boston
					</motion.span>

					<div className="relative mt-6">
						{/* animated leaf-vine drawn through the heading */}
						<svg className="pointer-events-none absolute -left-4 top-[-8%] hidden h-[120%] w-[70%] lg:block" viewBox="0 0 700 260" fill="none" aria-hidden>
							<motion.path
								initial={{ pathLength: 0 }}
								animate={{ pathLength: 1 }}
								transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
								d="M10 180C120 60 260 60 360 150s220 120 330 10"
								stroke="var(--color-sage)"
								strokeWidth="3"
								strokeLinecap="round"
							/>
							{/* little leaves along the vine */}
							{[
								{ x: 130, y: 96, r: -35 },
								{ x: 360, y: 150, r: 15 },
								{ x: 600, y: 88, r: 40 },
							].map((l, i) => (
								<motion.g
									key={i}
									initial={{ opacity: 0, scale: 0 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: 1 + i * 0.25, duration: 0.5, ease: 'backOut' }}
									transform={`translate(${l.x} ${l.y}) rotate(${l.r})`}
								>
									<path d="M0 0C-14 -6 -16 -30 0 -40C16 -30 14 -6 0 0Z" fill="var(--color-sage)" opacity="0.85" />
								</motion.g>
							))}
						</svg>

						<motion.h1
							variants={fadeUp}
							custom={1}
							initial="hidden"
							animate="show"
							className="heading-display relative text-6xl leading-[0.98] text-[var(--color-ink)] sm:text-7xl lg:text-[6rem]"
						>
							{hero.heading.map((line) => (
								<span key={line} className="block">
									{line}
								</span>
							))}
							<span className="block">
								<span className="heading-display-italic text-[var(--color-primary)]">{accentLead}</span>
								{accentRest.length ? ` ${accentRest.join(' ')}` : ''}
							</span>
						</motion.h1>
					</div>
				</div>

				{/* ── Photo + copy row ── */}
				<div className="mt-12 grid items-end gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
					{/* Arched photo */}
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
						className="relative"
					>
						{/* organic arch mask: full round top, soft radius bottom */}
						<div className="relative mx-auto aspect-[4/4.4] w-full max-w-[520px] overflow-hidden rounded-t-[16rem] rounded-b-[2.5rem] card-shadow-lg ring-8 ring-[var(--color-surface)]">
							<Image src="/images/hero/hero-portrait.jpg" alt="Clinician at Clear Care Medical" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 520px" priority />
							{/* warm gradient veil at base for depth */}
							<div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[var(--color-ink)]/25 to-transparent" />
						</div>

						{/* floating availability chip */}
						<motion.div
							initial={{ opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.6, duration: 0.5 }}
							className="glass motion-safe-only absolute right-0 top-10 flex items-center gap-3 rounded-2xl px-4 py-3"
							style={{ animation: 'var(--animate-float-soft)' }}
						>
							<span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-sage-soft)]">
								<span className="relative flex h-2.5 w-2.5">
									<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-leaf)] opacity-60" />
									<span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-leaf)]" />
								</span>
							</span>
							<div>
								<p className="text-[0.7rem] font-medium text-[var(--color-ink-dim)]">{hero.availabilityChip.label}</p>
								<p className="text-sm font-semibold text-[var(--color-ink)]">{hero.availabilityChip.value}</p>
							</div>
						</motion.div>
					</motion.div>

					{/* copy column */}
					<div className="relative z-10 lg:pb-10">
						<motion.p variants={fadeUp} custom={2} initial="hidden" animate="show" className="max-w-md text-lg leading-relaxed text-[var(--color-ink-muted)]">
							{hero.body}
						</motion.p>

						<motion.div variants={fadeUp} custom={3} initial="hidden" animate="show" className="mt-8 flex flex-wrap items-center gap-4">
							<Link
								href={hero.cta.href}
								className="group inline-flex items-center gap-2.5 rounded-full bg-[var(--color-primary)] px-7 py-4 text-sm font-semibold text-white transition-all hover:bg-[var(--color-primary-bright)] card-shadow"
							>
								{hero.cta.label}
								<svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
								</svg>
							</Link>
							<Link href={hero.secondaryCta.href} className="link-underline text-sm font-semibold text-[var(--color-ink)]">
								{hero.secondaryCta.label}
							</Link>
						</motion.div>

						<motion.div variants={fadeUp} custom={4} initial="hidden" animate="show" className="mt-9 flex items-center gap-4 border-t border-[var(--color-line)] pt-6">
							<div>
								<div className="flex items-center gap-1 text-[var(--color-brass)]">
									{[0, 1, 2, 3, 4].map((i) => (
										<svg key={i} className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
											<path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 15l-5.3 2.6 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
										</svg>
									))}
								</div>
								<p className="mt-1 text-sm text-[var(--color-ink-dim)]">
									<span className="font-semibold text-[var(--color-ink)]">{hero.rating.score}</span> · {hero.rating.reviews}
								</p>
							</div>
							<div className="h-10 w-px bg-[var(--color-line-strong)]" />
							<p className="max-w-[12rem] text-sm text-[var(--color-ink-dim)]">{hero.trust}</p>
						</motion.div>
					</div>
				</div>
			</div>
		</section>
	);
}
