'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CheckoutQuestionResponse, ProductListItemResponse } from '@opencals/storefront-sdk';
import { Button } from '@/components/ui/button';
import { CareLine } from '@/components/motifs/care-line';
import { useSmoothScroll } from '@/components/motion/smooth-scroll';
import { useSettings } from '@/contexts/settings-context';
import { useHydrated } from '@/hooks/use-hydrated';
import { SECTION, useBookingFlow, type BookingDeepLink, type SectionIndex } from '@/hooks/use-booking-flow';
import type { PublicClinician } from '@/lib/clinicians';
import { formatPrice } from '@/lib/format';
import { BookSection, type SectionState } from '@/components/booking/book-section';
import { BookingHeader } from '@/components/booking/booking-header';
import { VisitForPicker } from '@/components/booking/visit-for-picker';
import { SeenPicker, clinicName, type ClinicInfo } from '@/components/booking/seen-picker';
import { ClinicianPicker } from '@/components/booking/clinician-picker';
import { DayRibbon } from '@/components/booking/day-ribbon';
import { SlotGrid } from '@/components/booking/slot-grid';
import { ClinicianConfirm } from '@/components/booking/clinician-confirm';
import { AddOnsPicker } from '@/components/booking/add-ons-picker';
import { PreVisitNotes } from '@/components/booking/pre-visit-notes';
import { AppointmentCard } from '@/components/booking/appointment-card';
import { MobileCardBar } from '@/components/booking/mobile-card-bar';
import type { VariantCarry } from '@/components/booking/booking-view';
import { formatShortDate, formatSlotTime, slotLocalDate } from '@/components/booking/slot-time';

export interface ComposerProps {
	slug: string;
	initialProduct: ProductListItemResponse | null;
	initialQuestions: CheckoutQuestionResponse[];
	initialQuestionsSlug: string | null;
	clinicians: PublicClinician[];
	clinicInfo: Record<string, ClinicInfo>;
	deepLink: BookingDeepLink;
	onSwitchVariant: (slug: string, carry: VariantCarry) => void;
	onBookAnother: (forChild: boolean) => void;
}

const SECTION_IDS: Record<SectionIndex, string> = {
	0: 'visit-for',
	1: 'how-seen',
	2: 'clinician',
	3: 'day-time',
	4: 'add-ons',
	5: 'notes',
};

const VISIT_FOR_SHORT = { self: 'Me', child: 'My child', other: 'Someone else' } as const;

/**
 * The clinic composer: six numbered sections that open in turn beside a live
 * appointment card. All state lives in `useBookingFlow`; this file lays it out
 * and handles scrolling between sections.
 */
