import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { DepartmentIcon } from '@/components/ui/department-icon';
import type { Department, Visit } from '@/lib/catalog';
import { VisitFeeRow } from './visit-fee-row';

/**
 * "Visits & fees": the whole practice's printed price card, one ruled block
 * per department, with a jump index along the top.
 */
export function FeeSchedule({ departments, other, currency }: { departments: Department[]; other: Visit[]; currency: string }) {
	const groups = departments.filter((d) => d.visits.length > 0);
	return (
		<div>
			<nav aria-label="Jump to a department" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:flex-wrap md:px-0">
				{groups.map((d) => (
					<a
						key={d.slug}
						href={`#fees-${d.slug}`}
						className="inline-flex shrink-0 items-center gap-2 rounded-full border border-line-strong bg-card px-4 py-2 text-[13px] font-medium text-ink-muted transition-colors hover:border-steel hover:text-steel"
					>
						<DepartmentIcon name={d.icon} className="h-3.5 w-3.5" />
						{d.short}
					</a>
				))}
			</nav>
			<div className="mt-14 flex flex-col">
				{groups.map((d, i) => (
					<section key={d.slug} id={`fees-${d.slug}`} className="scroll-mt-28 border-t border-line-strong py-12 first:border-t-0 first:pt-0">
						<div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
							<Reveal className="min-w-0 lg:col-span-4">
								<div className="lg:sticky lg:top-28">
									<span className="tabular text-xs text-ink-dim">{String(i + 1).padStart(2, '0')}</span>
									<h2 className="display-sm mt-2 text-ink">{d.title}</h2>
									{d.tagline ? <p className="mt-2 font-display text-[17px] italic text-steel">{d.tagline}</p> : null}
									<Link href={`/departments/${d.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-steel hover:text-steel-deep">
										<span className="link-underline">About this department</span>
										<DepartmentIcon name="arrow" className="h-4 w-4" />
									</Link>
								</div>
							</Reveal>
							<ul className="min-w-0 lg:col-span-8">
								{d.visits.map((v) => (
									<VisitFeeRow key={v.slug} visit={v} currency={currency} />
								))}
							</ul>
						</div>
					</section>
				))}
				{other.length ? (
					<section className="border-t border-line-strong py-12">
						<div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
							<h2 className="display-sm min-w-0 text-ink lg:col-span-4">More visits</h2>
							<ul className="min-w-0 lg:col-span-8">
								{other.map((v) => (
									<VisitFeeRow key={v.slug} visit={v} currency={currency} />
								))}
							</ul>
						</div>
					</section>
				) : null}
			</div>
		</div>
	);
}
