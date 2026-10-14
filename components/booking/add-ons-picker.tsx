'use client';

import { memo } from 'react';
import { clsx } from 'clsx';
import type { AddOnListItemResponse } from '@opencals/storefront-sdk';
import { Button } from '@/components/ui/button';
import { computeAddOnLineTotal, formatPrice } from '@/lib/format';

interface AddOnsPickerProps {
	addOns: AddOnListItemResponse[];
	loading: boolean;
	selected: Map<string, number>;
	currency: string;
	durationUnits: number;
	onChange: (addOnId: string, quantity: number) => void;
	onContinue: () => void;
}

function Stepper({ label, value, max, onChange }: { label: string; value: number; max: number; onChange: (n: number) => void }) {
	return (
		<div className="flex items-center gap-1 rounded-full border border-line bg-paper p-1" role="group" aria-label={`${label} quantity`}>
			<button
				type="button"
				onClick={() => onChange(Math.max(0, value - 1))}
				disabled={value === 0}
				aria-label={`Remove one ${label}`}
				className="flex h-8 w-8 items-center justify-center rounded-full text-ink transition-colors hover:bg-cream disabled:opacity-35"
			>
				−
			</button>
			<span className="tabular w-6 text-center text-[14px]" aria-live="polite">
				{value}
			</span>
			<button
				type="button"
				onClick={() => onChange(Math.min(max, value + 1))}
				disabled={value >= max}
				aria-label={`Add one ${label}`}
				className="flex h-8 w-8 items-center justify-center rounded-full text-ink transition-colors hover:bg-cream disabled:opacity-35"
			>
				+
			</button>
		</div>
	);
}

const AddOnRow = memo(function AddOnRow({
	addOn,
	quantity,
	currency,
	durationUnits,
	onChange,
}: {
	addOn: AddOnListItemResponse;
	quantity: number;
	currency: string;
	durationUnits: number;
	onChange: (addOnId: string, quantity: number) => void;
}) {
	const unit = computeAddOnLineTotal(addOn, 1, durationUnits);
	// durationMultiplied add-ons are priced × booked units and booked once (no qty sent).
	const max = addOn.durationMultiplied ? 1 : Math.max(1, addOn.maxQuantity ?? 10);
	return (
		<li className={clsx('flex flex-col gap-3 rounded-card border p-4 sm:flex-row sm:items-center', quantity > 0 ? 'border-steel bg-steel-tint/60' : 'border-line bg-card')}>
			<div className="min-w-0 flex-1">
				<p className="font-semibold text-ink">{addOn.title}</p>
				{addOn.description ? <p className="mt-0.5 text-[14px] leading-snug text-ink-muted">{addOn.description}</p> : null}
				<p className="tabular mt-1.5 text-[13px] text-ink-muted">
					+{formatPrice(unit, currency)}
					{addOn.durationMultiplied && durationUnits > 1 ? ` · for the whole visit` : ''}
				</p>
			</div>
			{max === 1 ? (
				<Button type="button" variant={quantity > 0 ? 'primary' : 'outline'} size="sm" aria-pressed={quantity > 0} onClick={() => onChange(addOn.id, quantity > 0 ? 0 : 1)}>
					{quantity > 0 ? 'Added' : 'Add'}
				</Button>
			) : (
				<Stepper label={addOn.title} value={quantity} max={max} onChange={(n) => onChange(addOn.id, n)} />
			)}
		</li>
	);
});

export function AddOnsPicker({ addOns, loading, selected, currency, durationUnits, onChange, onContinue }: AddOnsPickerProps) {
	if (loading) return <div className="h-24 animate-pulse rounded-card bg-cream" aria-busy aria-label="Loading extras" />;
	const any = Array.from(selected.values()).some((q) => q > 0);
	return (
		<div>
			<ul className="space-y-3">
				{addOns.map((a) => (
					<AddOnRow key={a.id} addOn={a} quantity={selected.get(a.id) ?? 0} currency={currency} durationUnits={durationUnits} onChange={onChange} />
				))}
			</ul>
			<Button type="button" variant={any ? 'primary' : 'outline'} size="md" className="mt-5" onClick={onContinue}>
				{any ? 'Continue' : 'No extras, continue'}
			</Button>
		</div>
	);
}
