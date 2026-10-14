'use client';

import { clsx } from 'clsx';
import { useDateFormatter } from '@/hooks/use-date-formatter';

/** Appointment-card date block: weekday, big day number, month. */
export function DatePlate({ iso, muted, size = 'md', className }: { iso: string; muted?: boolean; size?: 'md' | 'lg'; className?: string }) {
	const { formatCustom } = useDateFormatter();
	return (
		<div
			aria-hidden
			className={clsx(
				'flex shrink-0 flex-col items-center justify-center rounded-card border text-center',
				muted ? 'border-line bg-cream/60 text-ink-muted' : 'border-steel/20 bg-card text-ink shadow-card',
				size === 'lg' ? 'h-24 w-20' : 'h-[4.5rem] w-16',
				className,
			)}
		>
			<span className={clsx('eyebrow text-[0.62rem]', muted ? 'text-ink-dim' : 'text-brass')}>{formatCustom(iso, 'ddd')}</span>
			<span className={clsx('font-display leading-none tracking-tight', size === 'lg' ? 'mt-1 text-[2.4rem]' : 'mt-0.5 text-[1.9rem]')}>{formatCustom(iso, 'D')}</span>
			<span className="mt-1 text-[11px] font-medium text-ink-muted">{formatCustom(iso, 'MMM')}</span>
		</div>
	);
}
