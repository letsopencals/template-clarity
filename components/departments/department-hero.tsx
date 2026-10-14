import Link from 'next/link';
import { PageHero } from '@/components/layout/page-hero';
import { DepartmentIcon } from '@/components/ui/department-icon';
import { buttonClasses } from '@/components/ui/button';
import { VideoBadge } from '@/components/services/video-badge';
import { bookingHref, formatFee, visitLength, type Department } from '@/lib/catalog';

/** Department opener: the room's photo in a window, its promise and the first visit to book. */
export function DepartmentHero({ department: d, currency, clinicianCount }: { department: Department; currency: string; clinicianCount: number }) {
	const first = d.visits[0];
	const words = d.title.split(' ');
	const last = words.pop();
	return (
		<PageHero
			eyebrow={`Departments · ${d.short}`}
			title={
				<>
					{words.length ? `${words.join(' ')} ` : null}
					<em>{last}</em>
				</>
			}
			lead={d.intro || d.tagline}
			image={d.image}
			imageAlt={`${d.title} at Clear Care`}
			imageChildren={
				<div className="absolute bottom-5 left-5 right-5 z-[3] flex items-center gap-3 rounded-card bg-paper/92 px-4 py-3 shadow-card backdrop-blur">
					<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-steel-tint text-steel">
						<DepartmentIcon name={d.icon} className="h-5 w-5" />
					</span>
					<p className="min-w-0 font-display text-[15px] italic leading-snug text-ink">{d.tagline}</p>
				</div>
			}
		>
			<div className="flex flex-wrap items-center gap-3">
				{first ? (
					<Link href={bookingHref(first.slug)} className={buttonClasses({ size: 'lg' })}>
						Book {first.title}
					</Link>
				) : null}
				<Link href="#visits" className={buttonClasses({ variant: 'outline', size: 'lg' })}>
					Visits & fees
				</Link>
			</div>
			<dl className="mt-10 grid max-w-xl grid-cols-3 gap-6 border-t border-line pt-6">
				<div>
					<dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-dim">Visits</dt>
					<dd className="tabular mt-1 font-display text-2xl text-ink">{d.visits.length}</dd>
				</div>
				<div>
					<dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-dim">From</dt>
					<dd className="tabular mt-1 font-display text-2xl text-ink">
						{d.fromPrice != null ? formatFee(d.fromPrice, currency) : '—'}
						{first ? <span className="ml-1 font-sans text-xs text-ink-dim">/ {visitLength(first.duration)}</span> : null}
					</dd>
				</div>
				<div>
					<dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-dim">Clinicians</dt>
					<dd className="tabular mt-1 font-display text-2xl text-ink">{clinicianCount || '—'}</dd>
				</div>
			</dl>
			{d.video ? <VideoBadge className="mt-6" label="Some visits by video" /> : null}
		</PageHero>
	);
}
