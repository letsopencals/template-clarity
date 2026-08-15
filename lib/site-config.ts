/**
 * Site configuration — edit this file to customize all branding and copy.
 *
 * Every hardcoded clinic name, tagline, contact detail, and homepage copy
 * is sourced from here so you can rebrand the entire template in one place.
 */

export const siteConfig = {
	name: 'Clear Care Medical',
	tagline: 'Modern Care, Booked in Minutes',
	description:
		'Clear Care Medical — compassionate, modern healthcare. Book consultations, screenings, and specialist visits online in minutes.',
	url: 'https://example.com',

	/** Logo rendered as: {text}{accent} */
	logo: { text: 'ClearCare', accent: 'Medical' },

	/** Hero section on the homepage */
	hero: {
		subtitle: 'Clear Care Medical',
		heading: ['Exceptional care,'],
		headingAccent: 'made simple.',
		body: 'Same-week appointments with trusted doctors, nurses, and specialists across our Boston clinics. Book online in under a minute — no phone calls, no waiting rooms.',
		cta: { label: 'Book Appointment', href: '/departments' },
		secondaryCta: { label: 'Explore Departments', href: '/departments' },
		rating: { score: '4.9', reviews: '4,800+ reviews' },
		trust: 'Trusted by 30,000+ patients across Boston',
		/** Floating glass stat cards over the hero photo */
		floatingStats: [
			{ value: '21', label: 'Expert clinicians' },
			{ value: '98%', label: 'Patient satisfaction' },
		],
		/** Small floating "next available" chip on the hero image */
		availabilityChip: { label: 'Next available', value: 'Today · 2:30 PM' },
		stat: { value: '30k+', label: 'Patients\nCared For' },
		backgroundText: 'CLARITY',
	},

	/**
	 * Departments grid on the homepage — the primary entry into booking.
	 * `slug` matches a product collection slug in the seeded store (`/departments/[slug]`).
	 * `icon` maps to a glyph in components/ui/department-icon.tsx.
	 */
	departments: [
		{ name: 'General Medicine', slug: 'general-medicine', icon: 'stethoscope', blurb: 'Everyday health concerns, check-ups & referrals.' },
		{ name: 'Cardiology', slug: 'cardiology', icon: 'heart', blurb: 'Heart-health assessments, ECG & ongoing care.' },
		{ name: 'Dermatology', slug: 'dermatology', icon: 'skin', blurb: 'Skin screening, mole checks & treatments.' },
		{ name: 'Pediatrics', slug: 'pediatrics', icon: 'child', blurb: 'Well-child visits, sick visits & immunizations.' },
		{ name: 'Physiotherapy', slug: 'physiotherapy', icon: 'activity', blurb: 'Hands-on recovery from injury & pain.' },
		{ name: 'Dental', slug: 'dental-care', icon: 'tooth', blurb: 'Cleanings, check-ups & routine dental care.' },
		{ name: 'Mental Health', slug: 'mental-health', icon: 'brain', blurb: 'Therapy & compassionate psychological support.' },
		{ name: 'Nutrition', slug: 'nutrition', icon: 'apple', blurb: 'Dietitian-led plans for your health goals.' },
		{ name: 'Labs & Vaccines', slug: 'labs-vaccinations', icon: 'flask', blurb: 'Blood work, diagnostics & vaccinations.' },
	],

	/** Departments grid section header */
	departmentsSection: {
		eyebrow: 'Care by Specialty',
		heading: 'Find the right care,\nby department',
		body: 'Nine departments under one roof. Start with the specialty you need and book with the right clinician in minutes.',
	},

	/** Telehealth / online consultation band */
	telehealth: {
		eyebrow: 'Online Consultation',
		heading: 'See a clinician\nfrom anywhere',
		body: 'Many of our services are available as a secure video or phone visit — same trusted clinicians, no travel. Just choose an online slot when you book.',
		points: [
			'Secure video or phone appointments',
			'Prescriptions & referrals sent digitally',
			'Same clinicians you’d see in the clinic',
			'Book online in under a minute',
		],
		cta: { label: 'Explore telehealth', href: '/telehealth' },
	},

	/** CTA section on the homepage (kept for compatibility) */
	cta: {
		subtitle: 'Care You Can Trust.',
		heading: ['HEALTH', 'YOU CAN'],
		headingAccent: 'Rely On',
		body: 'Every visit to Clear Care Medical is unhurried and personal. Experienced clinicians, modern facilities, and time to listen — because good care starts with being heard.',
		stats: [
			{ value: '30k+', label: 'Patients Cared For' },
			{ value: '21', label: 'Clinicians' },
			{ value: '9', label: 'Departments' },
		],
	},

	/** Featured services on the homepage */
	services: [
		{
			title: 'General Consultation',
			description: 'See a doctor about any health concern. Diagnosis, advice, prescriptions, and referrals when you need them.',
			href: '/booking/general-consult-standard',
			price: '$120',
			duration: '30 min',
		},
		{
			title: 'Preventive Health Check',
			description: 'A thorough annual check-up to catch issues early and keep you on track. Bloods, vitals, and a full review.',
			href: '/booking/preventive-annual',
			price: '$95',
			duration: '45 min',
		},
		{
			title: 'Cardiology Consultation',
			description: 'Expert heart-health assessment with our cardiology team, including ECG review and a clear care plan.',
			href: '/booking/cardiology-consultation',
			price: '$220',
			duration: '45 min',
		},
		{
			title: 'Pediatric Visit',
			description: 'Gentle, attentive care for children — well-child visits, sick visits, and childhood immunizations.',
			href: '/booking/pediatrics-well-child',
			price: '$110',
			duration: '30 min',
		},
		{
			title: 'Physiotherapy',
			description: 'Hands-on treatment to recover from injury and move without pain, led by our licensed therapists.',
			href: '/booking/physiotherapy-treatment',
			price: '$95',
			duration: '30 min',
		},
	],

	/** Stats band on the homepage */
	statsBand: {
		stats: [
			{ value: '21', label: 'Clinicians' },
			{ value: '9', label: 'Departments' },
			{ value: '30k+', label: 'Patients Cared For' },
		],
	},

	/** Story strip cards (homepage) */
	storyStrip: {
		eyebrow: 'The Clinic',
		cards: [
			{
				numeral: '01',
				heading: 'Founded 2013',
				body: 'A single Boston practice built on one idea: healthcare that takes the time to listen.',
			},
			{
				numeral: '02',
				heading: 'Three Clinics',
				body: 'Three locations across greater Boston. Same standard of care, same familiar faces at every one.',
			},
			{
				numeral: '03',
				heading: 'Nine Departments',
				body: 'From general medicine to cardiology, dermatology, pediatrics, and mental health — care under one roof.',
			},
			{
				numeral: '04',
				heading: 'Booked in 60s',
				body: 'No hold music, no waiting room. Choose a clinician and time on your phone, and arrive when it suits you.',
			},
		],
	},

	/** Process strip — numbered steps on how booking works */
	process: {
		eyebrow: 'How It Works',
		heading: 'Booking care, made',
		headingAccent: 'effortless.',
		body: 'From choosing a department to walking into your appointment — four simple steps, all online.',
		steps: [
			{ number: '01', title: 'Choose a department', body: 'Browse by specialty and pick the service you need.', icon: 'browse' },
			{ number: '02', title: 'Pick your clinician', body: 'Or let us match you with the next available expert.', icon: 'clinician' },
			{ number: '03', title: 'Pick a time', body: 'See real availability across all three clinics.', icon: 'calendar' },
			{ number: '04', title: 'Come in for care', body: 'Share a few details, and we’ll be ready for your visit.', icon: 'check' },
		],
	},

	/** Gallery / editorial frames (homepage) */
	lookbook: {
		eyebrow: 'Inside Clear Care',
		heading: 'Our Clinics',
		body: 'Calm, modern spaces designed to put you at ease — from the waiting room to the consultation room.',
		frames: [
			{ image: 'gallery/look-1.jpg', caption: 'Reception · Back Bay', size: 'tall' as const },
			{ image: 'gallery/look-2.jpg', caption: 'Consultation Room', size: 'square' as const },
			{ image: 'gallery/look-3.jpg', caption: 'Diagnostics Lab', size: 'wide' as const },
			{ image: 'gallery/look-4.jpg', caption: 'Pediatrics Suite', size: 'square' as const },
			{ image: 'gallery/look-5.jpg', caption: 'Physiotherapy Studio', size: 'tall' as const },
			{ image: 'gallery/look-6.jpg', caption: 'Waiting Lounge', size: 'wide' as const },
		],
	},

	/** Locations strip on the homepage — paired positionally with API locations[0..2] */
	locations: {
		eyebrow: 'Our Clinics',
		heading: 'Three clinics.\nOne standard of care.',
		body: 'Find the clinic nearest you and book in seconds. The same trusted clinicians and unhurried care at every location.',
		cards: [
			{ image: 'locations/location-1.jpg', tagline: 'Back Bay Flagship', hoursHint: 'Mon–Fri · 8–5' },
			{ image: 'locations/location-2.jpg', tagline: 'Cambridge Clinic', hoursHint: 'Mon–Fri · 8–5' },
			{ image: 'locations/location-3.jpg', tagline: 'Brookline Clinic', hoursHint: 'Mon–Sat · 8–5' },
		],
	},

	/** Booking banner on the homepage */
	bookingBanner: {
		heading: ['READY TO SEE'],
		headingAccent: 'A Doctor?',
		body: 'Book your appointment today. Same-week availability across every clinic.',
		cta: { label: 'Book Now', href: '/departments' },
	},

	/** About page */
	about: {
		heroSubtitle: 'About Clear Care Medical',
		heroHeading: ['COMPASSIONATE CARE,', 'MODERN'],
		heroHeadingAccent: 'Medicine',
		heroBody:
			'A clinic built around the patient, not the paperwork. We invest in our clinicians, our facilities, and the time it takes to care for people properly.',
		storyParagraphs: [
			'Clear Care Medical opened in 2013 with a simple idea: healthcare where the patient comes first. No rushed ten-minute slots, no confusing bills, no feeling like a number. Just a calm room, an expert clinician, and the time to listen.',
			'What began as a single Boston practice has grown into three clinics across the city — but the philosophy hasn’t changed. The same clinicians. The same standard. The same unhurried care.',
			'Today, a team of twenty-one doctors, nurses, and therapists work under the Clear Care Medical name across nine departments. Together we’ve cared for more than 30,000 patients — every one treated as a person, not a case number.',
		],
		bottomCta: 'YOUR HEALTH, IN GOOD HANDS',
		bottomCtaBody:
			'Book your first appointment and find out why our patients trust us with the care that matters most.',
	},

	/** Footer */
	footer: {
		description:
			'Compassionate, modern healthcare for the whole family. Trusted clinicians, calm clinics, and the time to care for you properly.',
		socials: ['Instagram', 'Facebook', 'LinkedIn'],
		serviceLinks: [
			{ label: 'General Medicine', href: '/departments/general-medicine' },
			{ label: 'Cardiology', href: '/departments/cardiology' },
			{ label: 'Dermatology', href: '/departments/dermatology' },
			{ label: 'Pediatrics', href: '/departments/pediatrics' },
			{ label: 'Mental Health', href: '/departments/mental-health' },
		],
		companyLinks: [
			{ label: 'About', href: '/about' },
			{ label: 'Our Clinicians', href: '/about#team' },
			{ label: 'Telehealth', href: '/telehealth' },
			{ label: 'Contact', href: '/contact' },
			{ label: 'Book Appointment', href: '/departments' },
		],
	},

	/** Contact page */
	contact: {
		address: '500 Commonwealth Ave\nBoston, MA 02215',
		phone: '+1 (617) 555-0160',
		email: 'hello@clarityhealth.com',
		hours:
			'Mon — Fri: 8:00 AM — 5:00 PM\nSat: 9:00 AM — 1:00 PM\nSun: Closed',
	},

	/** Testimonials (homepage) */
	testimonials: [
		{
			quote:
				'I booked a same-week appointment from my phone in about thirty seconds. My doctor actually listened and never made me feel rushed. Care the way it should be.',
			author: 'Marcus Hale',
			role: 'General Consultation',
		},
		{
			quote:
				'The cardiology team was thorough and reassuring. They explained everything clearly and had a plan ready by the time I left. I finally understand my own health.',
			author: 'Daniel Okafor',
			role: 'Cardiology',
		},
		{
			quote:
				'Bringing my kids here is genuinely stress-free. The pediatrics team is patient and kind, and the online booking means no more waiting on hold.',
			author: 'Jamie Park',
			role: 'Pediatrics',
		},
		{
			quote:
				'After my injury, the physiotherapy team got me back on my feet faster than I expected. Warm, professional, and completely focused on my recovery.',
			author: 'Theo Reyes',
			role: 'Physiotherapy',
		},
	],

	/**
	 * Team members shown on the About page and the Clinicians showcase.
	 * `rating` / `experience` / `patients` drive the doctor-card stat row on the homepage.
	 */
	team: [
		{
			name: 'Dr. Lin Chen',
			role: 'Medical Director · Cardiology',
			specialty: 'Cardiology · Internal medicine',
			bio: 'Board-certified in cardiology with twenty years of practice. Known for clear explanations and a calm, methodical bedside manner.',
			image: 'team/dr-lin-chen.jpg',
			rating: '4.9',
			experience: '20 yrs',
			patients: '6k+',
		},
		{
			name: 'Dr. Priya Patel',
			role: 'Senior Physician · Dermatology',
			specialty: 'Dermatology · Skin health',
			bio: 'Specialist in medical and cosmetic dermatology. Trusted for careful skin-cancer screening and honest, practical advice.',
			image: 'team/dr-priya-patel.jpg',
			rating: '4.9',
			experience: '14 yrs',
			patients: '4k+',
		},
		{
			name: 'Dr. Min Kim',
			role: 'Senior Physician · Pediatrics',
			specialty: 'Pediatrics · Family medicine',
			bio: 'A pediatrician who makes children — and parents — feel at ease. Gentle, thorough, and endlessly patient.',
			image: 'team/dr-min-kim.jpg',
			rating: '5.0',
			experience: '12 yrs',
			patients: '5k+',
		},
		{
			name: 'Dr. Arjun Singh',
			role: 'Physician · General Medicine',
			specialty: 'General medicine · Dental',
			bio: 'General practitioner with a broad clinical range and a reputation for taking the time to get to the root of things.',
			image: 'team/dr-arjun-singh.jpg',
			rating: '4.8',
			experience: '16 yrs',
			patients: '7k+',
		},
		{
			name: 'Maya Kapoor',
			role: 'Lead Therapist · Mental Health',
			specialty: 'Therapy · Physiotherapy',
			bio: 'Licensed therapist leading our mental-health and rehabilitation programs. Compassionate, grounded, and a great listener.',
			image: 'team/maya-kapoor.jpg',
			rating: '4.9',
			experience: '11 yrs',
			patients: '3k+',
		},
		{
			name: 'Anna Schmidt',
			role: 'Nurse · Diagnostics & Nutrition',
			specialty: 'Nursing · Dietetics',
			bio: 'Registered nurse and dietitian handling diagnostics, vaccinations, and nutrition. Warm, efficient, and reassuring.',
			image: 'team/anna-schmidt.jpg',
			rating: '4.9',
			experience: '9 yrs',
			patients: '4k+',
		},
	],

	/** Values shown on About page */
	values: [
		{
			number: '01',
			title: 'Patients First',
			description:
				'Unhurried appointments and clinicians who listen. Every visit gets the time it needs.',
		},
		{
			number: '02',
			title: 'Clear & Honest',
			description:
				'Plain-language advice and transparent pricing. No jargon, no surprises at the desk.',
		},
		{
			number: '03',
			title: 'Modern Medicine',
			description:
				'Evidence-based care, up-to-date facilities, and easy online booking that respects your time.',
		},
		{
			number: '04',
			title: 'Care for Everyone',
			description:
				'From children to grandparents, nine departments under one roof for the whole family.',
		},
	],

	/** "Why Clear Care" section — photo + heading + trust markers + colour stat cards */
	trust: {
		eyebrow: 'Why Clear Care',
		heading: 'Care you can',
		headingAccent: 'count on.',
		body: 'Expert clinicians, modern facilities, and the time to listen — that’s care built around you, not the paperwork. Here’s what you can count on at every visit.',
		image: 'trust/trust-care.jpg',
		/** Small floating card overlapping the photo */
		badge: { title: 'Trusted care, always', body: 'Compassionate care you can trust, every step of the way.' },
		cta: { label: 'More about us', href: '/about' },
		markers: [
			{ icon: 'shield', title: 'Board-certified clinicians', body: 'Every doctor, nurse & therapist is fully licensed and vetted.' },
			{ icon: 'lock', title: 'Private & secure', body: 'Your records and video visits are encrypted end-to-end.' },
			{ icon: 'clock', title: 'Same-week availability', body: 'Real openings across all three clinics, booked online.' },
			{ icon: 'card', title: 'Accepts major insurance', body: 'Transparent pricing with no surprises at the desk.' },
		],
		/** Highlighted stat cards (light / blue / dark tones) */
		statCards: [
			{ value: '30k+', label: 'Patients cared for', tone: 'light' as const, icon: 'users' },
			{ value: '4.9', label: 'Average patient rating', tone: 'blue' as const, icon: 'star' },
			{ value: '24/7', label: 'Online booking', tone: 'dark' as const, icon: 'clock' },
		],
	},

	/** Homepage FAQ accordion */
	faqs: [
		{
			q: 'How do I book an appointment?',
			a: 'Choose a department, pick your clinician and a time that suits you, then share a few details. The whole thing takes under a minute — no phone calls, no hold music.',
		},
		{
			q: 'Do you accept insurance?',
			a: 'We accept most major insurance plans and offer transparent self-pay pricing shown up front. If you’re unsure whether your plan is covered, get in touch and we’ll check for you.',
		},
		{
			q: 'Can I see a clinician online?',
			a: 'Yes. Many of our services are available as a secure video or phone visit with the same clinicians you’d see in the clinic. Just choose an online slot when you book.',
		},
		{
			q: 'What if I need to reschedule or cancel?',
			a: 'You can reschedule or cancel any appointment from your account up to 24 hours before your visit — no fees, no fuss.',
		},
		{
			q: 'Is Clear Care right for children?',
			a: 'Absolutely. Our pediatrics team cares for children from newborns to teens, with well-child visits, sick visits, and childhood immunizations in a calm, friendly setting.',
		},
	],

	/** Dedicated /telehealth page */
	telehealthPage: {
		heroImage: 'telehealth/telehealth-hero.jpg',
		eyebrow: 'Online Consultations',
		heading: ['See a clinician', 'from anywhere'],
		body: 'Skip the waiting room. Connect with the same trusted Clear Care clinicians over a secure video or phone visit — for advice, prescriptions, referrals, and follow-ups, wherever you are.',
		cta: { label: 'Book an online visit', href: '/departments' },
		steps: [
			{ number: '01', title: 'Book an online slot', body: 'Choose a service and pick an online appointment time — same easy booking as an in-person visit.' },
			{ number: '02', title: 'Join the secure call', body: 'We’ll send a private link. Connect by video or phone from your home, office, or anywhere quiet.' },
			{ number: '03', title: 'Get a clear plan', body: 'Your clinician listens, advises, and sends any prescriptions or referrals digitally — no travel needed.' },
		],
		goodFor: {
			title: 'Great for online visits',
			points: [
				'Prescription renewals & repeat medications',
				'Reviewing test or scan results',
				'Follow-ups on an existing treatment plan',
				'Minor illnesses, advice & referrals',
				'Mental-health & nutrition consultations',
			],
		},
		notFor: {
			title: 'Best seen in clinic',
			points: [
				'Anything needing a physical examination',
				'Blood tests, vaccinations & diagnostics',
				'Procedures, dressings or injections',
				'Urgent or emergency symptoms',
			],
		},
		faqs: [
			{ q: 'What do I need for a video visit?', a: 'Just a phone, tablet, or computer with a camera and a stable internet connection. We’ll email a secure link a few minutes before your appointment — no app to install.' },
			{ q: 'Can I get a prescription from an online visit?', a: 'Yes. If clinically appropriate, your clinician can issue prescriptions and referrals digitally during or right after your visit.' },
			{ q: 'Is a telehealth visit as good as coming in?', a: 'For many concerns, yes — you see the same clinicians and get the same standard of care. When an in-person exam is needed, we’ll let you know and help you book one.' },
			{ q: 'Is my video consultation private?', a: 'Completely. All visits are encrypted end-to-end and your records are kept confidential, exactly as they would be in the clinic.' },
		],
	},

	/**
	 * Per-department editorial content for /departments/[slug].
	 * Keyed by the collection slug returned from the store API. Any department
	 * without an entry here still renders from the API (title, description,
	 * services) — this map just adds the richer hero, chips, clinicians & FAQ.
	 */
	departmentContent: {
		'general-medicine': {
			heroImage: 'departments/general-medicine.jpg',
			tagline: 'Your first stop for everyday health',
			intro: 'From coughs and check-ups to referrals and repeat prescriptions, our general-medicine team is here for whatever life throws at you — with the time to listen and get to the root of things.',
			treats: ['Coughs, colds & infections', 'Annual check-ups', 'Repeat prescriptions', 'Specialist referrals', 'Chronic-condition reviews', 'Health advice'],
			clinicianNames: ['Dr. Arjun Singh', 'Dr. Lin Chen'],
			faqs: [
				{ q: 'Do I need a referral to book?', a: 'No — you can book any general-medicine consultation directly. If you need to see a specialist, your doctor can arrange a referral during your visit.' },
				{ q: 'How long is a standard consultation?', a: 'A standard consultation is 30 minutes, with an extended option if you have several things to discuss. We never rush you out the door.' },
				{ q: 'Can I get a prescription?', a: 'Yes — your doctor can issue and renew prescriptions during your appointment, in person or online.' },
			],
		},
		cardiology: {
			heroImage: 'departments/cardiology.jpg',
			tagline: 'Expert heart care, clearly explained',
			intro: 'Our cardiology team combines thorough assessment with genuine reassurance — from ECGs and echocardiograms to ongoing management of your heart health, always explained in plain language.',
			treats: ['Heart-health assessments', 'ECG & echocardiogram', 'Blood-pressure management', 'Palpitations & chest pain review', 'Follow-up care', 'Cardiac risk screening'],
			clinicianNames: ['Dr. Lin Chen'],
			faqs: [
				{ q: 'What happens at a cardiology consultation?', a: 'Your cardiologist reviews your history and symptoms, may perform an ECG or echocardiogram, and leaves you with a clear, written plan for next steps.' },
				{ q: 'Do I need to prepare for an echocardiogram?', a: 'No special preparation is needed. Wear comfortable clothing — the scan is painless and takes around 30–45 minutes.' },
				{ q: 'Can you manage my blood pressure long-term?', a: 'Yes. We offer ongoing follow-up care and medication reviews to keep your heart health on track.' },
			],
		},
		dermatology: {
			heroImage: 'departments/dermatology.jpg',
			tagline: 'Healthy skin, honest advice',
			intro: 'Whether it’s a worrying mole, a stubborn skin condition, or cosmetic advice, our dermatology team offers careful screening and practical, honest guidance you can trust.',
			treats: ['Skin-cancer & mole checks', 'Acne & eczema', 'Rashes & skin infections', 'Psoriasis management', 'Cosmetic consultations', 'Skin-health reviews'],
			clinicianNames: ['Dr. Priya Patel'],
			faqs: [
				{ q: 'How often should I have a mole check?', a: 'For most people, an annual skin check is sensible — more often if you have many moles, a family history, or notice any changes. Book anytime you’re concerned.' },
				{ q: 'Do you offer cosmetic treatments?', a: 'We offer cosmetic consultations and honest advice on what will — and won’t — help, with no pressure.' },
				{ q: 'Can you remove a mole on the day?', a: 'Some minor procedures can be done at the visit; others are booked separately after assessment. Your dermatologist will advise.' },
			],
		},
		pediatrics: {
			heroImage: 'departments/pediatrics.jpg',
			tagline: 'Gentle care for your little ones',
			intro: 'From newborns to teens, our pediatrics team makes children — and parents — feel completely at ease. Well-child visits, sick visits, and immunizations in a calm, friendly space.',
			treats: ['Well-child visits', 'Sick visits', 'Childhood immunizations', 'Growth & development checks', 'Allergy & asthma care', 'Parent advice'],
			clinicianNames: ['Dr. Min Kim'],
			faqs: [
				{ q: 'From what age do you see children?', a: 'We care for children from newborn right through to their teenage years, with age-appropriate visits at every stage.' },
				{ q: 'Do you offer childhood vaccinations?', a: 'Yes — we provide the full schedule of childhood immunizations, as well as flu and travel vaccines.' },
				{ q: 'Can I book a same-day sick visit?', a: 'We keep same-week (and often same-day) slots open for unwell children. Book online or call and we’ll fit you in.' },
			],
		},
		physiotherapy: {
			heroImage: 'departments/physiotherapy.jpg',
			tagline: 'Move better, recover faster',
			intro: 'Our licensed physiotherapists get you back on your feet after injury, surgery, or pain — with hands-on treatment, tailored exercise plans, and small-group rehab classes.',
			treats: ['Sports & overuse injuries', 'Back & neck pain', 'Post-surgery rehab', 'Posture & mobility', 'Movement assessments', 'Group rehab classes'],
			clinicianNames: ['Maya Kapoor'],
			faqs: [
				{ q: 'Do I need a referral for physiotherapy?', a: 'No referral needed — you can book an assessment directly and start treatment straight away.' },
				{ q: 'What should I wear?', a: 'Comfortable, loose clothing you can move in. For lower-limb issues, shorts are ideal so we can assess properly.' },
				{ q: 'How many sessions will I need?', a: 'It depends on your injury and goals. After your first assessment your physiotherapist will outline a realistic plan.' },
			],
		},
		'dental-care': {
			heroImage: 'departments/dental-care.jpg',
			tagline: 'A calmer kind of dentistry',
			intro: 'Routine check-ups, fillings, and whitening in a spa-like setting designed to take the anxiety out of the dentist’s chair. Gentle, unhurried, and honest about what you actually need.',
			treats: ['Routine check-ups', 'Cleanings & hygiene', 'Fillings', 'Teeth whitening', 'Preventive advice', 'Nervous-patient care'],
			clinicianNames: ['Dr. Arjun Singh'],
			faqs: [
				{ q: 'How often should I have a check-up?', a: 'For most people every six months, though your dentist may suggest a schedule that suits your teeth and gums.' },
				{ q: 'Do you help nervous patients?', a: 'Very much so — our calm setting and gentle approach are designed around anxious patients. Just let us know and we’ll take it at your pace.' },
				{ q: 'Is whitening safe?', a: 'Yes, when done professionally. We’ll assess your teeth first and explain what results you can realistically expect.' },
			],
		},
		nutrition: {
			heroImage: 'departments/nutrition.jpg',
			tagline: 'Food that works for your body',
			intro: 'Our dietitians build realistic, personalized nutrition plans — for weight, energy, digestive health, or managing a condition — plus friendly group workshops to keep you motivated.',
			treats: ['Personalized meal plans', 'Weight management', 'Digestive health', 'Sports nutrition', 'Condition-specific diets', 'Group workshops'],
			clinicianNames: ['Anna Schmidt'],
			faqs: [
				{ q: 'What happens at a nutrition assessment?', a: 'Your dietitian reviews your goals, habits, and health, then builds a realistic plan tailored to your life — not a one-size-fits-all diet.' },
				{ q: 'Can nutrition help with a medical condition?', a: 'Often, yes. We offer condition-specific guidance for things like diabetes, high cholesterol, and digestive issues, alongside your medical care.' },
				{ q: 'Are the group workshops beginner-friendly?', a: 'Completely. They’re relaxed, practical sessions suitable for any level, with plenty of room for questions.' },
			],
		},
		'mental-health': {
			heroImage: 'departments/mental-health.jpg',
			tagline: 'Support, without judgment',
			intro: 'A safe, calm space to talk. Our licensed therapists offer compassionate individual and group therapy — for stress, anxiety, low mood, or simply finding your footing again.',
			treats: ['Anxiety & stress', 'Low mood & depression', 'Individual therapy', 'Group therapy', 'Life transitions', 'Coping strategies'],
			clinicianNames: ['Maya Kapoor'],
			faqs: [
				{ q: 'Is what I share confidential?', a: 'Yes. Everything you discuss is private and handled with the same confidentiality as any medical care, within legal and safety limits your therapist will explain.' },
				{ q: 'Do I need a diagnosis to book?', a: 'Not at all. You’re welcome to book whenever you feel you’d benefit from talking to someone — no label required.' },
				{ q: 'Can I have therapy online?', a: 'Yes — individual therapy is available as a secure video visit if that feels more comfortable for you.' },
			],
		},
		'labs-vaccinations': {
			heroImage: 'departments/labs-vaccinations.jpg',
			tagline: 'Fast answers, gentle care',
			intro: 'Blood tests, health panels, and vaccinations handled quickly and calmly by our nursing team — with clear results and a reassuring hand throughout.',
			treats: ['Blood tests', 'Comprehensive health panels', 'Flu vaccinations', 'Travel vaccinations', 'Childhood immunizations', 'Diagnostic screening'],
			clinicianNames: ['Anna Schmidt'],
			faqs: [
				{ q: 'How quickly will I get my results?', a: 'Most routine blood-test results are back within a few days, and we’ll explain what they mean rather than leaving you to decipher a report.' },
				{ q: 'Do I need to fast before a blood test?', a: 'Some tests require fasting and some don’t — we’ll tell you exactly what’s needed when you book.' },
				{ q: 'Which travel vaccines do you offer?', a: 'We cover the common travel vaccinations and can advise on what you need based on your destination and itinerary.' },
			],
		},
	},
};
