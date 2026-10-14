'use client';

import { useState } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';

const URGENT_SECONDS = 120;

interface HoldBarProps {
	/** Seconds left on the cart hold (useCart().timeRemaining). null = no expiry. */
	timeRemaining: number | null;
	/** cart.expiresAt — resets the progress baseline whenever the hold is extended. */
	expiresAt: string | null | undefined;
	onExtend: () => Promise<void> | void;
	/** Called when the visitor follows the "find a new time" link (e.g. close the drawer). */
	onNavigate?: () => void;
	className?: string;
}

function clock(total: number): string {
	const m = Math.floor(total / 60);
	const s = total % 60;
	return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * "We're holding your time" — the slot is reserved while the patient checks
 * out. A steel line drains as the hold runs down, turns clay under two
 * minutes, and Extend asks for more time.
 */
export function HoldBar({ timeRemaining, expiresAt, onExtend, onNavigate, className }: HoldBarProps) {
	// Baseline = the longest remaining time seen for this expiresAt, so the line
	// starts full and drains. Derived during render (no effect): reset when the
	// hold changes, raised if a stale tick arrives first.
	const [baseline, setBaseline] = useState<{ key: string | null; total: number }>({ key: null, total: 0 });
	const key = expiresAt ?? null;
	if (timeRemaining !== null && (baseline.key !== key || timeRemaining > baseline.total)) {
		setBaseline({ key, total: Math.max(timeRemaining, 1) });
	}
	const [extending, setExtending] = useState(false);

	if (timeRemaining === null) return null;

	const expired = timeRemaining <= 0;
	const urgent = !expired && timeRemaining < URGENT_SECONDS;
	const progress = baseline.total > 0 ? Math.min(1, timeRemaining / baseline.total) : 0;

	const handleExtend = async () => {
		setExtending(true);
		try {
			await onExtend();
		} finally {
			setExtending(false);
		}
	};

	if (expired) {
		return (
			<div role="status" className={clsx('rounded-field border border-clay/30 bg-clay-soft px-4 py-3', className)}>
				<p className="eyebrow text-[0.62rem] text-clay">The hold has ended</p>
				<p className="mt-1.5 text-sm text-ink">
					We released the time so someone else could have it.{' '}
					<Link href="/care" onClick={onNavigate} className="link-underline font-semibold text-steel-deep">
						Find a new time
					</Link>
				</p>
			</div>
		);
	}

	return (
		<div className={clsx('relative', className)}>
			<div className="flex items-center justify-between gap-4">
				<p className="flex min-w-0 items-baseline gap-2.5">
					<span className={clsx('eyebrow text-[0.62rem] transition-colors duration-500', urgent ? 'text-clay' : 'text-ink-muted')}>
						Holding your time
					</span>
					<span
						className={clsx('tabular text-sm transition-colors duration-500', urgent ? 'text-clay' : 'text-ink')}
						aria-label={`${Math.floor(timeRemaining / 60)} minutes ${timeRemaining % 60} seconds left`}
						role="timer"
					>
						{clock(timeRemaining)}
					</span>
				</p>
				<button
					type="button"
					onClick={handleExtend}
					disabled={extending}
					className={clsx(
						'eyebrow shrink-0 rounded-full border px-3 py-1.5 text-[0.6rem] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-steel disabled:opacity-50',
						urgent ? 'border-clay/40 text-clay hover:bg-clay-soft' : 'border-line-strong text-ink hover:border-steel hover:text-steel',
					)}
				>
					{extending ? 'Extending…' : 'Extend'}
					<span className="sr-only"> the hold</span>
				</button>
			</div>
			<div className="relative mt-2.5 h-[2px] w-full overflow-hidden rounded-full bg-line" aria-hidden>
				<div
					className={clsx(
						'absolute inset-0 origin-left rounded-full transition-[transform,background-color] duration-1000 ease-linear',
						urgent ? 'bg-clay' : 'bg-steel',
					)}
					style={{ transform: `scaleX(${progress})` }}
				/>
			</div>
			{/* Polite announcement only when it turns urgent, not every second. */}
			<span className="sr-only" aria-live="polite">
				{urgent ? 'Less than two minutes left on your hold. Use Extend for more time.' : ''}
			</span>
		</div>
	);
}
