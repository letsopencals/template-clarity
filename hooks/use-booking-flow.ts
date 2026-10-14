'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSWRConfig } from 'swr';
import type {
	CheckoutQuestionResponse,
	CurrentAvailabilitySlot,
	ProductListItemResponse,
	ProductListVariant,
} from '@opencals/storefront-sdk';
import { useCart } from '@/contexts/cart-context';
import { useLocation } from '@/contexts/location-context';
import { useTimezone } from '@/contexts/timezone-context';
import { useProductData } from '@/hooks/use-product-data';
import { useAvailability } from '@/hooks/use-availability';
import { useBookingAddOns } from '@/hooks/use-booking-add-ons';
import { questionTitle, useCheckoutQuestions } from '@/hooks/use-checkout-questions';
import { doneFileIds, doneFilenames, useFileUploads } from '@/hooks/use-file-uploads';
import {
	CHECKBOX_FALSE,
	indexIntake,
	intakeKey,
	isHandledByComposer,
	isRequiredFor,
	isVisible,
	visitForOption,
	type AnswerMap,
	type VisitFor,
} from '@/lib/intake';
import { siteConfig } from '@/lib/site-config';
import type { PublicClinician } from '@/lib/clinicians';

export type VisitMode = 'clinic' | 'video';

/** Values pre-filled from the URL (`?for=self|child|other&mode=clinic|video&staff=<slug>`). */
export interface BookingDeepLink {
	visitFor?: VisitFor | null;
	mode?: VisitMode | null;
	staff?: string | null;
}

/** Composer sections, in order. */
export const SECTION = { who: 0, seen: 1, clinician: 2, time: 3, extras: 4, notes: 5 } as const;
export type SectionIndex = (typeof SECTION)[keyof typeof SECTION];

/** One answer as sent to `/api/book` (and stored on the appointment). */
export interface BookAnswer {
	questionId: string;
	question: string;
	answer: string;
	fileIds?: string[];
}

export interface BookError {
	message: string;
	code: 'slot_unavailable' | 'files_not_saved' | 'other';
}

interface UseBookingFlowOptions {
	slug: string;
	initialProduct: ProductListItemResponse | null;
	/** Server-rendered questions for `initialQuestionsSlug`. */
	initialQuestions?: CheckoutQuestionResponse[];
	initialQuestionsSlug?: string | null;
	/** Public clinician cards for this product's staff (curated titles, clinics, video). */
	clinicians: PublicClinician[];
	deepLink?: BookingDeepLink;
}

type Variant = ProductListVariant;
type Location = NonNullable<Variant['locations']>[number];

/** The variant's department: its first collection that has curated content. */
function departmentOf(variant: Variant | null): string | null {
	const slugs = (variant?.collections ?? []).map((c) => c.slug).filter(Boolean) as string[];
	return slugs.find((s) => s in siteConfig.departments) ?? slugs[0] ?? null;
}

/** A clinician can be seen at this place: video → offers video; clinic → works there (no list = everywhere). */
function seesAt(c: PublicClinician, video: boolean, locationId: string | null): boolean {
	if (video) return c.video;
	if (!locationId || c.clinics.length === 0) return true;
	return c.clinics.some((l) => l.id === locationId);
}

/** Which clinic, in priority: explicit choice → saved clinic (if the clinician works there) → the clinician's clinic → saved → first. */
function resolveClinic(clinics: Location[], chosenId: string | null, globalId: string | null, clinician: PublicClinician | null): string | null {
	const ids = new Set(clinics.map((l) => l.id));
	if (chosenId && ids.has(chosenId)) return chosenId;
	const theirs = clinician?.clinics.map((l) => l.id).filter((id) => ids.has(id)) ?? null;
	if (globalId && ids.has(globalId) && (!theirs || theirs.length === 0 || theirs.includes(globalId))) return globalId;
	if (theirs?.length) return theirs[0]!;
	if (globalId && ids.has(globalId)) return globalId;
	return clinics[0]?.id ?? null;
}

/** MM/DD/YYYY, a real date, not in the future, not before 1900. */
export function isValidDob(value: string): boolean {
	const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
	if (!m) return false;
	const [month, day, year] = [Number(m[1]), Number(m[2]), Number(m[3])];
	const d = new Date(Date.UTC(year, month - 1, day));
	if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) return false;
	return year >= 1900 && d.getTime() <= Date.now();
}

