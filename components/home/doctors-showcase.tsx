'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { siteConfig } from '@/lib/site-config';

export function DoctorsShowcase() {
	const { team } = siteConfig;

	return (
		<section id="doctors" className="relative bg-[var(--color-sand)] py-20 lg:py-28">
			<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
				<div className="flex flex-wrap items-end justify-between gap-6">
					<div className="max-w-xl">
						<span className="chip">Our Clinicians</span>
						<h2 className="heading-display mt-5 text-4xl text-[var(--color-ink)] lg:text-5xl">
							Meet the team caring for you
						</h2>
						<p className="mt-5 text-lg leading-relaxed text-[var(--color-ink-muted)]">
							Experienced doctors, nurses, and therapists — every one chosen for their expertise and their bedside manner.
						</p>
					</div>
					<Link
						href="/about#team"
						className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-6 py-3 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:border-[var(--color-primary)]/40"
					>
						See the full team
						<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
						</svg>
					</Link>
				</div>

				<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{team.map((member, i) => (
						<motion.article
							key={member.name}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: '-60px' }}
							transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
							className="group overflow-hidden rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] card-shadow"
						>
							<div className="flex items-center gap-4 p-5">
								<div
									className="image-placeholder h-16 w-16 shrink-0 overflow-hidden rounded-2xl"
									style={{
										backgroundImage: `url('/images/${member.image}')`,
										backgroundSize: 'cover',
										backgroundPosition: 'center top',
									}}
								/>
								<div className="min-w-0">
									<h3 className="truncate text-base font-semibold text-[var(--color-ink)]">{member.name}</h3>
									<p className="truncate text-sm text-[var(--color-ink-muted)]">{member.role}</p>
								</div>
							</div>

							{/* Stat row — rating · experience · patients */}
							<div className="mx-5 grid grid-cols-3 gap-2 rounded-2xl bg-[var(--color-bg)] p-3 text-center">
								<Stat value={`★ ${member.rating}`} label="Rating" />
								<Stat value={member.experience} label="Experience" />
								<Stat value={member.patients} label="Patients" />
							</div>

							<div className="p-5">
								<p className="line-clamp-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">{member.bio}</p>
								<Link
									href="/departments"
									className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-bright)]"
								>
									Book appointment
								</Link>
							</div>
						</motion.article>
					))}
				</div>
			</div>
		</section>
	);
}

function Stat({ value, label }: { value: string; label: string }) {
	return (
		<div>
			<p className="text-sm font-semibold text-[var(--color-primary)]">{value}</p>
			<p className="mt-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-[var(--color-ink-dim)]">{label}</p>
		</div>
	);
}
