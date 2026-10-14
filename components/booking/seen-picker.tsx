'use client';

import { memo, useMemo } from 'react';
import { clsx } from 'clsx';
import { SafeImage } from '@/components/ui/safe-image';
import { DepartmentIcon } from '@/components/ui/department-icon';
import { useNow } from '@/hooks/use-now';
import { useSettings } from '@/contexts/settings-context';
import { clinicMeta, siteConfig } from '@/lib/site-config';
import { formatClock, openStateAt, parseOpeningHours, type DayHours } from '@/lib/opening-hours';
import type { VisitMode } from '@/hooks/use-booking-flow';

/** Public address data for a clinic (a subset of `ClinicInfo`). */
export interface ClinicInfo {
	title: string;
	addressLines: string[];
}

export interface SeenClinic {
	id: string;
	slug: string;
	title: string;
}

interface SeenPickerProps {
	clinics: SeenClinic[];
	/** Public address data for the clinics (from `getClinics`). */
	clinicInfo: Record<string, ClinicInfo>;
	videoAvailable: boolean;
	mode: VisitMode;
	/** Selected clinic when mode is 'clinic'. */
	selectedLocationId: string | null;
	/** Whether the patient has answered (otherwise nothing shows as selected). */
	answered: boolean;
	onChoose: (mode: VisitMode, clinicId: string | null) => void;
}

const WEEK: DayHours[] = parseOpeningHours(siteConfig.contact.hours);

/** "Clear Care Medical — Chicago" → "Chicago" */
export function clinicName(title: string): string {
	const parts = title.split(/\s+[—–-]\s+/);
	return parts.length > 1 ? parts[parts.length - 1]! : title;
}

/** The clinic's own wall clock as a Date whose local fields read in that zone. */
function wallClock(now: Date, timeZone: string | undefined): Date {
	if (!timeZone) return now;
	return new Date(now.toLocaleString('en-US', { timeZone }));
}

function OpenNow({ timeZone }: { timeZone: string | undefined }) {
	const now = useNow(60_000);
	const { timeFormat } = useSettings();
	if (!now) return <span className="text-[12px] text-ink-dim">&nbsp;</span>;
	const state = openStateAt(WEEK, wallClock(now, timeZone));
	const fmt = timeFormat === '24H' ? '24H' : '12H';
	if (state.kind === 'open') {
		return (
			<span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-sage-deep">
				<span className="live-dot" aria-hidden />
				Open now · until {formatClock(state.until, fmt)}
			</span>
		);
	}
	const text =
		state.kind === 'later' ? `Opens today at ${formatClock(state.from, fmt)}` : state.next ? `Closed · opens ${state.next.short} ${formatClock(state.next.open ?? 0, fmt)}` : 'Closed';
	return <span className="text-[12px] text-ink-muted">{text}</span>;
}

const ClinicCard = memo(function ClinicCard({
	clinic,
	info,
	index,
	selected,
	onSelect,
}: {
	clinic: SeenClinic;
	info: ClinicInfo | undefined;
	index: number;
	selected: boolean;
	onSelect: () => void;
}) {
	const meta = clinicMeta(clinic.slug, index);
	return (
		<button
			type="button"
			role="radio"
			aria-checked={selected}
			onClick={onSelect}
			className={clsx(
				'group flex min-w-0 flex-col overflow-hidden rounded-card border bg-card text-left transition-[border-color,box-shadow] duration-300',
				selected ? 'border-steel shadow-card ring-1 ring-steel' : 'border-line hover:border-line-strong',
			)}
		>
			<div className="window-sm relative aspect-[16/9] w-full overflow-hidden">
				<SafeImage
					src={`/images/${meta.image}`}
					alt=""
					fill
					sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw"
					className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
				/>
			</div>
			<div className="flex flex-1 flex-col gap-1 p-4">
				<span className="font-semibold text-ink">{clinicName(info?.title ?? clinic.title)}</span>
				{info?.addressLines.length ? <span className="text-[13px] leading-snug text-ink-muted">{info.addressLines.join(', ')}</span> : null}
				<span className="mt-auto pt-2">
					<OpenNow timeZone={meta.timezone} />
				</span>
			</div>
		</button>
	);
});

function VideoCard({ selected, onSelect }: { selected: boolean; onSelect: () => void }) {
	return (
		<button
			type="button"
			role="radio"
			aria-checked={selected}
			onClick={onSelect}
			className={clsx(
				'flex min-w-0 flex-col justify-between gap-6 rounded-card border p-5 text-left transition-[border-color,box-shadow,background-color] duration-300',
				selected ? 'border-steel bg-steel-tint shadow-card ring-1 ring-steel' : 'border-line bg-cream hover:border-line-strong',
			)}
		>
			<span className="flex h-11 w-11 items-center justify-center rounded-full bg-steel text-white">
				<DepartmentIcon name="video" className="h-5 w-5" />
			</span>
			<span>
				<span className="block font-semibold text-ink">Video visit</span>
				<span className="mt-1 block text-[13px] leading-snug text-ink-muted">
					From home, on your phone or computer. We’ll email the link.
				</span>
			</span>
		</button>
	);
}

export function SeenPicker({ clinics, clinicInfo, videoAvailable, mode, selectedLocationId, answered, onChoose }: SeenPickerProps) {
	const cols = useMemo(() => {
		const n = clinics.length + (videoAvailable ? 1 : 0);
		return n >= 4 ? 'sm:grid-cols-2 xl:grid-cols-4' : n === 3 ? 'sm:grid-cols-3' : n === 2 ? 'sm:grid-cols-2' : '';
	}, [clinics.length, videoAvailable]);

	return (
		<div role="radiogroup" aria-label="How you’ll be seen" className={clsx('grid grid-cols-1 gap-3', cols)}>
			{clinics.map((c, i) => (
				<ClinicCard
					key={c.id}
					clinic={c}
					info={clinicInfo[c.id]}
					index={i}
					selected={answered && mode === 'clinic' && selectedLocationId === c.id}
					onSelect={() => onChoose('clinic', c.id)}
				/>
			))}
			{videoAvailable ? <VideoCard selected={answered && mode === 'video'} onSelect={() => onChoose('video', null)} /> : null}
		</div>
	);
}
