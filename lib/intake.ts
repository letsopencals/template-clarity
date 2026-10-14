import type { CheckoutQuestionResponse } from '@opencals/storefront-sdk';

/*
 * Clinic intake semantics on top of the store's checkout questions.
 *
 * The seeded medical store attaches its pre-visit questions to products, and the
 * API exposes each question's stable `internalName`. This module maps those names
 * to what they MEAN for a clinic (who the visit is for, the patient's details,
 * the consent sign-off) so the booking composer, visit pass and My Care portal can
 * treat them specially. A question whose name isn't listed here is still rendered
 * as-is, and a store without these questions simply books for "Myself" — nothing
 * here is required for the template to work.
 */

export type IntakeKey =
	| 'visitFor'
	| 'patientName'
	| 'patientDob'
	| 'reason'
	| 'insurance'
	| 'firstVisit'
	| 'photo'
	| 'medications'
	| 'lastCleaning'
	| 'painArea'
	| 'focus'
	| 'telehealthConsent';

/** internalName (as seeded) → semantic key. Legacy names keep pre-reseed stores working. */
const BY_INTERNAL_NAME: Record<string, IntakeKey> = {
	'Visit for': 'visitFor',
	'Patient name': 'patientName',
	'Patient DOB': 'patientDob',
	'Pediatric patient name': 'patientName',
	'Pediatric date of birth': 'patientDob',
	'Reason for visit': 'reason',
	'Insurance provider': 'insurance',
	'First visit': 'firstVisit',
	'Dermatology photo': 'photo',
	'Cardiology medications': 'medications',
	'Dental last cleaning': 'lastCleaning',
	'Physiotherapy injury area': 'painArea',
	'Mental health focus': 'focus',
	'Telehealth consent': 'telehealthConsent',
};

export function intakeKey(q: Pick<CheckoutQuestionResponse, 'internalName'>): IntakeKey | null {
	return BY_INTERNAL_NAME[q.internalName?.trim()] ?? null;
}

/** The three answers of the "Visit for" dropdown, in the seeded wording. */
export type VisitFor = 'self' | 'child' | 'other';
export const VISIT_FOR_LABEL: Record<VisitFor, string> = {
	self: 'Myself',
	child: 'My child',
	other: 'Someone else',
};

/** Parse a stored "Visit for" answer (tolerant of casing / store wording). */
export function parseVisitFor(answer: string | null | undefined): VisitFor {
	const a = (answer ?? '').trim().toLowerCase();
	if (a.includes('child') || a.includes('son') || a.includes('daughter')) return 'child';
	if (a && a !== 'myself' && a !== 'me' && !a.startsWith('my self')) return 'other';
	return 'self';
}

/** Find the store's option string for a VisitFor value (falls back to our label). */
export function visitForOption(q: CheckoutQuestionResponse | undefined, v: VisitFor): string {
	const options = q?.translations?.[0]?.options ?? null;
	return options?.find((o) => parseVisitFor(o) === v) ?? VISIT_FOR_LABEL[v];
}

/** Answers keyed by question id — the composer's working state. */
export type AnswerMap = Record<string, string>;

/** Questions indexed by semantic key for one product. */
export function indexIntake(questions: CheckoutQuestionResponse[]): Partial<Record<IntakeKey, CheckoutQuestionResponse>> {
	const out: Partial<Record<IntakeKey, CheckoutQuestionResponse>> = {};
	for (const q of questions) {
		const k = intakeKey(q);
		if (k && !out[k]) out[k] = q;
	}
	return out;
}

/**
 * Patient fields only make sense when the visit isn't for the account holder.
 * Pediatric-only legacy questions (required on the backend) are always shown.
 */
export function isConditional(q: CheckoutQuestionResponse): boolean {
	const k = intakeKey(q);
	return (k === 'patientName' || k === 'patientDob') && !q.internalName.startsWith('Pediatric');
}

/** Whether a question should be shown given who the visit is for. */
export function isVisible(q: CheckoutQuestionResponse, visitFor: VisitFor): boolean {
	return !isConditional(q) || visitFor !== 'self';
}

/** Required in the UI: backend-required, or a patient field when booking for someone else. */
export function isRequiredFor(q: CheckoutQuestionResponse, visitFor: VisitFor): boolean {
	if (q.required) return true;
	return isConditional(q) && visitFor !== 'self';
}

/** Questions the composer handles in its own "Who is this visit for" section. */
export function isHandledByComposer(q: CheckoutQuestionResponse): boolean {
	const k = intakeKey(q);
	return k === 'visitFor';
}

