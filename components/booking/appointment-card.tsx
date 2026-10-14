'use client';

import { useMemo, type ReactNode } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { Button, buttonClasses } from '@/components/ui/button';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { Seal } from '@/components/motifs/seal';
import { CareLine } from '@/components/motifs/care-line';
import { ClinicianFace } from '@/components/booking/clinician-face';
import { clinicName, type ClinicInfo } from '@/components/booking/seen-picker';
import { formatLongDate, formatSlotRange, slotLocalDate } from '@/components/booking/slot-time';
import { computeAddOnLineTotal, formatPrice } from '@/lib/format';
import { firstName, indexIntake } from '@/lib/intake';
import { prepFor } from '@/lib/site-config';
import type { BookingFlow } from '@/hooks/use-booking-flow';

interface AppointmentCardProps {
	flow: BookingFlow;
	currency: string;
	timeFormat: '12H' | '24H';
	clinicInfo: Record<string, ClinicInfo>;
	/** Start a fresh composer for another family member. */
	onBookAnother: (forChild: boolean) => void;
	/** Reserve (the composer scrolls to the first unfinished section when incomplete). */
	onReserve: () => void;
	/** Mobile sheet: no outer paper chrome. */
	bare?: boolean;
}

/** Re-keyed on value so each new choice writes itself in (animate-ink). */
function Ink({ value, children, className }: { value: string; children?: ReactNode; className?: string }) {
	return (
		<span key={value} className={clsx('animate-ink inline-block', className)}>
			{children ?? value}
		</span>
	);
}

function CardLine({ label, children, empty }: { label: string; children: ReactNode; empty?: boolean }) {
	return (
		<div className="grid grid-cols-[5.5rem_1fr] gap-3 py-2.5">
			<dt className="eyebrow pt-0.5 text-ink-dim">{label}</dt>
			<dd className={clsx('min-w-0 text-[15px] leading-snug', empty ? 'text-ink-dim' : 'text-ink')}>{children}</dd>
		</div>
	);
}

