import { getClinicians, getClinics } from '@/lib/server-data';
import { getCatalog } from '@/lib/catalog-server';
import { formatFee } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';
import { Hero } from '@/components/home/hero';
import { RoomsOfCare, type RoomItem } from '@/components/home/rooms-of-care';
import { Journey } from '@/components/home/journey';
import { CliniciansRail } from '@/components/home/clinicians-rail';
import { VideoBand } from '@/components/home/video-band';
import { ClinicsSection } from '@/components/home/clinics-section';
import { Testimonials } from '@/components/home/testimonials';
import { TrustMarkers } from '@/components/home/trust-markers';
import { HomeFaq } from '@/components/home/home-faq';
import { ClosingCta } from '@/components/home/closing-cta';
import { toClinicViews } from '@/components/contact/clinic-view';

export default async function HomePage() {
	const [{ departments, visits, currency }, clinicians, clinics] = await Promise.all([getCatalog(), getClinicians(), getClinics()]);

	const rooms: RoomItem[] = departments.map((d) => ({
		slug: d.slug,
		title: d.short,
		tagline: d.tagline,
		image: d.image,
		icon: d.icon,
		fromLabel: d.fromPrice != null ? formatFee(d.fromPrice, currency) : null,
		video: d.video,
		count: d.visits.length,
	}));

	const bySlug = new Map(clinicians.map((c) => [c.slug, c]));
	const featured = siteConfig.featuredClinicians.map((s) => bySlug.get(s)).filter((c) => !!c);
	const rail = featured.length >= 4 ? featured : [...featured, ...clinicians.filter((c) => c.imageUrl && !featured.includes(c))].slice(0, 6);

	return (
		<>
			<Hero />
			<RoomsOfCare rooms={rooms} />
			<Journey />
			<CliniciansRail clinicians={rail} total={clinicians.length} />
			<VideoBand count={visits.filter((v) => v.video).length} />
			<ClinicsSection clinics={toClinicViews(clinics)} />
			<Testimonials />
			<TrustMarkers />
			<HomeFaq />
			<ClosingCta />
		</>
	);
}
