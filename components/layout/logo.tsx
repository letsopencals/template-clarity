import Link from 'next/link';
import { clsx } from 'clsx';
import { siteConfig } from '@/lib/site-config';

/**
 * The wordmark: a brass-ringed CC monogram + "Clear Care *Medical*". A store
 * logo image (from settings) replaces the monogram when one is uploaded.
 */
export function Logo({ logoUrl, tone = 'ink', className }: { logoUrl?: string | null; tone?: 'ink' | 'light'; className?: string }) {
	const light = tone === 'light';
	return (
		<Link href="/" className={clsx('group flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel/40', className)} aria-label={`${siteConfig.name} — home`}>
			{logoUrl ? (
				// eslint-disable-next-line @next/next/no-img-element
				<img src={logoUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
			) : (
				<span
					aria-hidden
					className={clsx(
						'relative flex h-9 w-9 items-center justify-center rounded-full border font-display text-[13px] italic tracking-tight transition-transform duration-500 group-hover:rotate-[-8deg]',
						light ? 'border-honey/60 text-honey' : 'border-brass text-steel-deep',
					)}
				>
					<span className={clsx('absolute inset-[3px] rounded-full border', light ? 'border-honey/25' : 'border-brass-soft')} />
					{siteConfig.logo.monogram}
				</span>
			)}
			<span className={clsx('whitespace-nowrap font-display text-[17px] sm:text-[19px] leading-none tracking-tight', light ? 'text-paper' : 'text-ink')}>
				{siteConfig.logo.text} <em className={clsx('italic', light ? 'text-honey' : 'text-steel')}>{siteConfig.logo.accent}</em>
			</span>
		</Link>
	);
}
