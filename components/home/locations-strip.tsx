'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { Location } from '@opencals/storefront-sdk';
import { siteConfig } from '@/lib/site-config';
import { useLocation } from '@/contexts/location-context';

function formatAddress(loc: Location): string[] {
	const lines: string[] = [];
	if (loc.addressLine1) lines.push(loc.addressLine1);
	const cityLine = [loc.city, loc.state].filter(Boolean).join(', ');
	const cityPostal = [cityLine, loc.postalCode].filter(Boolean).join(' ');
	if (cityPostal) lines.push(cityPostal);
	return lines.length > 0 ? lines : ['Address coming soon'];
}

function cityLabel(loc: Location): string {
	return loc.city ?? loc.title ?? 'Clinic';
}

export function LocationsStrip() {
	const { locations, setSelectedLocationId, loading } = useLocation();
	const router = useRouter();
	const { locations: copy } = siteConfig;

	// Only physical clinics are shown here. Online locations are never globally
	// selectable — they only appear inside the booking flow of the services they’re
	// attached to (choosing one makes that visit virtual).
	const physical = locations.filter((loc) => loc.type !== 'online');

	if (!loading && physical.length === 0) return null;

	const slots = copy.cards;
	const visibleCount = loading ? slots.length : Math.min(physical.length, slots.length);

	const handlePick = (loc: Location) => {
		setSelectedLocationId(loc.id);
		router.push('/services');
	};

	return (
		<section className="relative bg-[var(--color-bg)] py-20 lg:py-28">
			<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
				<div className="max-w-2xl">
					<span className="chip">{copy.eyebrow}</span>
					<h2 className="heading-display mt-5 whitespace-pre-line text-4xl text-[var(--color-ink)] lg:text-5xl">
						{copy.heading}
					</h2>
					<p className="mt-5 text-lg leading-relaxed text-[var(--color-ink-muted)]">{copy.body}</p>
				</div>

				<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: visibleCount }).map((_, i) => {
						const slot = slots[i]!;
						const loc = loading ? null : physical[i] ?? null;
						const disabled = loading || !loc;

						return (
							<motion.button
								key={i}
								type="button"
								onClick={() => loc && handlePick(loc)}
								disabled={disabled}
								aria-disabled={disabled}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: '-60px' }}
								transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
								className="group flex flex-col overflow-hidden rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] text-left transition-all hover:-translate-y-1 hover:card-shadow-lg disabled:cursor-default disabled:hover:translate-y-0"
							>
								<div
									className="image-placeholder relative aspect-[16/10] w-full overflow-hidden"
									style={{
										backgroundImage: `url('/images/${slot.image}')`,
										backgroundSize: 'cover',
										backgroundPosition: 'center',
									}}
								>
									<div className="glass absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)]">
										{slot.hoursHint}
									</div>
								</div>

								<div className="flex flex-1 flex-col p-6">
									<p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">{slot.tagline}</p>
									<h3 className="mt-1 text-xl font-semibold text-[var(--color-ink)]">
										{loc ? cityLabel(loc) : 'Clinic'}
									</h3>
									<div className="mt-3 flex-1 space-y-0.5 text-sm text-[var(--color-ink-muted)]">
										{loc ? (
											formatAddress(loc).map((line, idx) => <p key={idx}>{line}</p>)
										) : (
											<>
												<div className="h-4 w-3/4 rounded bg-[var(--color-surface-2)]" />
												<div className="mt-1 h-4 w-1/2 rounded bg-[var(--color-surface-2)]" />
											</>
										)}
									</div>
									<span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)]">
										Book at this clinic
										<svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
											<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
										</svg>
									</span>
								</div>
							</motion.button>
						);
					})}
				</div>
			</div>
		</section>
	);
}