export function Composer({
	slug,
	initialProduct,
	initialQuestions,
	initialQuestionsSlug,
	clinicians,
	clinicInfo,
	deepLink,
	onSwitchVariant,
	onBookAnother,
}: ComposerProps) {
	const flow = useBookingFlow({ slug, initialProduct, initialQuestions, initialQuestionsSlug, clinicians, deepLink });
	const { currency, timeFormat: rawTimeFormat } = useSettings();
	const timeFormat: '12H' | '24H' = rawTimeFormat === '24H' ? '24H' : '12H';
	const lenis = useSmoothScroll();
	const money = useCallback((n: number) => formatPrice(n, currency), [currency]);
	const [sheetOpen, setSheetOpen] = useState(false);
	// The visitor's timezone is guessed on the client; don't print it in SSR HTML.
	const hydrated = useHydrated();

	// --- scrolling: follow `reached`, but only after the patient has interacted.
	const sectionEls = useRef(new Map<SectionIndex, HTMLElement>());
	const interacted = useRef(false);
	const setSectionRef = useCallback(
		(i: SectionIndex) => (el: HTMLElement | null) => {
			if (el) sectionEls.current.set(i, el);
			else sectionEls.current.delete(i);
		},
		[],
	);
	const refs = useMemo(
		() => ({
			[SECTION.who]: setSectionRef(SECTION.who),
			[SECTION.seen]: setSectionRef(SECTION.seen),
			[SECTION.clinician]: setSectionRef(SECTION.clinician),
			[SECTION.time]: setSectionRef(SECTION.time),
			[SECTION.extras]: setSectionRef(SECTION.extras),
			[SECTION.notes]: setSectionRef(SECTION.notes),
		}),
		[setSectionRef],
	);

	const scrollTo = useCallback(
		(i: SectionIndex) => {
			const el = sectionEls.current.get(i);
			if (!el) return;
			if (lenis) lenis.scrollTo(el, { offset: -96, duration: 1.1 });
			else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		},
		[lenis],
	);

	useEffect(() => {
		if (!interacted.current) return;
		// Let the previous section fold before measuring.
		const t = window.setTimeout(() => scrollTo(flow.reached), 120);
		return () => window.clearTimeout(t);
	}, [flow.reached, scrollTo]);

	const markInteracted = useCallback(() => {
		interacted.current = true;
	}, []);

	// --- section states
	const complete: Record<SectionIndex, boolean> = {
		0: flow.visitFor !== null,
		1: flow.seenAnswered,
		2: flow.clinicianAnswered || !flow.hasStaff,
		3: flow.timeComplete,
		4: flow.extrasDone || flow.noAddOns,
		5: false,
	};
	const stateOf = (i: SectionIndex): SectionState => {
		if (i === flow.reached) return 'open';
		if (i < flow.reached) return complete[i] ? 'done' : 'open';
		return 'locked';
	};

	const firstIncomplete = (): SectionIndex => {
		if (!complete[0]) return SECTION.who;
		if (!complete[1]) return SECTION.seen;
		if (!complete[2]) return SECTION.clinician;
		if (!complete[3]) return SECTION.time;
		return SECTION.notes;
	};

	const onReserve = async () => {
		interacted.current = true;
		if (!flow.canReserve && !flow.booking && !flow.held) {
			const target = firstIncomplete();
			setSheetOpen(false);
			if (target !== flow.reached) flow.openSection(target);
			else scrollTo(target);
		}
		const ok = await flow.reserve();
		if (ok && window.matchMedia('(max-width: 1023px)').matches) setSheetOpen(true);
	};

	// Section numbering skips sections that aren't shown.
	const showClinician = flow.hasStaff;
	const showExtras = !flow.noAddOns;
	const order: SectionIndex[] = [SECTION.who, SECTION.seen, ...(showClinician ? [SECTION.clinician] : []), SECTION.time, ...(showExtras ? [SECTION.extras] : []), SECTION.notes];
	const num = (i: SectionIndex) => order.indexOf(i) + 1;

	if (!flow.activeVariant) {
		if (flow.loading) return <ComposerSkeleton />;
		return (
			<div className="container-x pb-24 pt-36 text-center">
				<h1 className="display-sm text-ink">We couldn’t find that visit</h1>
				<p className="mt-3 text-ink-muted">It may have been renamed. Browse our services to find the right one.</p>
			</div>
		);
	}

	const seenSummary = flow.video
		? 'Video visit · link emailed'
		: flow.selectedLocation
			? clinicName(clinicInfo[flow.selectedLocation.id]?.title ?? flow.selectedLocation.title ?? '')
			: null;
	const clinicianSummary = flow.selectedStaffId ? (flow.cliniciansById.get(flow.selectedStaffId)?.name ?? null) : 'First available';
	const slot = flow.selectedSlot;
	const timeLabel = slot ? formatSlotTime(slot.fromDate, slot.fromTime, flow.timezone, timeFormat) : null;
	const timeSummary = slot
		? `${formatShortDate(slotLocalDate(slot, flow.timezone))} · ${timeLabel}${!flow.selectedStaffId && flow.finalClinician ? ` with ${flow.finalClinician.name}` : ''}`
		: null;
	const extrasSummary = flow.selectedAddOns.size > 0 ? `${flow.selectedAddOns.size} added · +${money(flow.addOnsTotal)}` : 'No extras';
	const barStatus = slot ? `${formatShortDate(slotLocalDate(slot, flow.timezone))} · ${timeLabel}` : (seenSummary ?? null);
	const soonestDisabled = !flow.availableDates || flow.availableDates.size === 0;

	const card = (bare: boolean) => (
		<AppointmentCard
			flow={flow}
			currency={currency}
			timeFormat={timeFormat}
			clinicInfo={clinicInfo}
			onBookAnother={onBookAnother}
			onReserve={() => void onReserve()}
			bare={bare}
		/>
	);

	return (
		<div className="container-x pb-32 pt-28 sm:pt-32 lg:pb-24" onPointerDownCapture={markInteracted} onKeyDownCapture={markInteracted}>
			<BookingHeader
				department={flow.department}
				variant={flow.activeVariant}
				variants={flow.variants}
				currency={currency}
				switchDisabled={flow.held}
				onSwitchVariant={(next) =>
					onSwitchVariant(next, {
						visitFor: flow.visitFor,
						mode: flow.seenAnswered && !flow.held ? flow.mode : null,
						staff: flow.selectedStaffId ? (flow.cliniciansById.get(flow.selectedStaffId)?.slug ?? null) : null,
					})
				}
			/>

			<CareLine settled={flow.held} trigger="mount" className="mt-10 h-10" />

			<div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-12">
				<div className="min-w-0 lg:col-span-7 xl:col-span-7">
					{flow.held ? (
						<p className="mb-2 rounded-field bg-sage-soft px-4 py-3 text-[14px] text-sage-deep">
							This visit is held for you. To change anything, use “Change this visit” on the card.
						</p>
					) : null}
					<div inert={flow.held ? true : undefined} className={flow.held ? 'opacity-60' : undefined}>
						<BookSection
							ref={refs[SECTION.who]}
							id={SECTION_IDS[0]}
							index={num(SECTION.who)}
							title="Who is this visit for?"
							state={stateOf(SECTION.who)}
							summary={flow.visitFor ? VISIT_FOR_SHORT[flow.visitFor] : null}
							onEdit={() => flow.openSection(SECTION.who)}
						>
							<VisitForPicker value={flow.visitFor} onChange={flow.chooseVisitFor} pediatrics={flow.isPediatrics} />
							{flow.isPediatrics ? (
								<p className="mt-3 text-[14px] text-ink-muted">Pediatric visits are for children. A parent or guardian comes along.</p>
							) : null}
						</BookSection>

						<BookSection
							ref={refs[SECTION.seen]}
							id={SECTION_IDS[1]}
							index={num(SECTION.seen)}
							title="How you’ll be seen"
							state={stateOf(SECTION.seen)}
							summary={seenSummary}
							lockedHint="In clinic or by video"
							onEdit={() => flow.openSection(SECTION.seen)}
						>
							<SeenPicker
								clinics={flow.clinics.map((c) => ({ id: c.id, slug: c.slug, title: c.title ?? '' }))}
								clinicInfo={clinicInfo}
								videoAvailable={flow.videoAvailable}
								mode={flow.mode}
								selectedLocationId={flow.selectedLocationId}
								answered={flow.seenAnswered}
								onChoose={flow.chooseSeen}
							/>
						</BookSection>

						{showClinician ? (
							<BookSection
								ref={refs[SECTION.clinician]}
								id={SECTION_IDS[2]}
								index={num(SECTION.clinician)}
								title="Your clinician"
								state={stateOf(SECTION.clinician)}
								summary={clinicianSummary}
								lockedHint="Someone you know, or whoever is free first"
								onEdit={() => flow.openSection(SECTION.clinician)}
							>
								<ClinicianPicker
									candidates={flow.candidates}
									selectedId={flow.selectedStaffId}
									answered={flow.clinicianAnswered}
									video={flow.video}
									onChoose={flow.chooseClinician}
								/>
							</BookSection>
						) : null}

						<BookSection
							ref={refs[SECTION.time]}
							id={SECTION_IDS[3]}
							index={num(SECTION.time)}
							title="Day & time"
							state={stateOf(SECTION.time)}
							summary={timeSummary}
							lockedHint="Open days are shown once you’ve chosen where"
							onEdit={() => flow.openSection(SECTION.time)}
						>
							<div className="flex flex-wrap items-center justify-between gap-3">
								<p className="text-[14px] text-ink-muted">
									Times shown in your time zone{hydrated ? ` (${flow.timezone.replace(/_/g, ' ')})` : ''}.
								</p>
								<Button type="button" variant="outline" size="sm" onClick={flow.pickSoonest} disabled={soonestDisabled || flow.soonestPending}>
									{flow.soonestPending ? 'Finding…' : 'Soonest available'}
								</Button>
							</div>
							<div className="mt-5">
								<DayRibbon timezone={flow.timezone} selectedDate={flow.selectedDate} availableDates={flow.availableDates} onSelect={flow.selectDate} />
							</div>
							{flow.selectedDate ? (
								<div className="mt-6">
									<SlotGrid
										slots={flow.slots}
										loading={flow.slotsLoading}
										selectedSlot={flow.selectedSlot}
										timezone={flow.timezone}
										timeFormat={timeFormat}
										showFaces={flow.hasStaff && !flow.selectedStaffId}
										cliniciansById={flow.cliniciansById}
										onSelect={flow.selectTimeSlot}
									/>
								</div>
							) : null}
							{slot && timeLabel && !flow.selectedStaffId && flow.slotFaces.length > 1 ? (
								<div className="mt-6">
									<ClinicianConfirm timeLabel={timeLabel} faces={flow.slotFaces} confirmedId={flow.confirmedStaffId} onConfirm={flow.confirmStaff} />
								</div>
							) : null}
						</BookSection>

						{showExtras ? (
							<BookSection
								ref={refs[SECTION.extras]}
								id={SECTION_IDS[4]}
								index={num(SECTION.extras)}
								title="Add to your visit"
								state={stateOf(SECTION.extras)}
								summary={extrasSummary}
								lockedHint="Optional extras for this visit"
								onEdit={() => flow.openSection(SECTION.extras)}
							>
								<AddOnsPicker
									addOns={flow.availableAddOns}
									loading={flow.addOnsLoading}
									selected={flow.selectedAddOns}
									currency={currency}
									durationUnits={flow.bookedDurationUnits}
									onChange={flow.updateAddOnQuantity}
									onContinue={flow.continueFromExtras}
								/>
							</BookSection>
						) : null}

						<BookSection
							ref={refs[SECTION.notes]}
							id={SECTION_IDS[5]}
							index={num(SECTION.notes)}
							title="Pre-visit notes"
							state={stateOf(SECTION.notes)}
							lockedHint="A few questions for your clinician"
						>
							<PreVisitNotes
								questions={flow.noteQuestions}
								answers={flow.answers}
								visitFor={flow.visitFor ?? 'self'}
								errors={flow.fieldErrors}
								showErrors={flow.showErrors}
								uploads={flow.uploads}
								onChange={flow.setAnswer}
							/>
							<div className="mt-6 lg:hidden">
								<Button type="button" variant="primary" size="lg" fullWidth onClick={() => setSheetOpen(true)}>
									Review &amp; reserve
								</Button>
							</div>
						</BookSection>
					</div>
				</div>

				<aside className="hidden min-w-0 lg:col-span-5 lg:block xl:col-span-4 xl:col-start-9" aria-label="Your appointment">
					<div className="sticky top-28">{card(false)}</div>
				</aside>
			</div>

			<MobileCardBar total={flow.total} format={money} held={flow.held} status={barStatus} open={sheetOpen} onOpenChange={setSheetOpen}>
				{card(true)}
			</MobileCardBar>
		</div>
	);
}

export function ComposerSkeleton() {
	return (
		<div className="container-x pb-24 pt-10 sm:pt-14" aria-busy aria-label="Loading">
			<div className="h-4 w-32 animate-pulse rounded-full bg-cream" />
			<div className="mt-4 h-12 w-2/3 animate-pulse rounded-field bg-cream" />
			<div className="mt-4 h-4 w-1/2 animate-pulse rounded-full bg-cream" />
			<div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
				<div className="space-y-4 lg:col-span-7">
					{Array.from({ length: 4 }, (_, i) => (
						<div key={i} className="h-24 animate-pulse rounded-card bg-cream" />
					))}
				</div>
				<div className="hidden h-96 animate-pulse rounded-window bg-cream lg:col-span-4 lg:col-start-9 lg:block" />
			</div>
		</div>
	);
}
