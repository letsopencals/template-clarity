'use client';

import { clsx } from 'clsx';
import { usePersonFilter } from '@/components/account/use-care';
import type { CarePerson } from '@/components/account/care-utils';

const CHIP =
	'inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-4 text-[13px] font-medium transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-steel';

/** "Everyone · Me · Mia · Dad" — filters the whole portal through `?for=`. */
export function FamilyChips({ people, active }: { people: CarePerson[]; active: string | null }) {
	const { setPerson } = usePersonFilter();
	if (people.length < 2) return null;
	return (
		<div role="group" aria-label="Show care for" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" data-lenis-prevent>
			<button
				type="button"
				aria-pressed={active === null}
				onClick={() => setPerson(null)}
				className={clsx(CHIP, active === null ? 'border-steel bg-steel text-white' : 'border-line-strong bg-card text-ink-muted hover:border-steel hover:text-steel')}
			>
				Everyone
			</button>
			{people.map((p) => (
				<button
					key={p.key}
					type="button"
					aria-pressed={active === p.key}
					onClick={() => setPerson(p.key)}
					className={clsx(CHIP, active === p.key ? 'border-steel bg-steel text-white' : 'border-line-strong bg-card text-ink-muted hover:border-steel hover:text-steel')}
				>
					<span
						aria-hidden
						className={clsx(
							'inline-flex size-5 items-center justify-center rounded-full text-[10px] font-semibold',
							active === p.key ? 'bg-white/20 text-white' : p.relation === 'child' ? 'bg-honey-soft text-oak' : 'bg-steel-tint text-steel-deep',
						)}
					>
						{p.label.slice(0, 1).toUpperCase()}
					</span>
					{p.label}
					{p.relation === 'child' ? <span className="sr-only">(child)</span> : null}
				</button>
			))}
		</div>
	);
}
