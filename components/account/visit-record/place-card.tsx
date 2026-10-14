'use client';

import { buttonClasses } from '@/components/ui/button';
import { DepartmentIcon } from '@/components/ui/department-icon';
import { siteConfig } from '@/lib/site-config';
import { ClinicianPortrait } from '@/components/account/clinician-portrait';
import { directionsHref, joinState } from '@/components/account/care-utils';
import type { CareVisit } from '@/components/account/care-types';

/** Who you'll see and where (address + directions, or the video link). */
export function PlaceCard({ visit, nowMs, upcoming }: { visit: CareVisit; nowMs: number; upcoming: boolean }) {
	const place = visit.place;
	const directions = place ? directionsHref(place) : null;
	const join = joinState(visit, nowMs);
	return (
		<section aria-label="Clinician and place" className="paper divide-y divide-line">
			{visit.clinician ? (
				<div className="flex items-center gap-4 p-5 sm:p-6">
					<ClinicianPortrait name={visit.clinician.name} imageUrl={visit.clinician.imageUrl} size={56} />
					<div className="min-w-0">
						<p className="eyebrow text-ink-dim">{upcoming ? 'You’ll see' : 'You saw'}</p>
						<p className="mt-1 truncate font-display text-lg text-ink">{visit.clinician.name}</p>
						<p className="text-sm text-ink-muted">{visit.clinician.title}</p>
					</div>
				</div>
			) : null}
			<div className="p-5 sm:p-6">
				{visit.video ? (
					<>
						<p className="eyebrow flex items-center gap-2 text-ink-dim">
							<DepartmentIcon name="video" className="size-3.5" /> Video visit
						</p>
						{upcoming ? (
							join === 'open' && place?.link ? (
								<a href={place.link} target="_blank" rel="noopener noreferrer" className={buttonClasses({ size: 'md', fullWidth: true, className: 'mt-4' })}>
									<span className="live-dot" aria-hidden />
									Join video visit
								</a>
							) : (
								<p className="mt-3 text-sm leading-relaxed text-ink-muted">
									{place?.link
										? `The Join button appears here ${siteConfig.videoVisit.joinWindowMinutes} minutes before your visit. Find a quiet, private spot.`
										: 'Your video link will appear here before the visit.'}
								</p>
							)
						) : (
							<p className="mt-3 text-sm text-ink-muted">This visit took place by video.</p>
						)}
					</>
				) : (
					<>
						<p className="eyebrow flex items-center gap-2 text-ink-dim">
							<DepartmentIcon name="pin" className="size-3.5" /> {place?.title ?? siteConfig.shortName}
						</p>
						{place?.addressLines.length ? (
							<address className="mt-3 text-[15px] leading-relaxed text-ink not-italic">
								{place.addressLines.map((l) => (
									<span key={l} className="block">
										{l}
									</span>
								))}
							</address>
						) : null}
						{upcoming && directions ? (
							<a href={directions} target="_blank" rel="noopener noreferrer" className={buttonClasses({ size: 'md', variant: 'outline', fullWidth: true, className: 'mt-4' })}>
								Get directions
							</a>
						) : null}
					</>
				)}
			</div>
		</section>
	);
}
