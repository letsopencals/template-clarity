'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { siteConfig } from '@/lib/site-config';

const proofAvatars = ['dr-lin-chen', 'dr-priya-patel', 'dr-min-kim', 'dr-arjun-singh'];

export function CtaBand() {
	const { bookingBanner, hero } = siteConfig;

	return (
		<section id="book-cta" className="relative scroll-mt-24 bg-[var(--color-bg)] py-20 lg:py-28">
			<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
				<div className="gradient-medical relative overflow-hidden rounded-[2.5rem] px-8 py-16 text-center card-shadow-lg lg:px-16 lg:py-24">
					{/* Warm organic auras */}
					<div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[var(--color-brass)]/25 blur-3xl" />
					<div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-[var(--color-sage)]/25 blur-3xl" />

					{/* animated vine motif */}
					<svg className="pointer-events-none absolute inset-x-0 top-8 hidden h-24 w-full lg:block" viewBox="0 0 1400 120" fill="none" preserveAspectRatio="none" aria-hidden>
						<motion.path
							initial={{ pathLength: 0, opacity: 0 }}
							whileInView={{ pathLength: 1, opacity: 0.4 }}
							viewport={{ once: true }}
							transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
							d="M-20 90C240 30 360 100 640 70s420 -50 780 20"
							stroke="rgba(255,255,255,0.5)"
							strokeWidth="2"
							strokeDasharray="2 10"
							strokeLinecap="round"
						/>
					</svg>

					<div className="relative">
						{/* social proof */}
						<motion.div
							initial={{ opacity: 0, y: 14 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
							className="mx-auto flex w-fit items-center gap-3 rounded-full bg-white/15 px-4 py-2 backdrop-blur"
						>
							<div className="flex -space-x-2.5">
								{proofAvatars.map((n) => (
									<div key={n} className="relative h-7 w-7 overflow-hidden rounded-full ring-2 ring-white/70">
										<Image src={`/images/team/${n}.jpg`} alt="" fill className="object-cover" sizes="28px" />
									</div>
								))}
							</div>
							<span className="text-sm font-medium text-white">{hero.trust}</span>
						</motion.div>

						<h2 className="heading-display mx-auto mt-7 max-w-2xl text-4xl leading-[1.05] text-white lg:text-6xl">
							{bookingBanner.heading.join(' ')}{' '}
							<span className="heading-display-italic text-[var(--color-brass-soft)]">{bookingBanner.headingAccent}</span>
						</h2>
						<p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-white/85">
							{bookingBanner.body}
						</p>

						<div className="mt-9 flex flex-wrap items-center justify-center gap-4">
							<Link
								href={bookingBanner.cta.href}
								className="group inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-4 text-sm font-semibold text-[var(--color-primary)] transition-transform hover:-translate-y-0.5 card-shadow"
							>
								{bookingBanner.cta.label}
								<svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
								</svg>
							</Link>
							<Link
								href="/contact"
								className="inline-flex items-center gap-2 rounded-full border border-white/40 px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
							>
								Talk to our team
							</Link>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
