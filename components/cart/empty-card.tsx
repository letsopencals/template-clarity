import Link from 'next/link';
import { clsx } from 'clsx';
import { CareLine } from '@/components/motifs/care-line';
import { buttonClasses } from '@/components/ui/button';

/** "No visits held" — an empty appointment card, for the drawer and /checkout. */
export function EmptyCard({ onNavigate, className }: { onNavigate?: () => void; className?: string }) {
	return (
		<div className={clsx('flex flex-col items-center text-center', className ?? 'h-full justify-center py-10')}>
			<div className="paper relative w-full max-w-[300px] overflow-hidden border border-line px-6 pt-6 pb-5 text-left">
				<span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-line-strong" />
				<p className="eyebrow text-[0.6rem] text-ink-dim">Appointment card</p>
				<div className="mt-4 space-y-2.5" aria-hidden>
					<span className="block h-2.5 w-3/4 rounded-full bg-cream" />
					<span className="block h-2.5 w-1/2 rounded-full bg-cream" />
				</div>
				<div className="perforation my-4" aria-hidden />
				<CareLine trigger="mount" tone="steel" className="h-7 w-full" />
			</div>
			<p className="eyebrow mt-8 text-ink-muted">No visits held</p>
			<h3 className="display-sm mt-3 text-ink">
				Nothing booked <em>yet</em>
			</h3>
			<p className="mt-3 max-w-[32ch] text-sm leading-relaxed text-ink-muted">
				Tell us what you need and we&rsquo;ll match you with the right clinician and a time that suits you.
			</p>
			<Link href="/care" onClick={onNavigate} className={buttonClasses({ variant: 'primary', size: 'md', className: 'mt-7' })}>
				Find care
				<span aria-hidden>→</span>
			</Link>
		</div>
	);
}
