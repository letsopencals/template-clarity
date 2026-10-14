'use client';

import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { bookHref, type DueRecall } from '@/components/account/care-utils';

export interface RecallItem extends DueRecall {
	key: string;
	forChild: boolean;
}

/** "Due for" — gentle recall reminders, each with a direct Book. */
export function RecallsDue({ recalls }: { recalls: RecallItem[] }) {
	const { formatCustom } = useDateFormatter();
	if (!recalls.length) return null;
	return (
		<section aria-labelledby="recalls-title">
			<h2 id="recalls-title" className="eyebrow text-ink-muted">
				Due for
			</h2>
			<ul className="mt-4 grid grid-cols-1 gap-3">
				{recalls.map((r) => (
					<li key={r.key} className="flex min-w-0 flex-col gap-4 rounded-card border border-honey/40 bg-honey-soft/60 px-5 py-4 sm:flex-row sm:items-center">
						<span aria-hidden className="hidden size-10 shrink-0 items-center justify-center rounded-full bg-card text-oak sm:inline-flex">
							<svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.6}>
								<circle cx="12" cy="13" r="8" />
								<path d="M12 9v4l2.5 2M9 2h6" strokeLinecap="round" />
							</svg>
						</span>
						<div className="min-w-0 flex-1">
							<p className="font-medium text-ink">
								{r.label}
								{r.person !== 'You' ? <span className="text-ink-muted"> · {r.person}</span> : null}
							</p>
							<p className="mt-0.5 text-sm text-ink-muted">
								{r.overdue ? 'Due since ' : 'Due '}
								{formatCustom(r.dueAt, 'MMMM YYYY')}
								{r.lastAt ? ` · last seen ${formatCustom(r.lastAt, 'MMM YYYY')}` : ''}
							</p>
						</div>
						<Link href={bookHref(r.book, { forChild: r.forChild })} className={buttonClasses({ size: 'sm', className: 'self-start sm:self-auto' })}>
							Book
						</Link>
					</li>
				))}
			</ul>
		</section>
	);
}
