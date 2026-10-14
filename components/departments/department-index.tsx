import Link from 'next/link';
import { clsx } from 'clsx';
import { WindowFrame } from '@/components/motifs/window-frame';
import { Reveal } from '@/components/motion/reveal';
import { DepartmentIcon } from '@/components/ui/department-icon';
import { VideoBadge } from '@/components/services/video-badge';
import { formatFee, type Department } from '@/lib/catalog';

/**
 * Every department as a room along a corridor: alternating window and copy,
 * numbered like doors, with what it treats, the visit count and the fee floor.
 */
export function DepartmentIndex({ departments, currency }: { departments: Department[]; currency: string }) {
	return (
		<ol className="flex flex-col">
			{departments.map((d, i) => (
				<Reveal as="li" key={d.slug} className="border-t border-line py-14 first:border-t-0 first:pt-0 md:py-20">
					<Link
						href={`/departments/${d.slug}`}
						className="group grid grid-cols-1 items-center gap-8 focus-visible:outline-none md:grid-cols-12 md:gap-12"
					>
						<div className={clsx('min-w-0 md:col-span-5', i % 2 === 1 && 'md:order-2 md:col-start-8')}>
							<WindowFrame
								src={d.image}
								alt={`${d.title} at Clear Care`}
								aspect="aspect-[4/3]"
								sizes="(min-width: 768px) 40vw, 100vw"
								imageClassName="transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
							>
								<span className="absolute left-5 top-5 z-[3] flex h-11 w-11 items-center justify-center rounded-full bg-paper/90 text-steel shadow-card">
									<DepartmentIcon name={d.icon} className="h-5 w-5" />
								</span>
							</WindowFrame>
						</div>
						<div className={clsx('min-w-0 md:col-span-6', i % 2 === 1 ? 'md:order-1 md:col-start-1' : 'md:col-start-7')}>
							<p className="tabular text-xs uppercase tracking-[0.18em] text-ink-dim">
								Room {String(i + 1).padStart(2, '0')}
								{d.visits.length ? ` · ${d.visits.length} ${d.visits.length === 1 ? 'visit' : 'visits'}` : ''}
							</p>
							<h2 className="display-md mt-4 text-ink transition-colors group-hover:text-steel-deep group-focus-visible:text-steel-deep">{d.title}</h2>
							{d.tagline ? <p className="mt-3 font-display text-xl italic text-steel">{d.tagline}</p> : null}
							{d.intro ? <p className="mt-5 max-w-[52ch] text-[16px] leading-relaxed text-ink-muted">{d.intro}</p> : null}
							{d.treats.length ? (
								<ul className="mt-6 flex flex-wrap gap-2">
									{d.treats.slice(0, 4).map((t) => (
										<li key={t} className="rounded-full border border-line-strong px-3 py-1.5 text-[13px] text-ink-muted">
											{t}
										</li>
									))}
								</ul>
							) : null}
							<div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
								{d.fromPrice != null ? (
									<span className="text-sm text-ink-muted">
										Visits from <span className="tabular font-semibold text-ink">{formatFee(d.fromPrice, currency)}</span>
									</span>
								) : null}
								{d.video ? <VideoBadge /> : null}
								<span className="inline-flex items-center gap-2 text-sm font-medium text-steel">
									<span className="link-underline">Step inside</span>
									<DepartmentIcon name="arrow" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
								</span>
							</div>
						</div>
					</Link>
				</Reveal>
			))}
		</ol>
	);
}