export function formatCountdown(seconds: number): string {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * The live appointment card: fills in as the patient chooses, then turns into
 * the hold ("Held for you", seal, countdown) once reserved.
 */
export function AppointmentCard({ flow, currency, timeFormat, clinicInfo, onBookAnother, onReserve, bare = false }: AppointmentCardProps) {
	const money = useMemo(() => (n: number) => formatPrice(n, currency), [currency]);
	const patientQuestion = useMemo(() => indexIntake(flow.questions).patientName, [flow.questions]);
	const patientFirst = patientQuestion ? firstName(flow.answers[patientQuestion.id]) : '';

	const forLine =
		flow.visitFor === null
			? null
			: flow.visitFor === 'self'
				? 'For you'
				: patientFirst
					? `For ${patientFirst}`
					: flow.visitFor === 'child'
						? 'For your child'
						: 'For someone you care for';

	const clinician = flow.finalClinician ?? (flow.selectedStaffId ? flow.cliniciansById.get(flow.selectedStaffId) : null) ?? null;
	const clinicianLabel = clinician
		? clinician.name
		: flow.clinicianAnswered && flow.selectedStaffId === null
			? 'First available'
			: null;

	const where = !flow.seenAnswered
		? null
		: flow.video
			? { title: 'Video visit', detail: 'Video link will be emailed' }
			: flow.selectedLocation
				? {
						title: clinicName(clinicInfo[flow.selectedLocation.id]?.title ?? flow.selectedLocation.title ?? ''),
						detail: clinicInfo[flow.selectedLocation.id]?.addressLines.join(', ') ?? '',
					}
				: null;

	const slot = flow.selectedSlot;
	const whenDate = slot ? formatLongDate(slotLocalDate(slot, flow.timezone)) : flow.selectedDate ? formatLongDate(flow.selectedDate) : null;
	const whenTime = slot ? formatSlotRange(slot, flow.timezone, timeFormat) : null;

	const addOnRows = useMemo(
		() =>
			Array.from(flow.selectedAddOns.entries())
				.map(([id, qty]) => {
					const a = flow.availableAddOns.find((x) => x.id === id);
					return a ? { id, title: a.durationMultiplied || qty === 1 ? a.title : `${a.title} × ${qty}`, total: computeAddOnLineTotal(a, qty, flow.bookedDurationUnits) } : null;
				})
				.filter((r): r is { id: string; title: string; total: number } => !!r),
		[flow.selectedAddOns, flow.availableAddOns, flow.bookedDurationUnits],
	);

	const prep = prepFor(flow.department, flow.video);
	const serviceTitle = flow.activeVariant?.title ?? flow.product?.title ?? '';
	const variantTitle = flow.hasVariants && flow.variants.length > 1 ? flow.activeVariant?.variantTitle : null;

	const held = flow.held;
	const lapsed = flow.lapsed;

	return (
		<div className={clsx(!bare && 'paper rounded-window border border-line shadow-paper', 'relative overflow-hidden')}>
			<div className={clsx(bare ? 'px-1' : 'p-6 sm:p-7')}>
				<div className="flex items-start justify-between gap-4">
					<div className="min-w-0">
						<p className="eyebrow text-ink-muted">{held ? (lapsed ? 'Hold lapsed' : 'Held for you') : 'Your appointment'}</p>
						<p className="display-xs mt-1 text-ink">{forLine ? <Ink value={forLine} /> : <span className="text-ink-dim">Who it’s for</span>}</p>
					</div>
					{held && !lapsed ? (
						<Seal motion="stamp" size={84} ring="Clear Care Medical · Held for you · " center="✓" className="-mr-1 -mt-1 shrink-0" />
					) : clinician ? (
						<Ink value={clinician.id}>
							<ClinicianFace clinician={clinician} size="lg" />
						</Ink>
					) : (
						<span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-dashed border-line-strong text-[11px] text-ink-dim" aria-hidden>
							{clinicianLabel === 'First available' ? 'Any' : ''}
						</span>
					)}
				</div>

				<CareLine settled={held} trigger="mount" tone={held ? 'brass' : 'steel'} className="my-4 h-8" />

				<dl className="divide-y divide-line">
					<CardLine label="Visit">
						<Ink value={serviceTitle}>
							{serviceTitle}
							{variantTitle ? <span className="text-ink-muted"> · {variantTitle}</span> : null}
						</Ink>
					</CardLine>
					<CardLine label="Where" empty={!where}>
						{where ? (
							<Ink value={where.title}>
								<span className="block">{where.title}</span>
								{where.detail ? <span className="block text-[13px] text-ink-muted">{where.detail}</span> : null}
							</Ink>
						) : (
							'Clinic or video'
						)}
					</CardLine>
					<CardLine label="With" empty={!clinicianLabel}>
						{clinicianLabel ? (
							<Ink value={clinicianLabel}>
								<span className="block">{clinicianLabel}</span>
								{clinician ? <span className="block text-[13px] text-ink-muted">{clinician.title}</span> : null}
							</Ink>
						) : (
							'Your clinician'
						)}
					</CardLine>
					<CardLine label="When" empty={!whenDate}>
						{whenDate ? (
							<Ink value={`${whenDate}${whenTime ?? ''}`}>
								<span className="block">{whenDate}</span>
								{whenTime ? <span className="tabular block text-[14px] text-ink-muted">{whenTime}</span> : null}
							</Ink>
						) : (
							'Day and time'
						)}
					</CardLine>
				</dl>

				<div className="mt-4 space-y-1.5 border-t border-line pt-4 text-[14px]">
					<div className="flex items-baseline text-ink-muted">
						<span>{serviceTitle || 'Visit'}</span>
						<span className="leader-line" aria-hidden />
						<span className="tabular">{money(flow.basePrice)}</span>
					</div>
					{addOnRows.map((r) => (
						<div key={r.id} className="flex items-baseline text-ink-muted">
							<Ink value={r.title}>{r.title}</Ink>
							<span className="leader-line" aria-hidden />
							<span className="tabular">{money(r.total)}</span>
						</div>
					))}
					<div className="flex items-baseline pt-2 text-ink">
						<span className="font-semibold">Total</span>
						<span className="leader-line" aria-hidden />
						<AnimatedNumber value={flow.total} format={money} className="tabular text-[20px]" />
					</div>
				</div>

				{held ? (
					<HeldActions flow={flow} lapsed={lapsed} onBookAnother={onBookAnother} />
				) : (
					<ReserveActions flow={flow} onReserve={onReserve} />
				)}

				<p className="mt-5 rounded-field bg-cream px-4 py-3 text-[13px] leading-relaxed text-ink-muted">
					<span className="font-semibold text-ink">Before you come · </span>
					{prep.tip}
				</p>
			</div>
		</div>
	);
}

function ReserveActions({ flow, onReserve }: { flow: BookingFlow; onReserve: () => void }) {
	const missingText = flow.missing.length > 0 ? `Still to choose: ${flow.missing.slice(0, 3).join(', ')}.` : null;
	return (
		<div className="mt-6">
			{flow.error ? (
				<div className="mb-4 rounded-field border border-clay/40 bg-clay-soft/50 px-4 py-3 text-[14px] text-ink" role="alert">
					<p>{flow.error.message}</p>
					{flow.error.code === 'slot_unavailable' ? (
						<button type="button" onClick={flow.chooseAnotherTime} className="link-underline mt-1.5 text-[13px] font-semibold text-steel">
							Choose another time
						</button>
					) : null}
				</div>
			) : null}
			<Button
				type="button"
				variant="primary"
				size="lg"
				fullWidth
				onClick={onReserve}
				disabled={flow.booking}
				aria-disabled={!flow.canReserve || undefined}
			>
				{flow.booking ? 'Holding your time…' : 'Reserve this visit'}
			</Button>
			<p className="mt-2.5 text-center text-[12px] text-ink-muted" aria-live="polite">
				{missingText ?? 'We’ll hold it for you while you check out. Nothing is charged yet.'}
			</p>
		</div>
	);
}

function HeldActions({ flow, lapsed, onBookAnother }: { flow: BookingFlow; lapsed: boolean; onBookAnother: (forChild: boolean) => void }) {
	if (lapsed) {
		return (
			<div className="mt-6">
				<p className="text-[14px] text-ink-muted">The hold ran out before checkout. The time may still be free.</p>
				<Button type="button" variant="primary" size="lg" fullWidth className="mt-3" onClick={flow.holdAgain}>
					Reserve again
				</Button>
			</div>
		);
	}
	const anotherForChild = flow.visitFor !== 'child';
	return (
		<div className="mt-6">
			{flow.error?.code === 'files_not_saved' || flow.timeRemaining === null ? null : (
				<p className="tabular text-[13px] text-ink-muted" aria-live="off">
					Held for {formatCountdown(flow.timeRemaining)}
				</p>
			)}
			<Link href="/checkout" className={buttonClasses({ variant: 'primary', size: 'lg', fullWidth: true, className: 'mt-3' })}>
				Continue to checkout
			</Link>
			<Button type="button" variant="outline" size="md" fullWidth className="mt-2" onClick={() => onBookAnother(anotherForChild)}>
				{anotherForChild ? 'Book for your child too' : 'Book another visit'}
			</Button>
			<button
				type="button"
				onClick={() => void flow.changeVisit()}
				disabled={flow.releasing}
				className="link-underline mx-auto mt-3 block text-[13px] font-semibold text-steel disabled:opacity-50"
			>
				{flow.releasing ? 'Releasing…' : 'Change this visit'}
			</button>
		</div>
	);
}
