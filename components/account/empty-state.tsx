import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';
import { CareLine } from '@/components/motifs/care-line';

/** Calm, lined-paper empty state with one next step. */
export function EmptyState({ title, body, href, cta }: { title: string; body: string; href?: string; cta?: string }) {
	return (
		<div className="ruled rounded-card border border-line px-6 py-10 text-center sm:px-10">
			<div className="mx-auto w-32">
				<CareLine settled trigger="view" tone="brass" />
			</div>
			<h3 className="display-xs mt-5 text-ink">{title}</h3>
			<p className="prose-calm mx-auto mt-2 max-w-[42ch] text-sm text-ink-muted">{body}</p>
			{href && cta ? (
				<Link href={href} className={buttonClasses({ size: 'md', className: 'mt-6' })}>
					{cta}
				</Link>
			) : null}
		</div>
	);
}

/** Inline failure with a retry, for SWR errors. */
export function LoadError({ what, onRetry }: { what: string; onRetry: () => void }) {
	return (
		<div role="alert" className="rounded-card border border-clay/30 bg-clay-soft px-6 py-5 text-sm text-clay">
			We couldn’t load {what} just now.{' '}
			<button type="button" onClick={onRetry} className="font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay">
				Try again
			</button>
		</div>
	);
}
