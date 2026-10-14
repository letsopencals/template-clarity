/**
 * Site configuration — the curated copy and clinic knowledge that has no API
 * equivalent. Edit this file to rebrand the template.
 *
 * Everything live (services, prices, durations, clinicians, clinics, opening
 * hours, availability) comes from the Opencals API. This file only adds what a
 * booking API can't know: how patients describe their needs (Care Finder), how
 * to prepare for each kind of visit, recall intervals, clinician bios and the
 * editorial copy. Every map is keyed by an API slug and every entry is optional —
 * a department, service or clinician without an entry still renders from the API.
 */

type DepartmentSlug =
	| 'general-medicine'
	| 'cardiology'
	| 'dermatology'
	| 'pediatrics'
	| 'physiotherapy'
	| 'dental-care'
	| 'nutrition'
	| 'mental-health'
	| 'labs-vaccinations';

export interface CareNeed {
	id: string;
	/** Chip label, in the patient's words. */
	label: string;
	/** One line shown when the chip is chosen. */
	hint: string;
	icon: string;
	/** Recommended product (variant) slugs, best first. */
	services: string[];
	/** Free-text words that should surface this need. */
	keywords: string[];
	/** Pre-select "My child" when chosen. */
	forChild?: boolean;
}

export interface DepartmentContent {
	/** Short display name used in nav and chips. */
	short: string;
	heroImage: string;
	icon: string;
	tagline: string;
	intro: string;
	treats: string[];
	faqs: { q: string; a: string }[];
}

export interface Prep {
	/** "What to bring" checklist (ticked off in My Care, saved locally). */
	bring: string[];
	/** One tip shown on the live appointment card. */
	tip: string;
	/** Arrive this many minutes before (in-clinic visits). */
	arriveEarly: number;
}

export interface Recall {
	/** Services that count as "done" for this recall. */
	services: string[];
	months: number;
	label: string;
	/** Service to book when due. */
	book: string;
}

export interface ClinicianProfile {
	title: string;
	bio: string;
	languages?: string[];
	focus?: string[];
}

