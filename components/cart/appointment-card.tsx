'use client';

import { memo, useState } from 'react';
import { clsx } from 'clsx';
import { SafeImage } from '@/components/ui/safe-image';
import { useHydrated } from '@/hooks/use-hydrated';
import { formatPrice } from '@/lib/format';
import { firstName } from '@/lib/intake';
import { siteConfig } from '@/lib/site-config';
import { type CartAddOnLine, type CartLine, useAppointmentFormat } from './cart-line';

interface AppointmentCardProps {
	line: CartLine;
	/** 0-based position, printed as "Visit 01". */
	index: number;
	currency: string | undefined;
	/** Drawer: qty controls + remove. Checkout stack: read-only. */
	editable?: boolean;
	/** Tighter layout for the drawer. */
	compact?: boolean;
	onRemove?: (itemId: string) => Promise<void>;
	onAddOnQuantity?: (addOnItemId: string, quantity: number) => Promise<void>;
	onAddOnRemove?: (addOnItemId: string) => Promise<void>;
	className?: string;
}

/**
 * The appointment card — clinic stationery: a framed service photo with the
 * clinician tucked into the corner, the visit and who it's with, a perforated
 * tear line, then date, time and where (clinic or video).
 */
export const AppointmentCard = memo(function AppointmentCard({
	line,
	index,
	currency,
	editable = false,
	compact = false,
	onRemove,
	onAddOnQuantity,
	onAddOnRemove,
	className,
}: AppointmentCardProps) {
	const fmt = useAppointmentFormat();
	const hydrated = useHydrated();
	const [confirming, setConfirming] = useState(false);
	const [removing, setRemoving] = useState(false);
	const discounted = line.discountedPrice < line.price;
	const pad = compact ? 'px-4 sm:px-5' : 'px-5 sm:px-6';

	const handleRemove = async () => {
		if (!onRemove) return;
		setRemoving(true);
		try {
			await onRemove(line.id);
		} finally {
			setRemoving(false);
			setConfirming(false);
		}
	};

	return (
		<article
			aria-label={`${line.title}${line.option ? `, ${line.option}` : ''}`}
			className={clsx('paper relative overflow-hidden border border-line', removing && 'opacity-50', className)}
		>
			{/* Steel tab on the left edge, like an index card. */}
			<span aria-hidden className={clsx('absolute inset-y-0 left-0 w-1', line.video ? 'bg-sage' : 'bg-steel')} />

			<div className={clsx('flex gap-4 pt-5 pb-4', pad)}>
				<div className="relative shrink-0">
					<div className="window-sm image-placeholder relative h-[76px] w-[64px]">
						<SafeImage src={line.image} alt="" fill sizes="64px" className="object-cover" />
					</div>
					{line.clinicianImage ? (
						<div className="image-placeholder absolute -right-2.5 -bottom-2 h-9 w-9 overflow-hidden rounded-full ring-2 ring-card">
							<SafeImage src={line.clinicianImage} alt="" fill sizes="36px" className="object-cover object-top" />
						</div>
					) : null}
				</div>

				<div className="min-w-0 flex-1">
					<div className="flex items-start justify-between gap-3">
						<p className="eyebrow text-[0.62rem] text-brass">
							Visit <span className="tabular">{String(index + 1).padStart(2, '0')}</span>
						</p>
						<p className="tabular text-right text-sm text-ink">
							{discounted ? (
								<>
									<span className="mr-1.5 text-xs text-ink-dim line-through">{formatPrice(line.price, currency)}</span>
									{formatPrice(line.discountedPrice, currency)}
								</>
							) : (
								formatPrice(line.price, currency)
							)}
						</p>
					</div>
					<h3 className="mt-1 font-display text-[1.2rem] leading-[1.15] text-ink sm:text-[1.3rem]">{line.title}</h3>
					<p className="mt-1 truncate text-[0.82rem] text-ink-muted">
						{line.option ? <span className="italic-display text-ink">{line.option}</span> : null}
						{line.option && line.clinicianName ? <span aria-hidden> · </span> : null}
						{line.clinicianName ? <>with {line.clinicianName}</> : null}
					</p>
					{line.patientName ? (
						<p className="mt-1.5 text-[0.78rem] text-ink-muted">
							For <span className="text-ink">{firstName(line.patientName)}</span>
						</p>
					) : null}
				</div>
			</div>

			<div className={clsx('perforation', compact ? 'mx-4 sm:mx-5' : 'mx-5 sm:mx-6')} aria-hidden />

			<dl className={clsx('grid grid-cols-2 gap-x-4 gap-y-3 py-3.5', pad)}>
				<div className="min-w-0">
					<dt className="eyebrow text-[0.58rem] text-ink-dim">Date</dt>
					<dd className="tabular mt-1 text-[0.82rem] text-ink">{hydrated ? fmt.date(line.from) || '—' : ' '}</dd>
				</div>
				<div className="min-w-0">
					<dt className="eyebrow text-[0.58rem] text-ink-dim">Time</dt>
					<dd className="tabular mt-1 text-[0.82rem] text-ink">
						{hydrated ? (
							<>
								{fmt.time(line.from, line.to) || '—'}
								<span className="ml-1 text-ink-dim">{fmt.zone(line.from)}</span>
							</>
						) : (
							' '
						)}
					</dd>
				</div>
				<div className="col-span-2 min-w-0">
					<dt className="sr-only">Where</dt>
					<dd className="flex items-center gap-2 text-[0.8rem] text-ink-muted">
						{line.video ? (
							<>
								<VideoGlyph />
								<span className="truncate">Video visit · link opens {siteConfig.videoVisit.joinWindowMinutes} minutes before</span>
							</>
						) : (
							<>
								<PinGlyph />
								<span className="truncate">{line.locationTitle ?? 'In clinic'}</span>
							</>
						)}
					</dd>
				</div>
			</dl>

			{line.addOns.length > 0 ? (
				<div className={clsx('border-t border-line py-3', pad)}>
					<p className="eyebrow text-[0.58rem] text-ink-dim">Added to this visit</p>
					<ul className="mt-2 space-y-2">
						{line.addOns.map((ao) => (
							<AddOnRow
								key={ao.id}
								addOn={ao}
								currency={currency}
								editable={editable}
								onQuantity={onAddOnQuantity}
								onRemove={onAddOnRemove}
							/>
						))}
					</ul>
				</div>
			) : null}

			{editable && onRemove ? (
				<div className={clsx('flex min-h-11 items-center justify-end gap-4 border-t border-line', pad)}>
					{confirming ? (
						<>
							<span className="mr-auto text-xs text-ink" role="status">
								Release this time?
							</span>
							<button
								type="button"
								onClick={() => setConfirming(false)}
								className="rounded-full px-2 py-1 text-xs text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-steel"
							>
								Keep it
							</button>
							<button
								type="button"
								onClick={handleRemove}
								disabled={removing}
								className="eyebrow rounded-full px-2 py-1 text-[0.6rem] text-clay hover:text-ink focus-visible:outline-2 focus-visible:outline-steel disabled:opacity-50"
							>
								{removing ? 'Removing…' : 'Yes, remove'}
							</button>
						</>
					) : (
						<button
							type="button"
							onClick={() => setConfirming(true)}
							className="eyebrow rounded-full px-2 py-1 text-[0.6rem] text-ink-muted transition-colors hover:text-clay focus-visible:outline-2 focus-visible:outline-steel"
						>
							Remove<span className="sr-only"> {line.title}</span>
						</button>
					)}
				</div>
			) : null}
		</article>
	);
});

