'use client';

import { useState, type FormEvent } from 'react';
import { clsx } from 'clsx';
import { DepartmentIcon } from '@/components/ui/department-icon';
import type { VisitFor } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';
import { NEEDS, type SeenMode } from './match';

/* Option tiles for the three Care Finder questions. Radiogroups, keyboard-usable. */

const TILE = 'group relative flex w-full items-start gap-4 rounded-card border p-5 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel/40';
const TILE_ON = 'border-steel bg-steel-tint shadow-card';
const TILE_OFF = 'border-line-strong bg-card hover:border-steel/60 hover:shadow-card';

function Tick({ on }: { on: boolean }) {
	return (
		<span
			aria-hidden
			className={clsx(
				'ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors',
				on ? 'border-steel bg-steel text-paper' : 'border-line-strong text-transparent group-hover:border-steel/60',
			)}
		>
			<DepartmentIcon name="check" className="h-3.5 w-3.5" />
		</span>
	);
}

const WHO: { id: VisitFor; label: string; hint: string; icon: string }[] = [
	{ id: 'self', label: 'Me', hint: 'Booking for yourself', icon: 'user' },
	{ id: 'child', label: 'My child', hint: 'Newborn to teen — our pediatric team', icon: 'child' },
	{ id: 'other', label: 'Someone else', hint: 'A partner, parent or friend', icon: 'users' },
];

export function WhoOptions({ value, onChange }: { value: VisitFor | null; onChange: (v: VisitFor) => void }) {
	return (
		<div role="radiogroup" aria-label={siteConfig.careFinder.whoPrompt} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
			{WHO.map((o) => {
				const on = value === o.id;
				return (
					<button key={o.id} type="button" role="radio" aria-checked={on} onClick={() => onChange(o.id)} className={clsx(TILE, 'flex-col', on ? TILE_ON : TILE_OFF)}>
						<span className="flex w-full items-center gap-3">
							<span className={clsx('flex h-11 w-11 items-center justify-center rounded-full transition-colors', on ? 'bg-steel text-paper' : 'bg-cream text-oak')}>
								<DepartmentIcon name={o.icon} className="h-5 w-5" />
							</span>
							<Tick on={on} />
						</span>
						<span className="mt-2 font-display text-[1.45rem] leading-tight tracking-tight text-ink">{o.label}</span>
						<span className="text-[13px] leading-snug text-ink-muted">{o.hint}</span>
					</button>
				);
			})}
		</div>
	);
}

export function NeedOptions({
	value,
	query,
	onChange,
	onSearch,
}: {
	value: string | null;
	query: string;
	onChange: (id: string) => void;
	onSearch: (q: string) => void;
}) {
	const [text, setText] = useState(query);
	const submit = (e: FormEvent) => {
		e.preventDefault();
		onSearch(text.trim());
	};
	return (
		<div>
			<div role="radiogroup" aria-label={siteConfig.careFinder.needPrompt} className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
				{NEEDS.map((n) => {
					const on = value === n.id;
					return (
						<button key={n.id} type="button" role="radio" aria-checked={on} onClick={() => onChange(n.id)} className={clsx(TILE, 'items-center p-4', on ? TILE_ON : TILE_OFF)}>
							<span className={clsx('flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors', on ? 'bg-steel text-paper' : 'bg-cream text-oak')}>
								<DepartmentIcon name={n.icon} className="h-5 w-5" />
							</span>
							<span className="min-w-0">
								<span className="block text-[15px] font-semibold text-ink">{n.label}</span>
								<span className="block text-[13px] leading-snug text-ink-muted">{n.hint}</span>
							</span>
							<Tick on={on} />
						</button>
					);
				})}
			</div>
			<form onSubmit={submit} role="search" className="mt-5 flex items-center gap-2 rounded-full border border-line-strong bg-card py-1.5 pl-4 pr-1.5 transition-colors focus-within:border-steel focus-within:ring-2 focus-within:ring-steel/20">
				<DepartmentIcon name="search" className="h-4 w-4 shrink-0 text-ink-dim" />
				<label htmlFor="care-search" className="sr-only">
					Or describe it in your own words
				</label>
				<input
					id="care-search"
					value={text}
					onChange={(e) => setText(e.target.value)}
					placeholder="Or describe it in your words…"
					className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-dim"
				/>
				<button type="submit" className="h-10 shrink-0 rounded-full bg-steel px-5 text-[13px] font-semibold text-paper transition-colors hover:bg-steel-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel/40">
					Search
				</button>
			</form>
		</div>
	);
}

const MODES: { id: SeenMode; label: string; hint: string; icon: string }[] = [
	{ id: 'clinic', label: 'In clinic', hint: 'One of our three clinics', icon: 'pin' },
	{ id: 'video', label: 'Video visit', hint: 'From home, same clinicians', icon: 'video' },
	{ id: 'any', label: 'No preference', hint: 'Show me the best fit', icon: 'globe' },
];

export function ModeOptions({ value, onChange }: { value: SeenMode | null; onChange: (v: SeenMode) => void }) {
	return (
		<div role="radiogroup" aria-label={siteConfig.careFinder.modePrompt} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
			{MODES.map((o) => {
				const on = value === o.id;
				return (
					<button key={o.id} type="button" role="radio" aria-checked={on} onClick={() => onChange(o.id)} className={clsx(TILE, 'flex-col', on ? TILE_ON : TILE_OFF)}>
						<span className="flex w-full items-center gap-3">
							<span className={clsx('flex h-11 w-11 items-center justify-center rounded-full transition-colors', on ? 'bg-steel text-paper' : 'bg-cream text-oak')}>
								<DepartmentIcon name={o.icon} className="h-5 w-5" />
							</span>
							<Tick on={on} />
						</span>
						<span className="mt-2 font-display text-[1.45rem] leading-tight tracking-tight text-ink">{o.label}</span>
						<span className="text-[13px] leading-snug text-ink-muted">{o.hint}</span>
					</button>
				);
			})}
		</div>
	);
}

export const WHO_LABEL: Record<VisitFor, string> = { self: 'Me', child: 'My child', other: 'Someone else' };
export const MODE_LABEL: Record<SeenMode, string> = { clinic: 'In clinic', video: 'Video visit', any: 'No preference' };
