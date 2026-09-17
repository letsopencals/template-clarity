'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { LocationFilter } from './location-filter';

const EYEBROW_INITIAL = { opacity: 0, y: 20 };
const EYEBROW_ANIMATE = { opacity: 1, y: 0 };

export function ServicesHero() {
	return (
		<section id="services-hero" className="bg-[var(--color-bg)] pt-32 pb-16 lg:pt-40 lg:pb-20">
			<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
				<motion.p
					initial={EYEBROW_INITIAL}
					animate={EYEBROW_ANIMATE}
					transition={{ duration: 0.6, delay: 0.1 }}
					className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[var(--color-primary)]"
				>
					What We Offer
				</motion.p>
				{/* Prefer browsing by department; this page lists every service in one place. */}
				<motion.h1
					initial={{ opacity: 0, y: 30 }}
					animate={EYEBROW_ANIMATE}
					transition={{ duration: 0.8, delay: 0.2 }}
					className="heading-display mt-4 text-6xl text-[var(--color-ink)] md:text-7xl lg:text-8xl"
				>
					Our
					<br />
					<span className="heading-display-italic text-[var(--color-primary)]">services</span>
				</motion.h1>
				<motion.p
					initial={EYEBROW_INITIAL}
					animate={EYEBROW_ANIMATE}
					transition={{ duration: 0.6, delay: 0.4 }}
					className="mt-8 max-w-xl text-lg leading-relaxed text-[var(--color-ink-muted)]"
				>
					Every service across our nine departments, in one place. Prefer to browse by
					specialty? Visit <Link href="/departments" className="text-[var(--color-primary)] underline underline-offset-4">departments</Link>.
				</motion.p>

				<LocationFilter />
			</div>
		</section>
	);
}
