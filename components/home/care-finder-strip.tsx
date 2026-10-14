'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DepartmentIcon } from '@/components/ui/department-icon';
import { siteConfig } from '@/lib/site-config';

const NEEDS = siteConfig.careFinder.needs.slice(0, 6);

/**
 * The hero's front door to the Care Finder: need chips (→ `/care?need=`) and a
 * plain-words search (→ `/care?q=`).
 */
export function CareFinderStrip() {
	const router = useRouter();
	const [q, setQ] = useState('');

	const onSubmit = (e: FormEvent) => {
		e.preventDefault();
		const term = q.trim();
		router.push(term ? `/care?q=${encodeURIComponent(term)}` : '/care');
	};

	return (
		<div className="paper relative p-5 md:p-6">
			<p className="eyebrow text-oak">{siteConfig.hero.finderPrompt}</p>
			<ul className="mt-4 flex flex-wrap gap-2">
				{NEEDS.map((n) => (
					<li key={n.id}>
						<Link
							href={`/care?need=${n.id}`}
							className="group inline-flex items-center gap-2 rounded-full border border-line-strong bg-card px-3.5 py-2 text-[13px] font-medium text-ink transition-colors hover:border-steel hover:bg-steel-tint hover:text-steel-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel/40"
						>
							<DepartmentIcon name={n.icon} className="h-4 w-4 text-oak transition-colors group-hover:text-steel" />
							{n.label}
						</Link>
					</li>
				))}
				<li>
					<Link href="/care" className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-[13px] font-medium text-steel hover:text-steel-deep">
						More
						<DepartmentIcon name="arrow" className="h-3.5 w-3.5" />
					</Link>
				</li>
			</ul>
			<form onSubmit={onSubmit} className="mt-4 flex items-center gap-2 rounded-full border border-line-strong bg-card py-1.5 pl-4 pr-1.5 transition-colors focus-within:border-steel focus-within:ring-2 focus-within:ring-steel/20" role="search">
				<DepartmentIcon name="search" className="h-4 w-4 shrink-0 text-ink-dim" />
				<label htmlFor="hero-care-search" className="sr-only">
					Describe what’s going on
				</label>
				<input
					id="hero-care-search"
					value={q}
					onChange={(e) => setQ(e.target.value)}
					placeholder={siteConfig.hero.searchPlaceholder}
					className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-dim"
				/>
				<button
					type="submit"
					className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-steel px-5 text-[13px] font-semibold text-paper transition-colors hover:bg-steel-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel/40 focus-visible:ring-offset-2"
				>
					Find care
				</button>
			</form>
		</div>
	);
}
