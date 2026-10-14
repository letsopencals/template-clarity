import { clsx } from 'clsx';
import { CareLine } from '@/components/motifs/care-line';

type Tone = 'error' | 'success' | 'info';

const TONES: Record<Tone, string> = {
	error: 'border-clay/30 bg-clay-soft text-clay',
	success: 'border-sage/40 bg-sage-soft text-sage-deep',
	info: 'border-steel/20 bg-steel-tint text-steel-deep',
};

const DOT: Record<Tone, string> = {
	error: 'bg-clay',
	success: 'bg-sage-deep',
	info: 'bg-steel',
};

/** Quiet inline message (form errors, "a fresh code is on its way"). */
export function Notice({ tone = 'error', className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
	return (
		<div
			role={tone === 'error' ? 'alert' : 'status'}
			className={clsx('flex items-start gap-3 rounded-field border px-4 py-3 text-sm leading-relaxed', TONES[tone], className)}
		>
			<span aria-hidden className={clsx('mt-[0.45rem] size-1.5 shrink-0 rounded-full', DOT[tone])} />
			<div className="min-w-0">{children}</div>
		</div>
	);
}

/** Field label used across auth and settings forms. */
export const FIELD_LABEL = 'mb-2 block text-[13px] font-semibold text-ink';
/** Override for `components/ui/form.tsx` labels (their default is legacy). */
export const FORM_LABEL = 'mb-2 block text-[13px] font-semibold normal-case tracking-normal text-ink';
/** Override for `components/ui/form.tsx` messages. */
export const FORM_MESSAGE = 'mt-1.5 text-[13px] text-clay';
/** Quiet underlined text action. */
export const TEXT_LINK =
	'link-underline self-start text-sm font-medium text-steel transition-colors hover:text-steel-deep disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-steel rounded-sm';

/** Placeholder lines while an auth step loads (no spinners). */
export function AuthSkeleton() {
	return (
		<div className="space-y-4" aria-busy="true" aria-label="Loading">
			<div className="h-4 w-24 animate-pulse rounded-full bg-cream-deep/70" />
			<div className="h-12 animate-pulse rounded-field bg-cream" />
			<div className="h-14 animate-pulse rounded-full bg-cream" />
		</div>
	);
}

/** A care line drawing itself — used while a link or email is being checked. */
export function Working({ label }: { label: string }) {
	return (
		<div role="status" className="flex items-center gap-4 text-sm text-ink-muted">
			<span aria-hidden className="block w-24 shrink-0">
				<CareLine trigger="mount" />
			</span>
			{label}
		</div>
	);
}
