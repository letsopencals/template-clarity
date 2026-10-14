'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { prepFor } from '@/lib/site-config';

const STORAGE_PREFIX = 'cc-prep:';

function readTicks(key: string): string[] {
	try {
		const raw = window.localStorage.getItem(key);
		const parsed: unknown = raw ? JSON.parse(raw) : [];
		return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
	} catch {
		return [];
	}
}

/** "What to bring" with ticks remembered on this device, per appointment. */
export function PrepChecklist({ appointmentId, department, video }: { appointmentId: string; department: string | null; video: boolean }) {
	const prep = useMemo(() => prepFor(department, video), [department, video]);
	const storageKey = `${STORAGE_PREFIX}${appointmentId}`;
	const [ticked, setTicked] = useState<string[]>([]);

	useEffect(() => {
		setTicked(readTicks(storageKey));
	}, [storageKey]);

	const toggle = useCallback(
		(item: string) => {
			setTicked((prev) => {
				const next = prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item];
				try {
					window.localStorage.setItem(storageKey, JSON.stringify(next));
				} catch {
					// Private mode: ticks just won't persist.
				}
				return next;
			});
		},
		[storageKey],
	);

	const done = prep.bring.filter((b) => ticked.includes(b)).length;

	return (
		<div className="ruled flex h-full min-w-0 flex-col rounded-card border border-line px-5 pt-5 pb-6 sm:px-6">
			<div className="flex items-baseline justify-between gap-3">
				<p className="eyebrow text-brass">{video ? 'Before you join' : 'What to bring'}</p>
				<p className="tabular text-xs text-ink-dim" aria-live="polite">
					{done}/{prep.bring.length}
				</p>
			</div>
			<ul className="mt-4 space-y-1">
				{prep.bring.map((item) => {
					const on = ticked.includes(item);
					return (
						<li key={item}>
							<label className="group flex min-h-[2.1rem] cursor-pointer items-start gap-3 py-1">
								<input type="checkbox" checked={on} onChange={() => toggle(item)} className="peer sr-only" />
								<span
									aria-hidden
									className={clsx(
										'mt-0.5 inline-flex size-[1.15rem] shrink-0 items-center justify-center rounded-[5px] border transition-colors duration-300 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-steel',
										on ? 'border-sage-deep bg-sage-deep text-white' : 'border-line-strong bg-card group-hover:border-steel',
									)}
								>
									{on ? (
										<svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth={2.2}>
											<path d="M3.5 8.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
										</svg>
									) : null}
								</span>
								<span className={clsx('text-[15px] leading-snug transition-colors', on ? 'text-ink-dim line-through decoration-line-strong' : 'text-ink')}>{item}</span>
							</label>
						</li>
					);
				})}
			</ul>
			<p className="mt-auto pt-5 text-[13px] leading-relaxed text-ink-muted">
				<span className="font-display text-oak italic">A tip — </span>
				{prep.tip}
				{!video && prep.arriveEarly ? ` Please arrive ${prep.arriveEarly} minutes early.` : null}
			</p>
		</div>
	);
}
