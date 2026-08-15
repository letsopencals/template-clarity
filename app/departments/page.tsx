'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import type { ProductCollectionResponse } from '@opencals/storefront-sdk';
import { siteConfig } from '@/lib/site-config';
import { DepartmentIcon, type DepartmentIconName } from '@/components/ui/department-icon';

// Map seeded department slugs → icon (for the overlapping chip) and known image.
const DEPT_ICON: Record<string, DepartmentIconName> = Object.fromEntries(
	siteConfig.departments.map((d) => [d.slug, d.icon as DepartmentIconName]),
);

function DepartmentCard({ collection, index }: { collection: ProductCollectionResponse; index: number }) {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true, margin: '-80px' });
	const serviceCount = collection.products?.length ?? 0;
	const icon = DEPT_ICON[collection.slug];
	const hasImage = icon !== undefined; // seeded departments ship a matching photo

	return (
		<motion.div
			ref={ref}
			initial={{ opacity: 0, y: 26 }}
			animate={isInView ? { opacity: 1, y: 0 } : {}}
			transition={{ duration: 0.55, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
		>
			<Link
				href={`/departments/${collection.slug}`}
				className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] transition-all hover:-translate-y-1.5 hover:border-[var(--color-primary)]/25 hover:card-shadow-lg"
			>
				{/* image / gradient header */}
				<div className="relative aspect-[16/10] w-full overflow-hidden">
					{hasImage ? (
						<Image
							src={`/images/departments/${collection.slug}.jpg`}
							alt={collection.title}
							fill
							className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
							sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
						/>
					) : (
						<div className="gradient-leaf h-full w-full" />
					)}
					<div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)]/45 via-transparent to-transparent" />
					<span className="glass-strong absolute -bottom-5 left-5 flex h-14 w-14 items-center justify-center rounded-2xl text-[var(--color-primary)]">
						<DepartmentIcon name={icon ?? 'stethoscope'} className="h-7 w-7" />
					</span>
					<span className="absolute right-4 top-4 rounded-full bg-white/85 px-2.5 py-1 text-[0.68rem] font-semibold text-[var(--color-primary)] backdrop-blur">
						{serviceCount} {serviceCount === 1 ? 'service' : 'services'}
					</span>
				</div>

				{/* body */}
				<div className="flex flex-1 flex-col px-6 pb-6 pt-8">
					<h2 className="heading-display text-xl text-[var(--color-ink)]">{collection.title}</h2>
					{collection.description && (
						<p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-[var(--color-ink-muted)]">
							{collection.description}
						</p>
					)}
					<span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)]">
						View department
						<svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
						</svg>
					</span>
				</div>
			</Link>
		</motion.div>
	);
}

function DepartmentCardSkeleton() {
	return (
		<div className="overflow-hidden rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)]">
			<div className="aspect-[16/10] w-full animate-pulse bg-[var(--color-surface-2)]" />
			<div className="px-6 pb-6 pt-8">
				<div className="h-6 w-2/3 animate-pulse rounded bg-[var(--color-surface-2)]" />
				<div className="mt-4 h-4 w-full animate-pulse rounded bg-[var(--color-surface-2)]" />
				<div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-[var(--color-surface-2)]" />
			</div>
		</div>
	);
}

export default function DepartmentsPage() {
	const [collections, setCollections] = useState<ProductCollectionResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchCollections() {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch('/api/collections');
				if (!res.ok) throw new Error('Failed to fetch');
				const data: ProductCollectionResponse[] = await res.json();
				setCollections(data);
			} catch {
				setError('Unable to load departments. Please try again later.');
			} finally {
				setLoading(false);
			}
		}

		fetchCollections();
	}, []);

	return (
		<>
			{/* Hero */}
			<section className="aura-organic relative overflow-hidden bg-[var(--color-bg)] pt-32 pb-14 lg:pt-40 lg:pb-16">
				<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
					<motion.span
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="chip"
					>
						<span className="h-1.5 w-1.5 rounded-full bg-[var(--color-leaf)]" />
						{siteConfig.departmentsSection.eyebrow}
					</motion.span>
					<motion.h1
						initial={{ opacity: 0, y: 26 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
						className="heading-display mt-6 text-5xl leading-[1.02] text-[var(--color-ink)] sm:text-6xl lg:text-7xl"
					>
						Care by specialty,
						<br />
						<span className="relative inline-block text-[var(--color-primary)]">
							all in one place
							<svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 300 12" fill="none" preserveAspectRatio="none">
								<path d="M2 8C60 3 130 3 180 6s90 4 118 1" stroke="var(--color-sage)" strokeWidth="3" strokeLinecap="round" />
							</svg>
						</span>
					</motion.h1>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.25 }}
						className="mt-8 max-w-xl text-lg leading-relaxed text-[var(--color-ink-muted)]"
					>
						Choose the department you need and book with the right clinician. From general medicine
						to specialist care, we&apos;re here for the whole family.
					</motion.p>
				</div>
			</section>

			{/* Department grid */}
			<section className="bg-[var(--color-bg)] pt-10 pb-20 lg:pt-16 lg:pb-28">
				<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
					{loading && (
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{[0, 1, 2, 3, 4, 5].map((i) => (
								<DepartmentCardSkeleton key={i} />
							))}
						</div>
					)}

					{error && (
						<div className="py-20 text-center">
							<p className="text-[var(--color-ink-muted)]">{error}</p>
						</div>
					)}

					{!loading && !error && collections.length === 0 && (
						<div className="py-20 text-center">
							<p className="text-[var(--color-ink-muted)]">No departments available at the moment.</p>
						</div>
					)}

					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{collections.map((collection, i) => (
							<DepartmentCard key={collection.id} collection={collection} index={i} />
						))}
					</div>
				</div>
			</section>
		</>
	);
}
