'use client';

import { useLocation } from '@/contexts/location-context';
import { useTimezone } from '@/contexts/timezone-context';
import { useHydrated } from '@/hooks/use-hydrated';

/**
 * Global location + timezone selectors. Behaviour is unchanged from the
 * original template: the contexts own storage (localStorage `@opencals/location`,
 * cookie `@opencals/timezone`); this only renders them in Warm Practice.
 */
export function FooterSettings() {
	const { locations, selectedLocationId, setSelectedLocationId } = useLocation();
	const { timezone, setTimezone } = useTimezone();
	const hydrated = useHydrated();
	// The server's zone and IANA list differ from the visitor's, so options render after hydration only.
	// Some engines omit common aliases from the list, so the current zone is always included.
	const supported = hydrated ? Intl.supportedValuesOf('timeZone') : [];
	const zones = !hydrated ? [] : supported.includes(timezone) ? supported : [timezone, ...supported];

	// Online locations are never globally selectable — they only apply inside the
	// booking flow of the services they’re attached to.
	const selectableLocations = locations.filter((l) => l.type !== 'online');
	const hasLocations = selectableLocations.length > 1;

	return (
		<div className="flex flex-wrap items-center gap-x-6 gap-y-3">
			{hasLocations ? (
				<label className="flex items-center gap-2">
					<svg aria-hidden className="h-3.5 w-3.5 text-ink-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
						<path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
					<span className="sr-only">Clinic</span>
					<select
						value={selectedLocationId ?? ''}
						onChange={(e) => setSelectedLocationId(e.target.value || null)}
						className="rounded-field border-none bg-transparent text-xs text-ink-muted outline-none hover:text-ink focus-visible:text-ink focus-visible:ring-2 focus-visible:ring-steel/40"
					>
						<option value="" className="bg-cream text-ink">
							All Locations
						</option>
						{selectableLocations.map((l) => (
							<option key={l.id} value={l.id} className="bg-cream text-ink">
								{l.title ?? 'Location'}
							</option>
						))}
					</select>
				</label>
			) : null}
			<label className="flex items-center gap-2">
				<svg aria-hidden className="h-3.5 w-3.5 text-ink-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
					<path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<span className="sr-only">Timezone</span>
				<select
					value={timezone}
					onChange={(e) => setTimezone(e.target.value)}
					suppressHydrationWarning
					className="max-w-[200px] rounded-field border-none bg-transparent text-xs text-ink-muted outline-none hover:text-ink focus-visible:text-ink focus-visible:ring-2 focus-visible:ring-steel/40"
				>
					{zones.map((tz) => (
						<option key={tz} value={tz} className="bg-cream text-ink">
							{tz.replace(/_/g, ' ')}
						</option>
					))}
				</select>
			</label>
		</div>
	);
}
