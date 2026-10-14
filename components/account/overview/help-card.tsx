import { siteConfig } from '@/lib/site-config';

/** Nurse line + emergency guidance — always present in My Care. */
export function HelpCard() {
	return (
		<aside aria-label="Getting help" className="rounded-card bg-steel-deep px-6 py-6 text-paper">
			<p className="eyebrow text-paper/70">A question about your care?</p>
			<p className="mt-3 text-[15px] leading-relaxed text-paper/90">
				Our nurse line is open in clinic hours:{' '}
				<a
					href={`tel:${siteConfig.contact.nurseLine.replace(/[^\d+]/g, '')}`}
					className="tabular font-semibold whitespace-nowrap text-white underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
				>
					{siteConfig.contact.nurseLine}
				</a>
			</p>
			<p className="mt-4 border-t border-paper/15 pt-4 text-[13px] leading-relaxed text-paper/75">{siteConfig.emergency.long}</p>
		</aside>
	);
}
