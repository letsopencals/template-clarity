import type { ReactNode } from 'react';
import Link from 'next/link';
import { CareLine } from '@/components/motifs/care-line';
import { Seal } from '@/components/motifs/seal';
import { buttonClasses } from '@/components/ui/button';
import { siteConfig } from '@/lib/site-config';
import type { VisitOutcome } from '@/lib/visit-outcome';

/**
 * Shown when the order can't be read — e.g. booking with an email that's
 * already on file doesn't sign the visitor in, so the visit is only visible
 * after signing in with that email.
 */
export function GuestFallback({ orderId, outcome, children }: { orderId: string | null; outcome: VisitOutcome; children?: ReactNode }) {
	const callbackUrl = encodeURIComponent(orderId ? `/account/orders/${orderId}` : '/account');
	return (
		<div className="paper relative mx-auto mt-4 flex max-w-xl flex-col items-center overflow-hidden border border-line px-6 py-12 text-center sm:px-12">
			<Seal motion="stamp" size={104} ring="Received · Clear Care Medical · " />
			<h2 className="display-sm mt-7 text-ink">
				Visit <em>received</em>
			</h2>
			<p className="mt-3 max-w-[40ch] text-sm leading-relaxed text-ink-muted">
				{outcome === 'confirmed'
					? 'We’ve emailed your confirmation.'
					: outcome === 'awaiting_payment'
						? 'We’ve emailed your booking. It’s confirmed once your payment arrives.'
						: 'We’ve emailed your request. The clinic will confirm it shortly.'}{' '}
				Sign in with the email you booked with to see your visit pass and what to bring.
			</p>
			<CareLine settled trigger="mount" className="mt-6 h-6 w-48" />
			{children ? <div className="mt-8 w-full text-left">{children}</div> : null}
			<Link href={`/auth/sign-in?callbackUrl=${callbackUrl}`} className={buttonClasses({ variant: 'primary', size: 'md', className: 'mt-7' })}>
				Sign in to My Care
			</Link>
			<Link href="/care" className="eyebrow link-underline mt-5 text-[0.62rem] text-ink-muted hover:text-ink">
				Book another visit
			</Link>
			<p className="mt-8 text-xs text-ink-dim">{siteConfig.emergency.short}</p>
		</div>
	);
}
