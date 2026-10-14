import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';

/** "Your care record is ready" — My Care for signed-in patients, a sign-up nudge for guests. */
export function AccountPrompt({ authenticated }: { authenticated: boolean }) {
	return (
		<section aria-labelledby="care-record-title" className="rounded-card bg-steel-deep px-6 py-7 text-paper sm:px-8">
			<p className="eyebrow text-[0.62rem] text-paper/70">My Care</p>
			<h2 id="care-record-title" className="display-xs mt-3">
				Your care record is <em>ready</em>
			</h2>
			<p className="mt-3 max-w-[40ch] text-sm leading-relaxed text-paper/80">
				{authenticated
					? 'See this visit, your pre-visit notes and what to bring. Reschedule or cancel from there too.'
					: 'Create an account with the email you booked with to see your visits, notes and receipts in one place.'}
			</p>
			<Link
				href={authenticated ? '/account' : '/auth/sign-up?callbackUrl=/account'}
				className={buttonClasses({ variant: 'quiet', size: 'md', className: 'mt-6' })}
			>
				{authenticated ? 'Open My Care' : 'Create your account'}
				<span aria-hidden>→</span>
			</Link>
		</section>
	);
}
