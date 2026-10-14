'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { CurrentAvailabilitySlot } from '@opencals/storefront-sdk';
import { SPRING_SOFT } from '@/components/motion/easing';
import { FaceStack } from '@/components/booking/clinician-face';
import { DAY_PARTS, DAY_PART_LABELS, dayPartOf, formatSlotTime, slotHour, slotKey, type DayPart } from '@/components/booking/slot-time';
import type { PublicClinician } from '@/lib/clinicians';

interface SlotGridProps {
	slots: CurrentAvailabilitySlot[];
	loading: boolean;
	selectedSlot: CurrentAvailabilitySlot | null;
	timezone: string;
	timeFormat: '12H' | '24H';
	/** Show who is free at each time ("First available" mode). */
	showFaces: boolean;
	cliniciansById: Map<string, PublicClinician>;
	onSelect: (slot: CurrentAvailabilitySlot) => void;
}

const SlotButton = memo(function SlotButton({
	slot,
	label,
	selected,
	faces,
	onSelect,
}: {
	slot: CurrentAvailabilitySlot;
	label: string;
	selected: boolean;
	faces: PublicClinician[] | null;
	onSelect: (slot: CurrentAvailabilitySlot) => void;
}) {
	return (
		<button
			type="button"
			aria-pressed={selected}
			onClick={() => onSelect(slot)}
			className={clsx(
				'relative flex min-h-12 items-center justify-between gap-2 rounded-field border px-3.5 py-2 text-left transition-colors duration-300',
				selected ? 'border-steel text-white' : 'border-line bg-card text-ink hover:border-steel',
			)}
		>
			{selected ? <motion.span layoutId="slot-fill" transition={SPRING_SOFT} className="absolute inset-0 rounded-field bg-steel" aria-hidden /> : null}
			<span className="tabular relative text-[15px]">{label}</span>
			{faces && faces.length > 0 ? (
				<span className="relative">
					<FaceStack clinicians={faces} max={2} />
				</span>
			) : null}
		</button>
	);
});

/** Times for the chosen day, grouped Morning / Afternoon / Evening. */
export function SlotGrid({ slots, loading, selectedSlot, timezone, timeFormat, showFaces, cliniciansById, onSelect }: SlotGridProps) {
	const groups = useMemo(() => {
		const out: Record<DayPart, CurrentAvailabilitySlot[]> = { morning: [], afternoon: [], evening: [] };
		for (const s of slots) out[dayPartOf(slotHour(s.fromDate, s.fromTime, timezone))].push(s);
		return out;
	}, [slots, timezone]);

	if (loading) {
		return (
			<div className="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-busy aria-label="Loading times">
				{Array.from({ length: 8 }, (_, i) => (
					<span key={i} className="h-12 animate-pulse rounded-field bg-cream" />
				))}
			</div>
		);
	}
	if (slots.length === 0) {
		return <p className="text-[15px] text-ink-muted">No times left on this day. Try the next open day.</p>;
	}

	const selectedKey = selectedSlot ? slotKey(selectedSlot) : null;
	return (
		<div className="space-y-6">
			{DAY_PARTS.filter((p) => groups[p].length > 0).map((part) => (
				<div key={part}>
					<p className="eyebrow mb-2.5 text-ink-muted">{DAY_PART_LABELS[part]}</p>
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
						{groups[part].map((s) => (
							<SlotButton
								key={slotKey(s)}
								slot={s}
								label={formatSlotTime(s.fromDate, s.fromTime, timezone, timeFormat)}
								selected={slotKey(s) === selectedKey}
								faces={
									showFaces
										? (s.staffMemberIds ?? []).map((id) => cliniciansById.get(id)).filter((c): c is PublicClinician => !!c)
										: null
								}
								onSelect={onSelect}
							/>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
