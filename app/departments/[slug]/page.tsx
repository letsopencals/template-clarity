'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import type {
	ProductCollectionResponse,
	ProductCollectionProduct,
	StaffMemberListItemResponse,
} from '@opencals/storefront-sdk';
import { formatDuration, formatPrice } from '@/lib/format';
import { useSettings } from '@/contexts/settings-context';
import { siteConfig } from '@/lib/site-config';
import { FaqAccordion } from '@/components/ui/faq-accordion';
import { CtaBand } from '@/components/home/cta-band';

function ServiceRow({ product, index }: { product: ProductCollectionProduct; index: number }) {
	const { currency } = useSettings();

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.4) }}
		>
			<Link
				href={`/booking/${product.slug}`}
				className="group flex items-center justify-between gap-6 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 transition-all hover:border-[var(--color-primary)]/40 hover:card-shadow lg:p-8"
			>
				<div className="min-w-0">
					<h3 className="text-lg font-semibold text-[var(--color-ink)]">
						{product.variantTitle || product.title}
					</h3>
					{product.description && (
						<p className="mt-1.5 line-clamp-2 max-w-xl text-sm leading-relaxed text-[var(--color-ink-muted)]">
							{product.description}
						</p>
					)}
					<div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[var(--color-ink-dim)]">
						<span className="inline-flex items-center gap-1.5">
							<svg className="h-4 w-4 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							{formatDuration(product.duration)}
						</span>
						{product.maxAttendees > 1 && (
							<span className="inline-flex items-center gap-1.5">
								<svg className="h-4 w-4 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
								</svg>
								Up to {product.maxAttendees}
							</span>
						)}
					</div>
				</div>

				<div className="flex shrink-0 items-center gap-5">
					<span className="text-base font-semibold text-[var(--color-primary)]">
						{formatPrice(product.price, currency)}
					</span>
					<span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-line-strong)] text-[var(--color-ink)] transition-all group-hover:border-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-[var(--color-bg)]">
						<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
						</svg>
					</span>
				</div>
			</Link>
		</motion.div>
	);
}

function ClinicianCard({ name, role, imageUrl }: { name: string; role?: string; imageUrl?: string | null }) {
	const initials = name
		.replace(/^Dr\.?\s+/i, '')
		.split(' ')
		.map((p) => p[0])
		.slice(0, 2)
		.join('')
		.toUpperCase();

	return (
		<div className="flex items-center gap-4 rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 card-shadow">
			<div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[var(--color-sand)]">
				{imageUrl ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img src={imageUrl} alt={name} className="h-full w-full object-cover" style={{ objectPosition: 'center top' }} />
				) : (
					<span className="heading-display text-2xl text-[var(--color-primary)]">{initials}</span>
				)}
			</div>
			<div className="min-w-0">
				<h3 className="truncate text-base font-semibold text-[var(--color-ink)]">{name}</h3>
				{role && <p className="truncate text-sm text-[var(--color-ink-muted)]">{role}</p>}
			</div>
		</div>
	);
}