function PinGlyph() {
	return (
		<svg className="h-3.5 w-3.5 shrink-0 text-steel" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden>
			<path d="M8 14.5s4.5-4.2 4.5-7.7A4.5 4.5 0 0 0 3.5 6.8c0 3.5 4.5 7.7 4.5 7.7Z" />
			<circle cx="8" cy="6.8" r="1.6" />
		</svg>
	);
}

function VideoGlyph() {
	return (
		<svg className="h-3.5 w-3.5 shrink-0 text-sage-deep" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden>
			<rect x="1.5" y="4" width="9" height="8" rx="2" />
			<path d="M10.5 7l4-2.2v6.4l-4-2.2" />
		</svg>
	);
}

interface AddOnRowProps {
	addOn: CartAddOnLine;
	currency: string | undefined;
	editable: boolean;
	onQuantity?: (addOnItemId: string, quantity: number) => Promise<void>;
	onRemove?: (addOnItemId: string) => Promise<void>;
}

const QTY_BTN =
	'flex h-7 w-7 items-center justify-center rounded-full border border-line-strong text-ink transition-colors hover:border-steel hover:text-steel focus-visible:outline-2 focus-visible:outline-steel disabled:opacity-30';

function AddOnRow({ addOn, currency, editable, onQuantity, onRemove }: AddOnRowProps) {
	const [pending, setPending] = useState(false);
	const run = async (fn: () => Promise<void>) => {
		setPending(true);
		try {
			await fn();
		} finally {
			setPending(false);
		}
	};
	const showQty = editable && !addOn.durationMultiplied && onQuantity;

	return (
		<li className={clsx('flex items-center gap-3 text-[0.82rem]', pending && 'opacity-60')}>
			<span className="min-w-0 flex-1 truncate text-ink">
				{addOn.title}
				{!showQty && addOn.quantity > 1 ? <span className="tabular text-ink-dim"> × {addOn.quantity}</span> : null}
			</span>
			{showQty ? (
				<span className="flex items-center" role="group" aria-label={`${addOn.title} quantity`}>
					<button
						type="button"
						className={QTY_BTN}
						disabled={pending}
						onClick={() => run(() => onQuantity(addOn.id, addOn.quantity - 1))}
						aria-label={`Fewer ${addOn.title}`}
					>
						<svg className="h-2.5 w-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
							<path d="M2 6h8" />
						</svg>
					</button>
					<span className="tabular w-7 text-center text-xs" aria-live="polite">
						{addOn.quantity}
					</span>
					<button
						type="button"
						className={QTY_BTN}
						disabled={pending || addOn.atMax}
						onClick={() => run(() => onQuantity(addOn.id, addOn.quantity + 1))}
						aria-label={`More ${addOn.title}`}
					>
						<svg className="h-2.5 w-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
							<path d="M2 6h8M6 2v8" />
						</svg>
					</button>
				</span>
			) : null}
			<span className="tabular w-16 text-right text-ink">{formatPrice(addOn.price, currency)}</span>
			{editable && onRemove ? (
				<button
					type="button"
					disabled={pending}
					onClick={() => run(() => onRemove(addOn.id))}
					aria-label={`Remove ${addOn.title}`}
					className="-mr-1.5 flex h-7 w-7 items-center justify-center rounded-full text-ink-dim transition-colors hover:text-clay focus-visible:outline-2 focus-visible:outline-steel disabled:opacity-40"
				>
					<svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden>
						<path d="M2.5 2.5l7 7M9.5 2.5l-7 7" />
					</svg>
				</button>
			) : null}
		</li>
	);
}