/** Minimal shape of an answer as returned on an appointment detail. */
export interface StoredAnswer {
	questionId?: string | null;
	question?: string | null;
	answer?: string | null;
}

/** questionId → semantic key, built from the product's questions (detail answers carry no internalName). */
export type IntakeKeyMap = Record<string, IntakeKey>;
export function keyMapOf(questions: CheckoutQuestionResponse[]): IntakeKeyMap {
	const out: IntakeKeyMap = {};
	for (const q of questions) {
		const k = intakeKey(q);
		if (k) out[q.id] = k;
	}
	return out;
}

export interface Patient {
	visitFor: VisitFor;
	/** Display name: the patient's name, or null when the visit is for the account holder. */
	name: string | null;
	dob: string | null;
}

/** The answer's semantic key: by question id when a key map is known, else by the visible title. */
function storedKey(a: StoredAnswer, keys: IntakeKeyMap | undefined, titles: Partial<Record<IntakeKey, string>>): IntakeKey | null {
	if (keys && a.questionId && keys[a.questionId]) return keys[a.questionId]!;
	if (a.question) {
		for (const [k, t] of Object.entries(titles) as [IntakeKey, string][]) if (t === a.question) return k;
	}
	return null;
}

/** Default English titles (seeded) — used to recognise answers that only carry the question text. */
export const INTAKE_TITLES: Partial<Record<IntakeKey, string>> = {
	visitFor: 'Who is this visit for?',
	patientName: 'Patient’s full name',
	patientDob: 'Patient’s date of birth',
	telehealthConsent: 'I consent to a virtual (video/phone) consultation',
};

const LEGACY_TITLES: Partial<Record<IntakeKey, string>> = {
	patientName: 'Child’s full name',
	patientDob: 'Child’s date of birth',
};

/**
 * Who a stored visit was for, from its answers. Used by My Care's family chips
 * and the visit pass ("Mia's well-child visit").
 */
export function patientOf(answers: StoredAnswer[] | null | undefined, keys?: IntakeKeyMap): Patient {
	let visitFor: VisitFor | null = null;
	let name: string | null = null;
	let dob: string | null = null;
	let legacyChild = false;
	for (const a of answers ?? []) {
		const k = storedKey(a, keys, INTAKE_TITLES) ?? storedKey(a, undefined, LEGACY_TITLES);
		const value = (a.answer ?? '').trim();
		if (!k || !value) continue;
		if (k === 'visitFor') visitFor = parseVisitFor(value);
		if (k === 'patientName') {
			name = value;
			if (a.question === LEGACY_TITLES.patientName) legacyChild = true;
		}
		if (k === 'patientDob') dob = value;
	}
	const resolved: VisitFor = visitFor ?? (legacyChild ? 'child' : name ? 'other' : 'self');
	return { visitFor: resolved, name: resolved === 'self' ? null : name, dob: resolved === 'self' ? null : dob };
}

/** "Mia" from "Mia Rivera" — chips and greetings use first names. */
export function firstName(full: string | null | undefined): string {
	return (full ?? '').trim().split(/\s+/)[0] ?? '';
}

/** Serialise a checkbox question's value. Option checkboxes join with ", ". */
export const CHECKBOX_TRUE = 'true';
export const CHECKBOX_FALSE = 'false';
export function joinOptions(values: string[]): string {
	return values.join(', ');
}
export function splitOptions(answer: string | null | undefined): string[] {
	return (answer ?? '')
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
}

/** Display a stored answer value ("true" → "Yes"). */
export function displayAnswer(answer: string | null | undefined): string {
	if (answer === CHECKBOX_TRUE) return 'Yes';
	if (answer === CHECKBOX_FALSE) return 'No';
	return answer ?? '';
}

/** File-upload limits from a question's `fileConfig` (shape is untyped in the SDK). */
export interface UploadLimits {
	maxFiles: number;
	maxSizeBytes: number;
	accept: string;
}
export function uploadLimits(q: CheckoutQuestionResponse): UploadLimits {
	const cfg = (q.fileConfig ?? {}) as { maxFiles?: number; maxSizeBytes?: number; categories?: string[] };
	const cats = cfg.categories ?? ['images'];
	const accept = cats
		.map((c) => (c === 'images' ? 'image/jpeg,image/png,image/webp,image/heic,image/heif' : c === 'pdf' ? 'application/pdf' : c === 'video' ? 'video/mp4,video/quicktime,video/webm' : ''))
		.filter(Boolean)
		.join(',');
	return { maxFiles: cfg.maxFiles ?? 3, maxSizeBytes: cfg.maxSizeBytes ?? 10 * 1024 * 1024, accept: accept || 'image/*' };
}