export default function DepartmentDetailPage() {
	const params = useParams<{ slug: string }>();
	const slug = params?.slug;
	const [collection, setCollection] = useState<ProductCollectionResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const content = slug
		? siteConfig.departmentContent[slug as keyof typeof siteConfig.departmentContent]
		: undefined;

	useEffect(() => {
		if (!slug) return;
		async function fetchCollection() {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch(`/api/collections/${slug}`);
				if (!res.ok) throw new Error('Failed to fetch');
				const data: ProductCollectionResponse = await res.json();
				setCollection(data);
			} catch {
				setError('Unable to load this department. Please try again later.');
			} finally {
				setLoading(false);
			}
		}

		fetchCollection();
	}, [slug]);

	// Clinicians who actually provide this department's services, loaded from the
	// store: match staff to the collection by product slug (a staff member appears
	// if they can deliver any service in this department). Deduped and capped for
	// layout. Falls back to the static site-config names if the store returns none.
	const [staff, setStaff] = useState<StaffMemberListItemResponse[]>([]);

	useEffect(() => {
		async function fetchStaff() {
			try {
				const res = await fetch('/api/staff');
				if (!res.ok) throw new Error('Failed to fetch');
				setStaff(await res.json());
			} catch {
				setStaff([]);
			}
		}
		fetchStaff();
	}, []);

	const clinicians = useMemo(() => {
		if (!collection) return [];
		const deptSlugs = new Set(collection.products.map((p) => p.slug));
		return staff
			.filter((s) => s.products?.some((p) => deptSlugs.has(p.slug)))
			.slice(0, 12)
			.map((s) => ({
				id: s.id,
				name: `${s.firstName} ${s.lastName}`.trim(),
				imageUrl: s.image?.url ?? null,
			}));
	}, [staff, collection]);

	const title = collection?.title ?? 'Department';
	const description = content?.intro ?? collection?.description ?? undefined;

	return (
		<>
			{/* Hero */}
			<section className="bg-[var(--color-bg)] pt-32 pb-14 lg:pt-40 lg:pb-20">
				<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
					<Link
						href="/departments"
						className="inline-flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-ink-dim)] transition-colors hover:text-[var(--color-primary)]"
					>
						<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
						</svg>
						All departments
					</Link>

					<div className="mt-8 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
						<div>
							{content?.tagline && (
								<span className="chip">{content.tagline}</span>
							)}
							{loading ? (
								<div className="mt-5 h-14 w-2/3 animate-pulse rounded bg-[var(--color-surface-2)]" />
							) : (
								<motion.h1
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.6 }}
									className="heading-display mt-5 text-5xl text-[var(--color-ink)] md:text-6xl"
								>
									{title}
								</motion.h1>
							)}
							{description && (
								<p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--color-ink-muted)]">
									{description}
								</p>
							)}
							<a
								href="#services"
								className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-[var(--color-primary)] px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-bright)] card-shadow"
							>
								View services
								<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
								</svg>
							</a>
						</div>

						{content?.heroImage && (
							<motion.div
								initial={{ opacity: 0, scale: 0.98 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
								className="relative aspect-[16/10] overflow-hidden rounded-[2rem] border border-[var(--color-line)] card-shadow-lg"
							>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={`/images/${content.heroImage}`}
									alt={title}
									className="h-full w-full object-cover"
								/>
							</motion.div>
						)}
					</div>
				</div>
			</section>

			{/* What we treat */}
			{content?.treats && content.treats.length > 0 && (
				<section className="bg-[var(--color-sand)] py-16 lg:py-20">
					<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
						<h2 className="heading-display text-3xl text-[var(--color-ink)] lg:text-4xl">What we treat</h2>
						<div className="mt-8 flex flex-wrap gap-3">
							{content.treats.map((treat) => (
								<span
									key={treat}
									className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)]"
								>
									{treat}
								</span>
							))}
						</div>
					</div>
				</section>
			)}

			{/* Services */}
			<section id="services" className="scroll-mt-24 bg-[var(--color-bg)] py-16 lg:py-24">
				<div className="mx-auto max-w-[1000px] px-6 lg:px-10">
					<h2 className="heading-display text-3xl text-[var(--color-ink)] lg:text-4xl">Services & pricing</h2>

					{loading && (
						<div className="mt-8 space-y-4">
							{[0, 1, 2].map((i) => (
								<div key={i} className="h-28 animate-pulse rounded-2xl bg-[var(--color-surface)]" />
							))}
						</div>
					)}

					{error && (
						<div className="py-16 text-center">
							<p className="text-[var(--color-ink-muted)]">{error}</p>
						</div>
					)}

					{!loading && !error && collection && collection.products.length === 0 && (
						<div className="py-16 text-center">
							<p className="text-[var(--color-ink-muted)]">No services in this department yet.</p>
						</div>
					)}

					<div className="mt-8 space-y-4">
						{collection?.products.map((product, i) => (
							<ServiceRow key={product.id} product={product} index={i} />
						))}
					</div>
				</div>
			</section>

			{/* Our clinicians — live from the store, matched to this department by
			    service. Falls back to the static site-config names if unavailable. */}
			{(clinicians.length > 0 || (content?.clinicianNames && content.clinicianNames.length > 0)) && (
				<section className="bg-[var(--color-sand)] py-16 lg:py-24">
					<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
						<h2 className="heading-display text-3xl text-[var(--color-ink)] lg:text-4xl">Meet your clinicians</h2>
						<p className="mt-4 max-w-xl text-lg leading-relaxed text-[var(--color-ink-muted)]">
							Experienced specialists who take the time to listen and explain.
						</p>
						<div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{clinicians.length > 0
								? clinicians.map((c) => <ClinicianCard key={c.id} name={c.name} imageUrl={c.imageUrl} />)
								: content?.clinicianNames?.map((name) => {
										const member = siteConfig.team.find((m) => m.name === name);
										return <ClinicianCard key={name} name={name} role={member?.role} imageUrl={member ? `/images/${member.image}` : null} />;
								  })}
						</div>
					</div>
				</section>
			)}

			{/* FAQ */}
			{content?.faqs && content.faqs.length > 0 && (
				<section className="bg-[var(--color-bg)] py-16 lg:py-24">
					<div className="mx-auto max-w-[900px] px-6 lg:px-10">
						<h2 className="heading-display text-3xl text-[var(--color-ink)] lg:text-4xl">Common questions</h2>
						<div className="mt-8">
							<FaqAccordion items={content.faqs} />
						</div>
					</div>
				</section>
			)}

			<CtaBand />
		</>
	);
}
