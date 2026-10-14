import type { Metadata } from 'next';
import { getCheckoutQuestions, getClinicians, getClinics, getProduct } from '@/lib/server-data';
import { BookingView } from '@/components/booking/booking-view';
import type { ClinicInfo } from '@/components/booking/seen-picker';
import type { BookingDeepLink } from '@/hooks/use-booking-flow';
import type { VisitFor } from '@/lib/intake';

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? null;

function readDeepLink(sp: Record<string, string | string[] | undefined>): BookingDeepLink {
	const forParam = one(sp.for);
	const mode = one(sp.mode);
	return {
		visitFor: forParam === 'self' || forParam === 'child' || forParam === 'other' ? (forParam as VisitFor) : null,
		mode: mode === 'clinic' || mode === 'video' ? mode : null,
		staff: one(sp.staff),
	};
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
	const { slug } = await params;
	const product = await getProduct(slug);
	const variant = product?.variants?.find((v) => v.slug === slug) ?? product?.variants?.[0];
	return variant ? { title: `Book: ${variant.title}` } : {};
}

// RSC: product, clinicians, clinics and the variant's pre-visit questions are
// read on the server and seed the composer (no loading flash). The slug is a
// variant slug; a group slug falls back to its first variant.
export default async function BookingPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
	const [{ slug }, sp] = await Promise.all([params, searchParams]);
	const product = await getProduct(slug);
	const variant = product?.variants?.find((v) => v.slug === slug) ?? product?.variants?.[0] ?? null;

	const [allClinicians, clinics, questions] = await Promise.all([
		getClinicians(),
		getClinics(),
		variant ? getCheckoutQuestions(variant.id) : Promise.resolve([]),
	]);

	// Only the people who deliver this product (any variant) travel to the client.
	const staffIds = new Set((product?.variants ?? []).flatMap((v) => (v.staffMembers ?? []).map((s) => s.id)));
	const clinicians = allClinicians.filter((c) => staffIds.has(c.id));
	const clinicInfo: Record<string, ClinicInfo> = Object.fromEntries(
		clinics.map((c) => [c.id, { title: c.title, addressLines: c.addressLines }]),
	);

	return (
		<BookingView
			slug={slug}
			initialProduct={product}
			initialQuestions={questions}
			initialQuestionsSlug={variant?.slug ?? null}
			clinicians={clinicians}
			clinicInfo={clinicInfo}
			deepLink={readDeepLink(sp)}
		/>
	);
}
