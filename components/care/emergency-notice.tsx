import { clsx } from 'clsx';
import { siteConfig } from '@/lib/site-config';

/** The emergency line — shown wherever someone might be choosing care. Never a diagnosis tool. */
export function EmergencyNotice({ className, compact }: { className?: string; compact?: boolean }) {
	return (
		<aside role="note" aria-label="Emergency" className={clsx('flex gap-3 rounded-card border border-clay/25 bg-clay-soft/55 text-ink', compact ? 'p-3.5' : 'p-5', className)}>
			<span aria-hidden className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-clay text-[13px] font-bold text-paper">!</span>
			<div className="min-w-0">
				<p className="text-[14px] font-semibold text-clay">{siteConfig.emergency.short}</p>
				{compact ? null : <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{siteConfig.emergency.long}</p>}
			</div>
		</aside>
	);
}
