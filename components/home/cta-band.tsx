'use client';

import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';

export function CtaBand() {
	const { bookingBanner } = siteConfig;

	return (
		<section className="relative bg-[var(--color-bg)] py-20 lg:py-28">
			<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
				<div className="aura-blue relative overflow-hidden rounded-[2.5rem] border border-[var(--color-line)] bg-[var(--color-surface)] px-8 py-16 text-center card-shadow-lg lg:px-16 lg:py-20">
					<h2 className="heading-display mx-auto max-w-2xl text-4xl text-[var(--color-ink)] lg:text-5xl">
						{bookingBanner.heading.join(' ')}{' '}
						<span className="text-[var(--color-primary)]">{bookingBanner.headingAccent}</span>
					</h2>
					<p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-[var(--color-ink-muted)]">
						{bookingBanner.body}
					</p>
					<Link
						href={bookingBanner.cta.href}
						className="group mt-9 inline-flex items-center gap-2.5 rounded-full bg-[var(--color-primary)] px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-[var(--color-primary-bright)] card-shadow"
					>
						{bookingBanner.cta.label}
						<svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
						</svg>
					</Link>
				</div>
			</div>
		</section>
	);
}