/**
 * Thin orchestrator for the clinic composer. Composes the product,
 * availability, add-on, question and upload hooks; owns the patient's choices,
 * the section reached, and the hold in the cart. Selections are derived where
 * possible (clinic, the concrete clinician), so changing one never needs an
 * effect to repair another.
 */
export function useBookingFlow({ slug, initialProduct, initialQuestions, initialQuestionsSlug, clinicians, deepLink = {} }: UseBookingFlowOptions) {
	const { cartId, setCart, removeItem, timeRemaining } = useCart();
	const { selectedLocationId: globalLocationId } = useLocation();
	const { timezone } = useTimezone();
	const { mutate } = useSWRConfig();

	const productData = useProductData(slug, initialProduct);
	const { product, activeVariant, variants, hasVariants } = productData;

	const department = departmentOf(activeVariant);
	const isPediatrics = department === 'pediatrics';

	// ------------------------------------------------------------ Where
	const allLocations = useMemo(() => activeVariant?.locations ?? [], [activeVariant]);
	const clinics = useMemo(() => allLocations.filter((l) => l.type !== 'online'), [allLocations]);
	const online = allLocations.find((l) => l.type === 'online') ?? null;
	const videoAvailable = !!online;

	// ------------------------------------------------------------ Who sees you
	const byId = useMemo(() => new Map(clinicians.map((c) => [c.id, c])), [clinicians]);
	const variantStaffIds = useMemo(() => new Set((activeVariant?.staffMembers ?? []).map((s) => s.id)), [activeVariant]);
	const variantClinicians = useMemo(() => clinicians.filter((c) => variantStaffIds.has(c.id)), [clinicians, variantStaffIds]);
	const hasStaff = variantStaffIds.size > 0;

	const deepClinician = deepLink.staff ? (variantClinicians.find((c) => c.slug === deepLink.staff) ?? null) : null;
	const deepMode: VisitMode | null =
		deepLink.mode === 'video' && videoAvailable ? 'video' : deepLink.mode === 'clinic' && clinics.length > 0 ? 'clinic' : null;

	const [visitFor, setVisitFor] = useState<VisitFor | null>(() => {
		if (isPediatrics) return deepLink.visitFor === 'other' ? 'other' : 'child';
		return deepLink.visitFor ?? null;
	});
	const [chosenMode, setChosenMode] = useState<VisitMode | null>(() => {
		if (deepMode) return deepMode;
		if (deepClinician && clinics.length > 0 && !deepClinician.video) return 'clinic';
		return null;
	});
	const [chosenClinicId, setChosenClinicId] = useState<string | null>(null);
	/** null = "First available". */
	const [chosenStaffId, setChosenStaffId] = useState<string | null>(deepClinician?.id ?? null);
	const [clinicianAnswered, setClinicianAnswered] = useState(!!deepClinician);
	/** In "First available" mode: the face picked for the chosen time. */
	const [confirmedStaffId, setConfirmedStaffId] = useState<string | null>(null);

	const onlyOnePlace = clinics.length + (videoAvailable ? 1 : 0) <= 1;
	const seenAnswered = chosenMode !== null || onlyOnePlace;
	const mode: VisitMode = chosenMode ?? (clinics.length > 0 ? 'clinic' : videoAvailable ? 'video' : 'clinic');
	const video = mode === 'video' && videoAvailable;

	const chosenClinician = chosenStaffId ? (byId.get(chosenStaffId) ?? null) : null;
	const selectedLocationId = video ? online!.id : resolveClinic(clinics, chosenClinicId, globalLocationId, chosenClinician);
	const selectedLocation = allLocations.find((l) => l.id === selectedLocationId) ?? null;

	const candidates = useMemo(
		() => variantClinicians.filter((c) => seesAt(c, video, selectedLocationId)),
		[variantClinicians, video, selectedLocationId],
	);
	const selectedStaffId = candidates.some((c) => c.id === chosenStaffId) ? chosenStaffId : null;

	// ------------------------------------------------------------ When
	const availability = useAvailability({ activeVariant, timezone, staffMemberId: selectedStaffId, locationId: selectedLocationId });
	const { selectedSlot, slots, slotsLoading, availableDates } = availability;

	// "First available": who is free at the chosen time. One face → chosen for you.
	const slotFaces = useMemo(() => {
		if (!selectedSlot) return [];
		return (selectedSlot.staffMemberIds ?? []).map((id) => byId.get(id)).filter((c): c is PublicClinician => !!c);
	}, [selectedSlot, byId]);
	const confirmedValid = confirmedStaffId && slotFaces.some((c) => c.id === confirmedStaffId) ? confirmedStaffId : null;
	const autoConfirmed = slotFaces.length === 1 ? slotFaces[0]!.id : null;
	// A slot whose free staff aren't on our list still books (same fallback as before).
	const unlistedFallback = selectedSlot && slotFaces.length === 0 ? (selectedSlot.staffMemberIds?.[0] ?? null) : null;
	const finalStaffId = selectedStaffId ?? confirmedValid ?? autoConfirmed ?? unlistedFallback;
	const finalClinician = finalStaffId ? (byId.get(finalStaffId) ?? null) : null;
	const needsStaffConfirm = hasStaff && !selectedStaffId && !!selectedSlot && slotFaces.length > 1 && !confirmedValid;
	const timeComplete = !!selectedSlot && !needsStaffConfirm;

	// Duration units for add-on pricing (durationMultiplied add-ons: price × units).
	const bookedDurationUnits = useMemo(() => {
		const base = activeVariant?.duration ?? product?.duration;
		if (!base || !selectedSlot) return 1;
		const from = new Date(`${selectedSlot.fromDate}T${selectedSlot.fromTime}Z`);
		const to = new Date(`${selectedSlot.toDate}T${selectedSlot.toTime}Z`);
		return Math.max(1, Math.ceil((to.getTime() - from.getTime()) / 1000 / base));
	}, [activeVariant?.duration, product?.duration, selectedSlot]);

	const addOns = useBookingAddOns({ activeVariant, locationId: selectedLocationId, staffMemberId: finalStaffId, bookedDurationUnits });
	const noAddOns = !addOns.addOnsLoading && addOns.availableAddOns.length === 0;
	const [extrasDone, setExtrasDone] = useState(false);

	const basePrice = activeVariant?.price ?? product?.price ?? 0;
	const total = basePrice + addOns.addOnsTotal;

	// ------------------------------------------------------------ Notes
	const questionsFallback = activeVariant && activeVariant.slug === initialQuestionsSlug ? initialQuestions : undefined;
	const questions = useCheckoutQuestions(activeVariant?.slug ?? null, questionsFallback);
	const intake = useMemo(() => indexIntake(questions), [questions]);
	const visitForQuestion = intake.visitFor ?? null;
	const effectiveVisitFor: VisitFor = visitFor ?? 'self';

	const noteQuestions = useMemo(
		() =>
			questions
				.filter((q) => !isHandledByComposer(q) && isVisible(q, effectiveVisitFor))
				// Telehealth consent only matters for video (unless the store requires it).
				.filter((q) => intakeKey(q) !== 'telehealthConsent' || video || q.required)
				.sort((a, b) => a.order - b.order),
		[questions, effectiveVisitFor, video],
	);

	const [answers, setAnswers] = useState<AnswerMap>({});
	const uploads = useFileUploads();
	const [showErrors, setShowErrors] = useState(false);

	const isAnswered = useCallback(
		(q: CheckoutQuestionResponse): boolean => {
			if (q.type === 'file-upload') return doneFileIds(uploads.uploads[q.id]).length > 0;
			const v = answers[q.id] ?? '';
			if (q.type === 'checkbox') return v !== '' && v !== CHECKBOX_FALSE;
			return v.trim() !== '';
		},
		[answers, uploads.uploads],
	);

	const fieldErrors = useMemo(() => {
		const out: Record<string, string> = {};
		for (const q of noteQuestions) {
			const required = isRequiredFor(q, effectiveVisitFor);
			const v = (answers[q.id] ?? '').trim();
			if (intakeKey(q) === 'patientDob' && v && !isValidDob(v)) out[q.id] = 'Please use MM/DD/YYYY, for example 04/23/2019.';
			else if (required && !isAnswered(q)) {
				out[q.id] =
					q.type === 'file-upload'
						? 'Please add a photo so your clinician can look beforehand.'
						: q.type === 'checkbox'
							? 'Please confirm this to continue.'
							: 'Please fill this in.';
			}
		}
		return out;
	}, [noteQuestions, effectiveVisitFor, answers, isAnswered]);

	// ------------------------------------------------------------ Sections
	const [reached, setReached] = useState<SectionIndex>(() => {
		if (!visitFor) return SECTION.who;
		if (!(deepMode || chosenMode || onlyOnePlace)) return SECTION.seen;
		if (hasStaff && !deepClinician) return SECTION.clinician;
		return SECTION.time;
	});
	/** The add-ons section folds away once we know there are none. */
	const effectiveReached: SectionIndex = reached === SECTION.extras && noAddOns ? SECTION.notes : reached;

	/** The next section that still needs an answer after `from` (given overrides from the current handler). */
	const nextOpen = useCallback(
		(from: SectionIndex, o: { seen?: boolean; clinician?: boolean; time?: boolean; extras?: boolean } = {}): SectionIndex => {
			const seen = o.seen ?? seenAnswered;
			const clin = o.clinician ?? (clinicianAnswered || !hasStaff);
			const time = o.time ?? timeComplete;
			const extras = o.extras ?? (extrasDone || noAddOns);
			if (from < SECTION.seen && !seen) return SECTION.seen;
			if (from < SECTION.clinician && !clin) return SECTION.clinician;
			if (from < SECTION.time && !time) return SECTION.time;
			if (from < SECTION.extras && !extras) return SECTION.extras;
			return SECTION.notes;
		},
		[seenAnswered, clinicianAnswered, hasStaff, timeComplete, extrasDone, noAddOns],
	);

	// ------------------------------------------------------------ Hold
	const [held, setHeld] = useState<{ itemId: string | null } | null>(null);
	/** Item left in the cart by a half-failed attempt (files didn't attach); replaced on retry. */
	const [pendingItemId, setPendingItemId] = useState<string | null>(null);
	/** Files already linked to an earlier hold must be uploaded again. */
	const [filesUsed, setFilesUsed] = useState(false);
	const [booking, setBooking] = useState(false);
	const [error, setError] = useState<BookError | null>(null);

	// ------------------------------------------------------------ Handlers
	const { setSelectedDate, selectSlot, resetSlot } = availability;

	const openSection = useCallback((index: SectionIndex) => setReached(index), []);

	const chooseVisitFor = useCallback(
		(v: VisitFor) => {
			setVisitFor(v);
			setError(null);
			setReached((r) => (r === SECTION.who ? nextOpen(SECTION.who) : r));
		},
		[nextOpen],
	);

	const chooseSeen = useCallback(
		(nextMode: VisitMode, clinicId: string | null) => {
			setChosenMode(nextMode);
			setChosenClinicId(clinicId);
			resetSlot();
			setConfirmedStaffId(null);
			setError(null);
			// Keep a named clinician only if they can see you there.
			let clinicianStill = clinicianAnswered || !hasStaff;
			if (chosenClinician && !seesAt(chosenClinician, nextMode === 'video', nextMode === 'video' ? (online?.id ?? null) : clinicId)) {
				setChosenStaffId(null);
				setClinicianAnswered(false);
				clinicianStill = !hasStaff;
			}
			setReached(nextOpen(SECTION.seen, { seen: true, clinician: clinicianStill, time: false }));
		},
		[resetSlot, clinicianAnswered, hasStaff, chosenClinician, online, nextOpen],
	);

	const chooseClinician = useCallback(
		(id: string | null) => {
			setChosenStaffId(id);
			setClinicianAnswered(true);
			resetSlot();
			setConfirmedStaffId(null);
			setError(null);
			setReached(SECTION.time);
		},
		[resetSlot],
	);

	// "Soonest": jump to the first open day, then take its first time once loaded.
	const [soonestPending, setSoonestPending] = useState(false);

	const selectDate = useCallback(
		(date: string | null) => {
			setSelectedDate(date);
			setConfirmedStaffId(null);
			setSoonestPending(false);
			setError(null);
		},
		[setSelectedDate],
	);

	const selectTimeSlot = useCallback(
		(slot: CurrentAvailabilitySlot) => {
			selectSlot(slot);
			setConfirmedStaffId(null);
			setError(null);
			const faces = (slot.staffMemberIds ?? []).filter((id) => byId.has(id));
			if (selectedStaffId || !hasStaff || faces.length <= 1) setReached(nextOpen(SECTION.time, { time: true }));
		},
		[selectSlot, byId, selectedStaffId, hasStaff, nextOpen],
	);

	const pickSoonest = useCallback(() => {
		const first = availableDates ? [...availableDates].sort()[0] : null;
		if (!first) return;
		setSelectedDate(first);
		setConfirmedStaffId(null);
		setSoonestPending(true);
	}, [availableDates, setSelectedDate]);

	useEffect(() => {
		if (!soonestPending || slotsLoading || !availability.selectedDate) return;
		setSoonestPending(false);
		if (slots[0]) selectTimeSlot(slots[0]);
	}, [soonestPending, slotsLoading, slots, availability.selectedDate, selectTimeSlot]);

	const confirmStaff = useCallback(
		(id: string) => {
			setConfirmedStaffId(id);
			setReached(nextOpen(SECTION.time, { time: true }));
		},
		[nextOpen],
	);

	const continueFromExtras = useCallback(() => {
		setExtrasDone(true);
		setReached(SECTION.notes);
	}, []);

	const setAnswer = useCallback((questionId: string, value: string) => {
		setAnswers((prev) => (prev[questionId] === value ? prev : { ...prev, [questionId]: value }));
	}, []);

	const updateAddOnQuantity = addOns.updateQuantity;

	// ------------------------------------------------------------ Missing
	const missing: string[] = [];
	if (!activeVariant) missing.push('a service');
	if (!visitFor) missing.push('who the visit is for');
	if (!seenAnswered) missing.push('how you’ll be seen');
	if (hasStaff && !clinicianAnswered) missing.push('a clinician');
	if (!availability.selectedDate) missing.push('a day');
	else if (!selectedSlot) missing.push('a time');
	else if (needsStaffConfirm) missing.push('who will see you');
	const notesIncomplete = Object.keys(fieldErrors).length > 0;
	if (notesIncomplete) missing.push('your pre-visit notes');
	if (uploads.busy) missing.push('your photos to finish uploading');
	const canReserve = missing.length === 0 && !booking && !held;

	// ------------------------------------------------------------ Payload
	const buildAnswers = useCallback(
		(fresh: Record<string, string[]> | null): BookAnswer[] => {
			const out: BookAnswer[] = [];
			if (visitForQuestion && visitFor) {
				out.push({ questionId: visitForQuestion.id, question: questionTitle(visitForQuestion), answer: visitForOption(visitForQuestion, visitFor) });
			}
			for (const q of noteQuestions) {
				const question = questionTitle(q);
				if (q.type === 'file-upload') {
					const list = uploads.uploads[q.id];
					const fileIds = fresh ? (fresh[q.id] ?? []) : doneFileIds(list);
					if (fileIds.length > 0) out.push({ questionId: q.id, question, answer: doneFilenames(list).join(', '), fileIds });
					continue;
				}
				const raw = answers[q.id];
				if (raw === undefined) continue;
				if (q.type === 'checkbox') {
					out.push({ questionId: q.id, question, answer: raw === '' ? CHECKBOX_FALSE : raw });
					continue;
				}
				const value = raw.trim();
				if (value) out.push({ questionId: q.id, question, answer: value });
			}
			return out;
		},
		[visitForQuestion, visitFor, noteQuestions, uploads.uploads, answers],
	);

	const reserve = useCallback(async (): Promise<boolean> => {
		setShowErrors(true);
		if (!activeVariant || !selectedSlot || missing.length > 0 || booking || held) return false;

		setBooking(true);
		setError(null);
		try {
			const fresh = filesUsed ? await uploads.reuploadAll() : null;
			const headers: Record<string, string> = { 'Content-Type': 'application/json' };
			if (cartId) headers['X-Cart-Id'] = cartId;
			const slot = selectedSlot;
			const res = await fetch('/api/book', {
				method: 'POST',
				headers,
				body: JSON.stringify({
					slot: {
						productId: activeVariant.id,
						fromDate: slot.fromDate,
						fromTime: slot.fromTime,
						toDate: slot.toDate,
						toTime: slot.toTime,
						staffMemberId: finalStaffId ?? slot.staffMemberIds?.[0] ?? null,
						locationId: selectedLocationId ?? slot.locationIds?.[0] ?? null,
					},
					numberOfAttendees: 1,
					addOns: Array.from(addOns.selectedAddOns.entries()).map(([addOnId, quantity]) => {
						const addOn = addOns.availableAddOns.find((a) => a.id === addOnId);
						return addOn?.durationMultiplied ? { addOnId } : { addOnId, quantity };
					}),
					checkoutQuestionAnswers: buildAnswers(fresh),
					replaceItemId: pendingItemId,
				}),
			});
			const data = (await res.json().catch(() => null)) as {
				cart?: Parameters<typeof setCart>[0];
				itemId?: string | null;
				error?: string;
				code?: string;
			} | null;

			if (!res.ok) {
				if (data?.cart) setCart(data.cart);
				if (data?.itemId) {
					setPendingItemId(data.itemId);
					setFilesUsed(true);
				}
				const code = data?.code === 'slot_unavailable' || data?.code === 'files_not_saved' ? data.code : 'other';
				if (code === 'slot_unavailable') {
					// Refresh the times so the taken one disappears.
					void mutate((key) => typeof key === 'string' && key.includes('/availability'));
				}
				setError({ message: data?.error || 'We couldn’t hold that time. Please try again.', code });
				return false;
			}

			if (data?.cart) setCart(data.cart);
			setHeld({ itemId: data?.itemId ?? null });
			setPendingItemId(null);
			setFilesUsed(true);
			return true;
		} catch {
			setError({ message: 'We couldn’t reach the clinic just now. Please try again.', code: 'other' });
			return false;
		} finally {
			setBooking(false);
		}
	}, [activeVariant, selectedSlot, missing.length, booking, held, filesUsed, uploads, cartId, finalStaffId, selectedLocationId, addOns, buildAnswers, pendingItemId, setCart, mutate]);

	/** Release the hold and reopen the composer with every choice intact. */
	const [releasing, setReleasing] = useState(false);
	const changeVisit = useCallback(async () => {
		if (!held) return;
		setReleasing(true);
		try {
			if (held.itemId) await removeItem(held.itemId).catch(() => undefined);
		} finally {
			setHeld(null);
			setReleasing(false);
		}
	}, [held, removeItem]);

	/** After a lapsed hold: back to the composer; the next Reserve replaces the old item. */
	const holdAgain = useCallback(() => {
		if (!held) return;
		setPendingItemId(held.itemId);
		setHeld(null);
	}, [held]);

	/** From the "slot taken" notice: clear the time and go back to choosing one. */
	const chooseAnotherTime = useCallback(() => {
		resetSlot();
		setConfirmedStaffId(null);
		setError(null);
		setReached(SECTION.time);
	}, [resetSlot]);

	const lapsed = !!held && timeRemaining === 0;

	return {
		// Product
		product,
		activeVariant,
		variants,
		hasVariants,
		department,
		isPediatrics,
		loading: productData.loading,
		productError: productData.error,

		// Who
		visitFor,
		chooseVisitFor,
		visitForQuestion,

		// Where
		clinics,
		online,
		videoAvailable,
		mode,
		video,
		seenAnswered,
		chooseSeen,
		selectedLocationId,
		selectedLocation,

		// Clinician
		hasStaff,
		candidates,
		selectedStaffId,
		clinicianAnswered,
		chooseClinician,
		slotFaces,
		confirmedStaffId: confirmedValid ?? autoConfirmed,
		confirmStaff,
		finalStaffId,
		finalClinician,
		needsStaffConfirm,
		cliniciansById: byId,

		// Day & time
		selectedDate: availability.selectedDate,
		selectDate,
		availableDates,
		slots,
		slotsLoading,
		selectedSlot,
		selectTimeSlot,
		pickSoonest,
		soonestPending,
		timeComplete,
		timezone,

		// Extras
		availableAddOns: addOns.availableAddOns,
		addOnsLoading: addOns.addOnsLoading,
		selectedAddOns: addOns.selectedAddOns,
		addOnsTotal: addOns.addOnsTotal,
		updateAddOnQuantity,
		bookedDurationUnits,
		noAddOns,
		extrasDone,
		continueFromExtras,

		// Notes
		questions,
		noteQuestions,
		answers,
		setAnswer,
		uploads,
		fieldErrors,
		showErrors,

		// Totals
		basePrice,
		total,

		// Sections
		reached: effectiveReached,
		openSection,

		// Hold
		missing,
		canReserve,
		booking,
		reserve,
		held: !!held,
		heldItemId: held?.itemId ?? null,
		lapsed,
		timeRemaining,
		changeVisit,
		releasing,
		holdAgain,
		error,
		chooseAnotherTime,
	};
}

export type BookingFlow = ReturnType<typeof useBookingFlow>;