export const siteConfig = {
	name: 'Clear Care Medical',
	shortName: 'Clear Care',
	tagline: 'Care that has time for you.',
	description:
		'Clear Care Medical — an unhurried private practice with three clinics and video visits. Find the right care, book in a minute, see us in clinic or by video, and keep your whole family’s care record in one place.',
	url: 'https://example.com',
	founded: 2013,

	/** Logo renders as {text} + italic {accent} with the CC seal. */
	logo: { text: 'Clear Care', accent: 'Medical', monogram: 'CC' },

	/** Shown on every booking surface and in the footer. Not a diagnosis tool. */
	emergency: {
		short: 'In an emergency, call 911.',
		long: 'Chest pain, trouble breathing, signs of stroke or severe bleeding? Call 911 or go to your nearest emergency room. Clear Care is for planned and same-week care.',
		phone: '911',
	},

	contact: {
		phone: '+1 (617) 555-0160',
		phoneHref: 'tel:+16175550160',
		email: 'hello@clarityhealth.com',
		/** Head office — JSON-LD and the contact page. Clinic addresses come from the API. */
		address: { street: '500 Commonwealth Ave', locality: 'Boston', region: 'MA', postalCode: '02215', country: 'US' },
		/** Nurse line — shown in My Care and on the visit pass. */
		nurseLine: '+1 (617) 555-0161',
		/**
		 * Clinic opening hours (mirrors the seeded schedule), parsed by
		 * `lib/opening-hours.ts` for the "Open now · closes 17:00" chips and the
		 * contact timetable. Each clinic reads them in its own timezone.
		 */
		hours: 'Mon — Fri: 8:00 AM — 5:00 PM\nSat: 9:00 AM — 1:00 PM',
	},

	/** Home — hero */
	hero: {
		eyebrow: 'Private practice · Three clinics & video · Since 2013',
		/** Rendered as: {lead} <em>{accent}</em> */
		lead: 'Care that has',
		accent: 'time for you.',
		body: 'Unhurried visits with doctors who listen — in one of our three clinics, or by video from your sofa. Tell us what’s going on and we’ll find the right person.',
		image: 'hero/hero-portrait.jpg',
		imageAlt: 'A Clear Care clinician welcoming a patient in a sunlit consultation room',
		finderPrompt: 'How can we help today?',
		searchPlaceholder: 'Describe it in your words — “sore knee”, “mole check”, “flu shot”…',
		proof: [
			{ value: 4.9, decimals: 1, label: 'average rating', suffix: '' },
			{ value: 30, decimals: 0, label: 'patients cared for', suffix: 'k+' },
			{ value: 30, decimals: 0, label: 'minute standard visit', suffix: '' },
		],
	},

	/**
	 * Care Finder — the front door. Patients choose a need in their own words
	 * (or type one); we recommend 1–3 services. Not triage, never a diagnosis.
	 */
	careFinder: {
		eyebrow: 'Find care',
		title: 'Tell us what’s going on.',
		lead: 'Three quick questions and we’ll suggest the right visit, the right clinician and the next free time. It isn’t a diagnosis — it just gets you to the right room.',
		whoPrompt: 'Who is the visit for?',
		needPrompt: 'What’s going on?',
		modePrompt: 'How would you like to be seen?',
		noMatch: 'Not sure? A standard consultation with one of our doctors is always the right place to start.',
		fallbackService: 'general-consult-standard',
		needs: [
			{
				id: 'unwell',
				label: 'I feel unwell',
				hint: 'Coughs, fevers, infections, anything new that’s worrying you.',
				icon: 'stethoscope',
				services: ['general-consult-standard', 'general-consult-extended'],
				keywords: ['sick', 'unwell', 'ill', 'cough', 'cold', 'flu', 'fever', 'sore throat', 'infection', 'headache', 'tired', 'stomach', 'pain', 'rash', 'prescription', 'refill'],
			},
			{
				id: 'checkup',
				label: 'A check-up',
				hint: 'An annual physical or a fuller screening — catch things early.',
				icon: 'clipboard',
				services: ['preventive-annual', 'preventive-screening', 'lab-comprehensive-panel'],
				keywords: ['check-up', 'checkup', 'physical', 'annual', 'screening', 'preventive', 'bloods', 'cholesterol'],
			},
			{
				id: 'child',
				label: 'My child',
				hint: 'Well-child visits, sick visits and jabs, from newborn to teen.',
				icon: 'child',
				services: ['pediatrics-sick-visit', 'pediatrics-well-child', 'vaccination-child'],
				keywords: ['child', 'kid', 'baby', 'son', 'daughter', 'toddler', 'teen', 'pediatric', 'paediatric'],
				forChild: true,
			},
			{
				id: 'heart',
				label: 'Heart & blood pressure',
				hint: 'Palpitations, blood pressure, an ECG or a follow-up.',
				icon: 'heart',
				services: ['cardiology-consultation', 'cardiology-followup', 'cardiology-echocardiogram'],
				keywords: ['heart', 'blood pressure', 'bp', 'palpitations', 'ecg', 'echo', 'cardio', 'cholesterol'],
			},
			{
				id: 'skin',
				label: 'Skin',
				hint: 'A mole that’s changed, a rash, acne or eczema.',
				icon: 'skin',
				services: ['dermatology-skin-check', 'dermatology-consultation', 'dermatology-cosmetic'],
				keywords: ['skin', 'mole', 'rash', 'acne', 'eczema', 'psoriasis', 'spot', 'derm'],
			},
			{
				id: 'mind',
				label: 'Mind & mood',
				hint: 'Stress, anxiety, low mood — a calm space to talk.',
				icon: 'brain',
				services: ['therapy-individual', 'therapy-group'],
				keywords: ['anxiety', 'stress', 'mood', 'depression', 'therapy', 'therapist', 'talk', 'sleep', 'burnout', 'grief'],
			},
			{
				id: 'teeth',
				label: 'Teeth',
				hint: 'A check-up and clean, a filling, or whitening.',
				icon: 'tooth',
				services: ['dental-checkup', 'dental-filling', 'dental-whitening'],
				keywords: ['tooth', 'teeth', 'dental', 'dentist', 'filling', 'cavity', 'clean', 'whitening', 'gum'],
			},
			{
				id: 'movement',
				label: 'Pain & movement',
				hint: 'Back, knee, shoulder or sports injuries — hands-on physio.',
				icon: 'activity',
				services: ['physiotherapy-assessment', 'physiotherapy-treatment', 'physiotherapy-group-class'],
				keywords: ['back', 'knee', 'shoulder', 'neck', 'injury', 'sprain', 'physio', 'sports', 'hip', 'ankle', 'posture', 'rehab'],
			},
			{
				id: 'food',
				label: 'Food & weight',
				hint: 'A dietitian-led plan for energy, weight or a condition.',
				icon: 'apple',
				services: ['nutrition-assessment', 'nutrition-followup', 'nutrition-workshop'],
				keywords: ['diet', 'weight', 'nutrition', 'food', 'dietitian', 'eating', 'diabetes', 'gut', 'ibs'],
			},
			{
				id: 'tests',
				label: 'Tests & jabs',
				hint: 'Blood tests, health panels, flu and travel vaccines.',
				icon: 'flask',
				services: ['lab-blood-test', 'vaccination-flu', 'vaccination-travel', 'lab-comprehensive-panel'],
				keywords: ['blood test', 'test', 'lab', 'vaccine', 'vaccination', 'jab', 'shot', 'flu shot', 'travel', 'panel'],
			},
		] satisfies CareNeed[],
	},

	/** Why a recommended service fits — shown on Care Finder results. Keyed by product slug. */
	serviceReasons: {
		'general-consult-standard': 'Thirty unhurried minutes with a doctor, for anything new or worrying.',
		'general-consult-extended': 'An hour, for when there are a few things to talk through.',
		'preventive-annual': 'The yearly physical: vitals, bloods and a proper review.',
		'preventive-screening': 'A fuller screening when you want a complete picture.',
		'pediatrics-sick-visit': 'Same-week slots kept open for unwell children.',
		'pediatrics-well-child': 'Growth, development and a chat about everything new.',
		'vaccination-child': 'The childhood schedule, done gently and quickly.',
		'cardiology-consultation': 'A full heart-health assessment with a written plan.',
		'cardiology-followup': 'A shorter review of a plan already in place.',
		'cardiology-echocardiogram': 'A painless ultrasound scan of the heart.',
		'dermatology-skin-check': 'A focused check of a mole or spot that’s changed.',
		'dermatology-consultation': 'For rashes, acne, eczema and longer-running skin concerns.',
		'dermatology-cosmetic': 'Honest advice on cosmetic skin treatments.',
		'therapy-individual': 'Fifty minutes, one-to-one, with a licensed therapist.',
		'therapy-group': 'A small, supportive group led by a therapist.',
		'dental-checkup': 'Your six-monthly check-up and clean.',
		'dental-filling': 'When something hurts, or a check-up found a cavity.',
		'dental-whitening': 'Professional whitening after a quick assessment.',
		'physiotherapy-assessment': 'Start here: we find the cause and build a plan.',
		'physiotherapy-treatment': 'Hands-on treatment once you have a plan.',
		'physiotherapy-group-class': 'Small-group rehab to keep progress going.',
		'nutrition-assessment': 'A first session to understand your goals and habits.',
		'nutrition-followup': 'Check in and adjust your plan.',
		'nutrition-workshop': 'A friendly, practical group session.',
		'lab-blood-test': 'A quick draw with our nursing team.',
		'lab-comprehensive-panel': 'A full panel of bloods with results explained.',
		'vaccination-flu': 'Ten minutes, in and out.',
		'vaccination-travel': 'Advice and jabs for where you’re going.',
	} as Record<string, string>,

	/**
	 * Department editorial content, keyed by collection slug. Departments are
	 * "rooms of care" on the site. Missing entries render from the API alone.
	 */
	departments: {
		'general-medicine': {
			short: 'General medicine',
			heroImage: 'departments/general-medicine.jpg',
			icon: 'stethoscope',
			tagline: 'Your first stop for everyday health',
			intro: 'From coughs and check-ups to referrals and repeat prescriptions, our doctors are here for whatever life throws at you — with the time to listen and get to the root of things.',
			treats: ['Coughs, colds & infections', 'Annual check-ups', 'Repeat prescriptions', 'Specialist referrals', 'Chronic-condition reviews', 'Health advice'],
			faqs: [
				{ q: 'Do I need a referral to book?', a: 'No — you can book any general consultation directly. If you need a specialist, your doctor can arrange a referral during your visit.' },
				{ q: 'How long is a standard consultation?', a: 'Thirty minutes, with a sixty-minute extended option when there’s more to discuss. We never rush you out the door.' },
				{ q: 'Can I be seen by video?', a: 'Yes. General consultations can be booked as a video visit with the same doctors you’d see in clinic.' },
			],
		},
		cardiology: {
			short: 'Cardiology',
			heroImage: 'departments/cardiology.jpg',
			icon: 'heart',
			tagline: 'Expert heart care, clearly explained',
			intro: 'Thorough assessment with genuine reassurance — from ECGs and echocardiograms to the long-term care of your heart, always explained in plain language.',
			treats: ['Heart-health assessments', 'ECG & echocardiogram', 'Blood-pressure management', 'Palpitations review', 'Follow-up care', 'Cardiac risk screening'],
			faqs: [
				{ q: 'What happens at a cardiology consultation?', a: 'Your cardiologist reviews your history and symptoms, may perform an ECG, and leaves you with a clear, written plan for next steps.' },
				{ q: 'Do I need to prepare for an echocardiogram?', a: 'No special preparation. Wear a two-piece outfit — the scan is painless and takes about thirty minutes.' },
				{ q: 'Can follow-ups be done by video?', a: 'Yes. Once your plan is in place, follow-ups can be booked as a video visit.' },
			],
		},
		dermatology: {
			short: 'Dermatology',
			heroImage: 'departments/dermatology.jpg',
			icon: 'skin',
			tagline: 'Healthy skin, honest advice',
			intro: 'Whether it’s a mole that’s changed, a stubborn rash or cosmetic advice, our dermatologists offer careful screening and practical guidance you can trust.',
			treats: ['Mole & skin checks', 'Acne & eczema', 'Rashes & infections', 'Psoriasis', 'Cosmetic consultations', 'Skin-health reviews'],
			faqs: [
				{ q: 'Can I send a photo before my visit?', a: 'Yes — add up to three photos in your pre-visit notes when you book. Your dermatologist sees them before you arrive.' },
				{ q: 'How often should I have a skin check?', a: 'For most people once a year, more often with many moles or a family history. Book any time you notice a change.' },
				{ q: 'Can I be seen by video?', a: 'Skin consultations can be done by video. Mole checks need to be in clinic, so we can look closely.' },
			],
		},
		pediatrics: {
			short: 'Pediatrics',
			heroImage: 'departments/pediatrics.jpg',
			icon: 'child',
			tagline: 'Gentle care for your little ones',
			intro: 'From newborns to teens, our pediatricians make children — and parents — feel at ease. Well-child visits, sick visits and immunizations in a calm, friendly room.',
			treats: ['Well-child visits', 'Sick visits', 'Childhood immunizations', 'Growth & development', 'Allergy & asthma', 'Parent advice'],
			faqs: [
				{ q: 'Can I book for my child from my own account?', a: 'Yes. Choose “My child” when you book and add their name and date of birth. Their visits appear under their name in My Care.' },
				{ q: 'Can I book a same-day sick visit?', a: 'We keep same-week — often same-day — slots open for unwell children.' },
				{ q: 'From what age do you see children?', a: 'From newborn right through to the teenage years.' },
			],
		},
		physiotherapy: {
			short: 'Physiotherapy',
			heroImage: 'departments/physiotherapy.jpg',
			icon: 'activity',
			tagline: 'Move better, recover faster',
			intro: 'Our physiotherapists get you back on your feet after injury, surgery or pain — with hands-on treatment, a plan you can follow at home, and small-group rehab classes.',
			treats: ['Sports & overuse injuries', 'Back & neck pain', 'Post-surgery rehab', 'Posture & mobility', 'Movement assessments', 'Group rehab'],
			faqs: [
				{ q: 'Do I need a referral?', a: 'No — book an initial assessment directly and start treatment straight away.' },
				{ q: 'What should I wear?', a: 'Loose, comfortable clothes you can move in. Shorts are ideal for knee, hip or ankle problems.' },
				{ q: 'How many sessions will I need?', a: 'It depends on the injury. After your assessment your physiotherapist outlines a realistic plan.' },
			],
		},
		'dental-care': {
			short: 'Dental',
			heroImage: 'departments/dental-care.jpg',
			icon: 'tooth',
			tagline: 'A calmer kind of dentistry',
			intro: 'Check-ups, fillings and whitening in a quiet, sunlit room designed to take the anxiety out of the chair. Gentle, unhurried, and honest about what you actually need.',
			treats: ['Check-ups & cleans', 'Fillings', 'Teeth whitening', 'Fluoride treatment', 'Preventive advice', 'Nervous-patient care'],
			faqs: [
				{ q: 'How often should I have a check-up?', a: 'Every six months for most people. We’ll remind you in My Care when you’re due.' },
				{ q: 'Do you help nervous patients?', a: 'Very much so. Mention it in your pre-visit notes and we’ll take it entirely at your pace.' },
				{ q: 'Is whitening safe?', a: 'Yes, when done professionally. We assess your teeth first and explain the results you can expect.' },
			],
		},
		nutrition: {
			short: 'Nutrition',
			heroImage: 'departments/nutrition.jpg',
			icon: 'apple',
			tagline: 'Food that works for your body',
			intro: 'Our dietitians build realistic, personal plans — for weight, energy, digestion or a condition — and run friendly group workshops to keep you going.',
			treats: ['Personal meal plans', 'Weight management', 'Digestive health', 'Sports nutrition', 'Condition-specific diets', 'Group workshops'],
			faqs: [
				{ q: 'What happens at a first assessment?', a: 'Your dietitian goes through your goals, habits and health, then builds a plan that fits your life.' },
				{ q: 'Can follow-ups be by video?', a: 'Yes — nutrition follow-ups work beautifully by video.' },
				{ q: 'Are workshops beginner-friendly?', a: 'Completely. Relaxed, practical sessions with plenty of time for questions.' },
			],
		},
		'mental-health': {
			short: 'Mental health',
			heroImage: 'departments/mental-health.jpg',
			icon: 'brain',
			tagline: 'Support, without judgement',
			intro: 'A safe, calm space to talk. Our therapists offer individual and group sessions for stress, anxiety, low mood, or simply finding your footing again.',
			treats: ['Anxiety & stress', 'Low mood', 'Individual therapy', 'Group therapy', 'Life transitions', 'Coping strategies'],
			faqs: [
				{ q: 'Is what I share confidential?', a: 'Yes. Everything you discuss is private, within the legal and safety limits your therapist will explain.' },
				{ q: 'Do I need a diagnosis to book?', a: 'Not at all. Book whenever you feel talking to someone would help.' },
				{ q: 'Can I have therapy by video?', a: 'Yes — individual therapy is available as a video visit if that feels easier.' },
			],
		},
		'labs-vaccinations': {
			short: 'Labs & vaccines',
			heroImage: 'departments/labs-vaccinations.jpg',
			icon: 'flask',
			tagline: 'Fast answers, gentle hands',
			intro: 'Blood tests, health panels and vaccinations, handled quickly and calmly by our nursing team — with results explained, not just emailed.',
			treats: ['Blood tests', 'Comprehensive panels', 'Flu vaccinations', 'Travel vaccinations', 'Childhood immunizations', 'B12 injections'],
			faqs: [
				{ q: 'How quickly will I get results?', a: 'Most routine results are back within a few days and appear in your care record with a note from the clinician.' },
				{ q: 'Do I need to fast?', a: 'Some tests need it and some don’t — your visit pass tells you exactly what to do.' },
				{ q: 'Which travel vaccines do you offer?', a: 'The common travel vaccinations, with advice based on your itinerary.' },
			],
		},
	} satisfies Record<DepartmentSlug, DepartmentContent> as Record<string, DepartmentContent>,

	/** How to prepare, per department. Drives the visit pass, the card tip and My Care checklists. */
	prep: {
		'general-medicine': { bring: ['Photo ID and insurance card', 'A list of your current medications', 'Notes on when symptoms started'], tip: 'Jot down your questions — it’s easy to forget one in the room.', arriveEarly: 10 },
		cardiology: { bring: ['Your current medications and doses', 'Any home blood-pressure readings', 'Previous ECGs or letters, if you have them'], tip: 'Wear a two-piece outfit — it makes an ECG easier.', arriveEarly: 15 },
		dermatology: { bring: ['Photos of how the area has changed', 'Products or creams you’re using'], tip: 'Skip make-up or nail polish near the area we’re looking at.', arriveEarly: 10 },
		pediatrics: { bring: ['Your child’s vaccination record', 'A favourite toy or comforter', 'Any medicines they take'], tip: 'Bring a snack — little ones are calmer when they’re not hungry.', arriveEarly: 10 },
		physiotherapy: { bring: ['Loose, comfortable clothes', 'Any scans or referral letters', 'Trainers you exercise in'], tip: 'Wear shorts for knee, hip or ankle problems.', arriveEarly: 10 },
		'dental-care': { bring: ['Your dental insurance details', 'A list of any medications'], tip: 'Nervous? Say so in your notes — we’ll go at your pace.', arriveEarly: 10 },
		nutrition: { bring: ['A rough food diary of the last 3 days', 'Recent blood results, if any'], tip: 'Nothing to change beforehand — come as you are.', arriveEarly: 5 },
		'mental-health': { bring: ['Nothing but yourself', 'Anything you’d like to talk about, written down if it helps'], tip: 'Find a quiet, private spot if you’re joining by video.', arriveEarly: 5 },
		'labs-vaccinations': { bring: ['Photo ID', 'Your vaccination record (for jabs)', 'Water — staying hydrated helps blood draws'], tip: 'Some blood tests need fasting — check your visit pass.', arriveEarly: 10 },
	} as Record<string, Prep>,

	/** Fallback prep when a department has no entry. */
	defaultPrep: { bring: ['Photo ID and insurance card', 'A list of your current medications'], tip: 'Arrive a few minutes early so you can settle in.', arriveEarly: 10 } satisfies Prep,

	/** Video-visit prep (replaces in-clinic prep when the visit is online). */
	videoPrep: { bring: ['A quiet, private, well-lit room', 'A charged phone, tablet or laptop', 'Your medications to hand'], tip: 'Your link opens 10 minutes before the visit. Test your camera now.', arriveEarly: 0 } satisfies Prep,

	/** "Due for" reminders in My Care, from the last completed visit. */
	recalls: [
		{ services: ['dental-checkup'], months: 6, label: 'Your six-monthly dental check-up', book: 'dental-checkup' },
		{ services: ['preventive-annual', 'preventive-screening'], months: 12, label: 'Your annual check-up', book: 'preventive-annual' },
		{ services: ['dermatology-skin-check'], months: 12, label: 'Your yearly skin check', book: 'dermatology-skin-check' },
		{ services: ['vaccination-flu'], months: 12, label: 'This season’s flu shot', book: 'vaccination-flu' },
		{ services: ['pediatrics-well-child'], months: 12, label: 'A well-child visit', book: 'pediatrics-well-child' },
		{ services: ['cardiology-consultation', 'cardiology-followup'], months: 6, label: 'Your cardiology follow-up', book: 'cardiology-followup' },
	] satisfies Recall[],

	/**
	 * Clinician profiles, keyed by staff slug. The API has names, photos and
	 * services; titles and bios are curated here. Anyone without an entry gets a
	 * role-derived title from `clinicianRoles` (matched on their services' department).
	 */
	clinicians: {
		'dr-lin-chen': { title: 'Medical Director · Cardiologist', bio: 'Twenty years in cardiology and a calm, methodical bedside manner. Dr. Chen is known for explaining exactly what your heart is doing — and what to do next.', languages: ['English', 'Mandarin'], focus: ['Palpitations', 'Blood pressure', 'Prevention'] },
		'dr-priya-patel': { title: 'Senior Dermatologist', bio: 'Medical and cosmetic dermatology, with a reputation for careful skin-cancer screening and honest, practical advice.', languages: ['English', 'Hindi', 'Gujarati'], focus: ['Mole checks', 'Eczema', 'Acne'] },
		'dr-min-kim': { title: 'Senior Pediatrician', bio: 'A pediatrician who makes children — and their parents — feel at ease. Gentle, thorough and endlessly patient.', languages: ['English', 'Korean'], focus: ['Newborns', 'Asthma', 'Development'] },
		'dr-arjun-singh': { title: 'Dentist', bio: 'Gentle, preventive dentistry and a soft spot for nervous patients. Dr. Singh takes the time to explain every step before it happens.', languages: ['English', 'Punjabi'], focus: ['Nervous patients', 'Prevention'] },
		'anna-schmidt': { title: 'Registered Nurse', bio: 'Blood draws so smooth you barely notice them. Anna runs diagnostics and vaccinations with a smile that puts everyone at ease.', languages: ['English', 'German'], focus: ['Blood tests', 'Travel vaccines'] },
		'ben-morrison': { title: 'Registered Nurse', bio: 'Calm, quick and reassuring — Ben looks after vaccinations, health panels and the occasional nervous first-timer.', languages: ['English'] },
		'maya-kapoor': { title: 'Lead Therapist', bio: 'Leads our mental-health programme. Compassionate, grounded and a wonderful listener, with a focus on anxiety and life transitions.', languages: ['English', 'Hindi'], focus: ['Anxiety', 'Transitions', 'Group therapy'] },
		'dr-carlos-ramos': { title: 'Cardiologist', bio: 'Heart-health assessments with a strong focus on prevention and long-term blood-pressure care.', languages: ['English', 'Spanish'] },
		'dr-amara-okonkwo': { title: 'Dermatologist', bio: 'Specialist in skin of colour, eczema and acne. Practical treatment plans that fit real life.', languages: ['English', 'Igbo'] },
		'dr-erik-eriksson': { title: 'Dentist', bio: 'Precise, unhurried restorative dentistry — fillings you’ll forget you had.', languages: ['English', 'Swedish'] },
		'dr-isabella-silva': { title: 'Pediatrician', bio: 'Warm, playful and very good at getting a smile out of a poorly toddler.', languages: ['English', 'Portuguese', 'Spanish'] },
		'lisa-mueller': { title: 'Registered Nurse', bio: 'Diagnostics and immunizations with a famously steady hand.', languages: ['English', 'German'] },
		'tom-kennedy': { title: 'Registered Nurse', bio: 'Vaccinations, health panels and travel advice, explained in plain English.', languages: ['English'] },
		'claire-dubois': { title: 'Therapist', bio: 'Individual therapy for stress, burnout and low mood, in a calm and steady space.', languages: ['English', 'French'] },
		'dr-yuki-nakamura': { title: 'Cardiologist', bio: 'Echocardiography and arrhythmia care, with clear written plans after every visit.', languages: ['English', 'Japanese'] },
		'dr-amir-hassan': { title: 'Dermatologist', bio: 'Mole mapping and skin-cancer prevention. Thorough, and never rushed.', languages: ['English', 'Arabic'] },
		'dr-elizabeth-white': { title: 'Pediatrician', bio: 'Thirty years caring for local families — some of her patients now bring their own children.', languages: ['English'] },
		'dr-alexei-petrov': { title: 'Dentist', bio: 'Cosmetic and preventive dentistry, with a gentle touch for anxious patients.', languages: ['English', 'Russian'] },
		'sarah-williams': { title: 'Registered Nurse', bio: 'Runs our early-morning lab clinics — quick, kind and very organised.', languages: ['English'] },
		'james-johnson': { title: 'Registered Nurse', bio: 'Vaccinations and blood tests, with a calming chat to go with them.', languages: ['English'] },
		'nina-ivanova': { title: 'Therapist', bio: 'Supports people through anxiety, grief and big life changes, individually and in groups.', languages: ['English', 'Russian'] },
	} as Record<string, ClinicianProfile>,

	/** Fallback titles by department (collection slug) for clinicians without a profile. */
	clinicianRoles: {
		'general-medicine': 'Family Physician',
		cardiology: 'Cardiologist',
		dermatology: 'Dermatologist',
		pediatrics: 'Pediatrician',
		physiotherapy: 'Physiotherapist',
		'dental-care': 'Dentist',
		nutrition: 'Registered Dietitian',
		'mental-health': 'Therapist',
		'labs-vaccinations': 'Registered Nurse',
	} as Record<string, string>,

	/** Clinicians featured on the home rail (staff slugs, in order). */
	featuredClinicians: ['dr-lin-chen', 'dr-min-kim', 'dr-priya-patel', 'maya-kapoor', 'dr-arjun-singh', 'anna-schmidt'],

	/**
	 * Clinic photography and taglines, matched to API locations by slug, with a
	 * positional fallback for re-seeded stores whose slugs differ.
	 */
	clinics: {
		'clarity-back-bay': { image: 'locations/location-1.jpg', tagline: 'The flagship, by the Charles', note: 'Step-free entrance · Validated parking on Commonwealth Ave' },
		'clarity-jamaica-plain': { image: 'locations/location-2.jpg', tagline: 'A neighbourhood practice on Centre Street', note: 'Orange Line · Green Street, 6 min walk' },
		'clarity-cambridge': { image: 'locations/location-3.jpg', tagline: 'Quiet rooms near Harvard Square', note: 'Red Line · Harvard, 10 min walk · Bike racks' },
		// Geo-generated clinic slugs (the seeding service may place the clinics in other cities).
		'clarity-new-york': { image: 'locations/location-1.jpg', tagline: 'The flagship, in the West Village', note: 'Step-free entrance · Christopher St station, 4 min walk', timezone: 'America/New_York' },
		'clarity-chicago': { image: 'locations/location-2.jpg', tagline: 'Sunlit rooms on the Magnificent Mile', note: 'Red Line · Chicago, 6 min walk', timezone: 'America/Chicago' },
		'clarity-los-angeles': { image: 'locations/location-3.jpg', tagline: 'A quiet practice on Sunset', note: 'Free parking behind the building', timezone: 'America/Los_Angeles' },
	} as Record<string, { image: string; tagline: string; note: string; /** IANA zone the clinic keeps its hours in. */ timezone?: string }>,
	clinicImages: ['locations/location-1.jpg', 'locations/location-2.jpg', 'locations/location-3.jpg'],

	/** Home — "Your visit, start to finish" */
	journey: {
		eyebrow: 'Your visit, start to finish',
		title: 'Booked in a minute.',
		accent: 'Looked after for years.',
		steps: [
			{ n: '01', title: 'Book in a minute', body: 'Pick who it’s for, how you’d like to be seen and a time that suits you. Real availability, across every clinic and video.' },
			{ n: '02', title: 'Tell us beforehand', body: 'Pre-visit notes on lined paper: symptoms, medications, a photo of that mole. Your clinician reads them before you arrive.' },
			{ n: '03', title: 'Arrive, or join by video', body: 'Your visit pass has directions, what to bring and how to prepare. Video links open ten minutes before.' },
			{ n: '04', title: 'Your care record', body: 'Every visit, note and invoice for you and your family in one calm place — with a nudge when a check-up is due.' },
		],
	},

	/** Video visits (telehealth) */
	videoVisit: {
		eyebrow: 'Video visits',
		title: 'The same doctors,',
		accent: 'from your sofa.',
		body: 'Many visits work just as well by video: follow-ups, skin concerns, therapy, nutrition and everyday worries. Same clinicians, same notes, same care — no waiting room.',
		image: 'telehealth/telehealth-hero.jpg',
		/** Product slugs that can be booked as video (mirrors the seeded online location). */
		services: ['general-consult-standard', 'general-consult-extended', 'specialist-followup', 'cardiology-followup', 'dermatology-consultation', 'nutrition-followup', 'therapy-individual'],
		joinWindowMinutes: 10,
		steps: [
			{ n: '01', title: 'Choose “Video visit”', body: 'Right in the booking flow, on any service that offers it.' },
			{ n: '02', title: 'Check your camera', body: 'A thirty-second device check, here on the site. Nothing is recorded or uploaded.' },
			{ n: '03', title: 'Join from My Care', body: 'The join button lights up ten minutes before. No app to install.' },
		],
		goodFor: ['Follow-ups on an existing plan', 'Skin concerns (with photos)', 'Therapy and nutrition', 'Repeat prescriptions', 'Reviewing test results'],
		notFor: ['Anything that needs an examination', 'Blood tests and vaccines', 'Dental and physiotherapy', 'Urgent or emergency symptoms'],
		faqs: [
			{ q: 'What do I need?', a: 'A phone, tablet or computer with a camera, and a stable connection. Use the device check on this page to make sure everything works.' },
			{ q: 'Can I get a prescription by video?', a: 'Yes, when clinically appropriate. Prescriptions and referrals are sent digitally after your visit.' },
			{ q: 'Is it private?', a: 'Completely. Visits are encrypted end-to-end and never recorded.' },
			{ q: 'What if my connection drops?', a: 'Rejoin from the same link. If video won’t work, your clinician will call your phone so the visit can carry on.' },
		],
	},

	/** Patient words (home) */
	testimonials: [
		{ quote: 'I booked for my daughter while she was still on the sofa with a temperature. We were seen that afternoon, and nobody rushed us.', author: 'Jamie P.', context: 'Pediatrics' },
		{ quote: 'Dr. Chen drew my heart on a notepad and explained every line. I left with a plan I actually understood.', author: 'Daniel O.', context: 'Cardiology' },
		{ quote: 'I uploaded a photo of the mole when I booked. The dermatologist had already looked at it before I sat down.', author: 'Priya R.', context: 'Dermatology' },
		{ quote: 'Therapy by video from my own kitchen table. It made it possible to start.', author: 'Sam K.', context: 'Mental health · Video visit' },
	],

	/** Trust markers (home + checkout reassurance) */
	trust: [
		{ icon: 'shield', title: 'Board-certified clinicians', body: 'Every doctor, nurse and therapist is fully licensed.' },
		{ icon: 'lock', title: 'Private by design', body: 'Your notes and video visits are encrypted and never shared.' },
		{ icon: 'clock', title: 'Unhurried visits', body: 'Thirty minutes as standard, never ten.' },
		{ icon: 'card', title: 'Most insurance accepted', body: 'Clear self-pay prices up front. No surprises at the desk.' },
	],

	/** Home FAQ */
	faqs: [
		{ q: 'Can I book for my child or a parent?', a: 'Yes. Choose who the visit is for when you book and add their details. Everything stays together in your My Care record, filterable by person.' },
		{ q: 'Do you accept insurance?', a: 'We accept most major plans and show self-pay prices up front. Add your provider in your pre-visit notes and we’ll check coverage before you arrive.' },
		{ q: 'Can I see a clinician by video?', a: 'Many services offer a video visit with the same clinicians you’d see in clinic — choose “Video visit” when you book.' },
		{ q: 'How do I reschedule or cancel?', a: 'From My Care, up to 24 hours before your visit. No phone calls, no fees.' },
		{ q: 'What if it’s urgent?', a: 'We keep same-week slots open in every department. For emergencies, always call 911.' },
	],

	/** About page */
	about: {
		eyebrow: 'About Clear Care',
		lead: 'A practice built around',
		accent: 'the person in the room.',
		body: 'Clear Care opened in 2013 with a simple idea: healthcare where nobody is rushed. Three clinics later, the idea hasn’t changed.',
		images: ['about/about-shop.jpg', 'about/about-detail.jpg'],
		story: [
			'We opened our first practice in 2013 with four clinicians and a rule: no ten-minute appointments. Thirty minutes is our standard, because good care starts with being heard.',
			'Today eighty clinicians work across nine departments in three clinics — and by video. Many of our patients bring their whole family, and some of our pediatric patients now bring their own children.',
			'We built our booking and care record the same way we built the clinics: calm, clear and around the patient. Pre-visit notes so your clinician is ready. A visit pass so you know what to bring. A record you can actually read.',
		],
		values: [
			{ n: '01', title: 'Time to listen', body: 'Thirty minutes as standard. Every visit gets the time it needs.' },
			{ n: '02', title: 'Plain language', body: 'Clear advice and clear prices — no jargon, no surprises.' },
			{ n: '03', title: 'Ready before you arrive', body: 'Pre-visit notes, photos and history read before you sit down.' },
			{ n: '04', title: 'The whole family', body: 'From newborns to grandparents, nine departments under one roof.' },
		],
		gallery: [
			{ image: 'gallery/look-1.jpg', caption: 'Reception' },
			{ image: 'gallery/look-2.jpg', caption: 'Consultation room' },
			{ image: 'gallery/look-3.jpg', caption: 'Diagnostics' },
			{ image: 'gallery/look-4.jpg', caption: 'Pediatrics suite' },
			{ image: 'gallery/look-5.jpg', caption: 'Physiotherapy studio' },
			{ image: 'gallery/look-6.jpg', caption: 'Waiting lounge' },
		],
		trustImage: 'trust/trust-care.jpg',
	},

	/** Final CTA where the care line settles flat. */
	closing: {
		lead: 'Booked.',
		accent: 'Breathe.',
		body: 'Find the right care in a minute. We’ll take it from there.',
	},

	footer: {
		blurb: 'An unhurried private practice for the whole family. Three clinics and video visits, since 2013.',
		socials: [
			{ label: 'Instagram', href: 'https://instagram.com' },
			{ label: 'LinkedIn', href: 'https://linkedin.com' },
		],
		columns: [
			{
				title: 'Care',
				links: [
					{ label: 'Find care', href: '/care' },
					{ label: 'Departments', href: '/departments' },
					{ label: 'Video visits', href: '/video-visits' },
					{ label: 'Clinicians', href: '/clinicians' },
				],
			},
			{
				title: 'Practice',
				links: [
					{ label: 'About us', href: '/about' },
					{ label: 'Clinics & contact', href: '/contact' },
					{ label: 'My Care', href: '/account' },
				],
			},
		],
	},
};

export type SiteConfig = typeof siteConfig;

/** Prep for a department (collection slug), or the default. */
export function prepFor(department: string | null | undefined, video = false): Prep {
	if (video) return siteConfig.videoPrep;
	return (department && siteConfig.prep[department]) || siteConfig.defaultPrep;
}

/** The clinic's photography for an API location (by slug, else by index). */
export function clinicMeta(slug: string | null | undefined, index = 0) {
	const meta = slug ? siteConfig.clinics[slug] : undefined;
	return meta ?? { image: siteConfig.clinicImages[index % siteConfig.clinicImages.length]!, tagline: '', note: '', timezone: undefined };
}
