'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { siteConfig } from '@/lib/site-config';

/** Icons for the feature rows (mapped by point index). */
const pointIcons: React.ReactNode[] = [
	<path key="v" strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.55-2.28A1 1 0 0121 8.62v6.76a1 1 0 01-1.45.9L15 14M4 6h9a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />,
	<path key="rx" strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-4M9 3v6h6M14 3l7 7M8 13h4m-4 4h6" />,
	<path key="cl" strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
	<path key="ck" strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
];

export function TelehealthBand() {
	const { telehealth } = siteConfig;

	return (
		<section id="telehealth-band" className="relative scroll-mt-24 bg-[var(--color-bg)] py-20 lg:py-28">
			<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
				<div className="gradient-medical relative overflow-hidden rounded-[2.5rem] px-6 py-12 card-shadow-lg sm:px-10 lg:px-16 lg:py-20">
					{/* Warm auras so it isn't a flat blue slab */}
					<div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[var(--color-brass)]/25 blur-3xl" />
					<div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-[var(--color-sage)]/25 blur-3xl" />
					<div className="pointer-events-none absolute right-1/3 top-1/2 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

					<div className="relative grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
						{/* ── Left: mock video-consult UI ── */}
						<motion.div
							initial={{ opacity: 0, y: 26 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: '-60px' }}
							transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
							className="relative order-2 lg:order-1"
						>
							<div className="glass-dark relative overflow-hidden rounded-[1.75rem] p-2.5">
								{/* video feed */}
								<div className="relative aspect-[5/4] w-full overflow-hidden rounded-[1.35rem]">
									<Image src="/images/telehealth/telehealth-hero.jpg" alt="Clinician on a secure video consultation" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 560px" />

									{/* top bar: live + timer */}
									<div className="absolute inset-x-3 top-3 flex items-center justify-between">
										<span className="inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
											<span className="relative flex h-2 w-2">
												<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-70" />
												<span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
											</span>
											LIVE
										</span>
										<span className="inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
											<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
												<path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
											</svg>
											Encrypted
										</span>
									</div>

									{/* self-view thumbnail */}
									<div className="absolute bottom-3 right-3 flex h-20 w-16 flex-col items-center justify-center rounded-xl border border-white/25 bg-[var(--color-primary-dark)]/70 backdrop-blur">
										<svg className="h-6 w-6 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
											<path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
										</svg>
										<span className="mt-1 text-[0.6rem] font-medium text-white/80">You</span>
									</div>

									{/* control bar */}
									<div className="absolute inset-x-0 bottom-3 flex justify-center">
										<div className="flex items-center gap-2.5 rounded-full bg-black/45 px-3 py-2 backdrop-blur">
											{[
												<path key="m" strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 003-3V6a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0m5 5v3" />,
												<path key="v" strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.55-2.28A1 1 0 0121 8.62v6.76a1 1 0 01-1.45.9L15 14M4 6h9a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />,
												<path key="c" strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12a8 8 0 01-11.5 7.2L3 21l1.8-6.5A8 8 0 1121 12z" />,
											].map((icon, i) => (
												<span key={i} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white">
													<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
														{icon}
													</svg>
												</span>
											))}
											<span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white">
												<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
													<path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5c5.5-4 11.5-4 17 0l-2 3-3.2-1a1 1 0 01-.7-1l.2-1.5c-2.2-.8-4.4-.8-6.6 0l.2 1.5a1 1 0 01-.7 1l-3.2 1z" />
												</svg>
											</span>
										</div>
									</div>
								</div>
							</div>

							{/* floating confirmation chip */}
							<motion.div
								initial={{ opacity: 0, y: 12 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: 0.35, duration: 0.5 }}
								className="glass-strong motion-safe-only absolute -bottom-5 -left-3 flex items-center gap-2.5 rounded-2xl px-4 py-3 sm:-left-5"
								style={{ animation: 'var(--animate-float-soft)' }}
							>
								<span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-leaf)] text-white">
									<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
									</svg>
								</span>
								<div>
									<p className="text-[0.7rem] font-medium text-[var(--color-ink-dim)]">Prescription</p>
									<p className="text-sm font-semibold text-[var(--color-ink)]">Sent to your pharmacy</p>
								</div>
							</motion.div>
						</motion.div>

						{/* ── Right: copy + feature rows ── */}
						<div className="order-1 lg:order-2">
							<span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
								<span className="h-1.5 w-1.5 rounded-full bg-[var(--color-sage-bright)]" />
								{telehealth.eyebrow}
							</span>
							<h2 className="heading-display mt-6 whitespace-pre-line text-4xl leading-[1.05] text-white lg:text-5xl">
								{telehealth.heading}
							</h2>
							<p className="mt-5 max-w-md text-lg leading-relaxed text-white/85">{telehealth.body}</p>

							<ul className="mt-8 grid gap-3 sm:grid-cols-2">
								{telehealth.points.map((point, i) => (
									<motion.li
										key={point}
										initial={{ opacity: 0, y: 14 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true, margin: '-40px' }}
										transition={{ duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
										className="flex items-start gap-3 rounded-2xl bg-white/10 p-3.5 backdrop-blur"
									>
										<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
											<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
												{pointIcons[i] ?? pointIcons[3]}
											</svg>
										</span>
										<span className="text-sm font-medium leading-snug text-white">{point}</span>
									</motion.li>
								))}
							</ul>

							<Link
								href={telehealth.cta.href}
								className="group mt-8 inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-4 text-sm font-semibold text-[var(--color-primary)] transition-transform hover:-translate-y-0.5"
							>
								{telehealth.cta.label}
								<svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
								</svg>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
