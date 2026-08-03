'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import type { ProductCollectionResponse } from '@opencals/storefront-sdk';

function DepartmentCard({ collection, index }: { collection: ProductCollectionResponse; index: number }) {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true, margin: '-80px' });
	const serviceCount = collection.products?.length ?? 0;

	return (
		<motion.div
			ref={ref}
			initial={{ opacity: 0, y: 30 }}
			animate={isInView ? { opacity: 1, y: 0 } : {}}
			transition={{ duration: 0.6, delay: (index % 3) * 0.08 }}
		>
			<Link
				href={`/departments/${collection.slug}`}
				className="group flex h-full flex-col justify-between rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8 transition-all hover:border-[var(--color-primary)]/40 hover:card-shadow"
			>
				<div>
					<div className="flex items-start justify-between gap-4">
						<h2 className="heading-display text-2xl text-[var(--color-ink)] md:text-3xl">
							{collection.title}
						</h2>
						<span className="font-display text-sm text-[var(--color-primary)]">
							{String(index + 1).padStart(2, '0')}
						</span>
					</div>
					{collection.description && (
						<p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
							{collection.description}
						</p>
					)}
				</div>

				<div className="mt-8 flex items-center justify-between">
					<span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-ink-dim)]">
						{serviceCount} {serviceCount === 1 ? 'service' : 'services'}
					</span>
					<span className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
						View
						<svg
							className="h-4 w-4 transition-transform group-hover:translate-x-1"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
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
		<div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8">
			<div className="h-7 w-2/3 animate-pulse rounded bg-[var(--color-surface-2)]" />
			<div className="mt-4 h-4 w-full animate-pulse rounded bg-[var(--color-surface-2)]" />
			<div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-[var(--color-surface-2)]" />
			<div className="mt-10 h-4 w-24 animate-pulse rounded bg-[var(--color-surface-2)]" />
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
			<section className="bg-[var(--color-bg)] pt-32 pb-16 lg:pt-40 lg:pb-20">
				<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.1 }}
						className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[var(--color-primary)]"
					>
						Care by Specialty
					</motion.p>
					<motion.h1
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="heading-display mt-4 text-6xl text-[var(--color-ink)] md:text-7xl lg:text-8xl"
					>
						Our
						<br />
						<span className="heading-display-italic text-[var(--color-primary)]">departments</span>
					</motion.h1>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.4 }}
						className="mt-8 max-w-xl text-lg leading-relaxed text-[var(--color-ink-muted)]"
					>
						Choose the department you need and book with the right clinician. From general medicine
						to specialist care, we&apos;re here for the whole family.
					</motion.p>
				</div>
			</section>

			{/* Department grid */}
			<section className="bg-[var(--color-bg)] pb-20 lg:pb-32">
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
