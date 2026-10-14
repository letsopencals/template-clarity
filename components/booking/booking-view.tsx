'use client';

import { useCallback, useState } from 'react';
import type { CheckoutQuestionResponse, ProductListItemResponse } from '@opencals/storefront-sdk';
import { useSmoothScroll } from '@/components/motion/smooth-scroll';
import { Composer } from '@/components/booking/composer';
import type { ClinicInfo } from '@/components/booking/seen-picker';
import type { BookingDeepLink, VisitMode } from '@/hooks/use-booking-flow';
import type { PublicClinician } from '@/lib/clinicians';
import { bookingHref } from '@/lib/catalog';
import type { VisitFor } from '@/lib/intake';

interface BookingViewProps {
	slug: string;
	initialProduct: ProductListItemResponse | null;
	initialQuestions: CheckoutQuestionResponse[];
	/** The variant slug `initialQuestions` belong to. */
	initialQuestionsSlug: string | null;
	clinicians: PublicClinician[];
	clinicInfo: Record<string, ClinicInfo>;
	deepLink: BookingDeepLink;
}

export interface VariantCarry {
	visitFor: VisitFor | null;
	mode: VisitMode | null;
	staff: string | null;
}

const hrefFor = (slug: string, link: BookingDeepLink) => bookingHref(slug, { for: link.visitFor, mode: link.mode, staff: link.staff });

/**
 * Owns which composer is mounted. A variant switch or "Book another visit"
 * re-keys the composer, so every choice resets cleanly (no effects repairing
 * stale state); the URL follows along without a server round trip.
 */
export function BookingView({ slug: initialSlug, initialProduct, initialQuestions, initialQuestionsSlug, clinicians, clinicInfo, deepLink: initialLink }: BookingViewProps) {
	const lenis = useSmoothScroll();
	const [slug, setSlug] = useState(initialSlug);
	const [deepLink, setDeepLink] = useState<BookingDeepLink>(initialLink);
	const [round, setRound] = useState(0);

	const scrollTop = useCallback(() => {
		if (lenis) lenis.scrollTo(0, { duration: 1 });
		else window.scrollTo({ top: 0, behavior: 'smooth' });
	}, [lenis]);

	const switchVariant = useCallback((nextSlug: string, carry: VariantCarry) => {
		const link: BookingDeepLink = { visitFor: carry.visitFor, mode: carry.mode, staff: carry.staff };
		setSlug(nextSlug);
		setDeepLink(link);
		window.history.replaceState(null, '', hrefFor(nextSlug, link));
	}, []);

	const bookAnother = useCallback(
		(forChild: boolean) => {
			const link: BookingDeepLink = { visitFor: forChild ? 'child' : null, mode: null, staff: null };
			setDeepLink(link);
			setRound((r) => r + 1);
			window.history.replaceState(null, '', hrefFor(slug, link));
			scrollTop();
		},
		[slug, scrollTop],
	);

	return (
		<Composer
			key={`${round}:${slug}`}
			slug={slug}
			initialProduct={initialProduct}
			initialQuestions={initialQuestions}
			initialQuestionsSlug={initialQuestionsSlug}
			clinicians={clinicians}
			clinicInfo={clinicInfo}
			deepLink={deepLink}
			onSwitchVariant={switchVariant}
			onBookAnother={bookAnother}
		/>
	);
}
