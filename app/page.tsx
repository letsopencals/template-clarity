import { Hero } from '@/components/home/hero';
import { DepartmentsGrid } from '@/components/home/departments-grid';
import { TrustBand } from '@/components/home/trust-band';
import { LocationsStrip } from '@/components/home/locations-strip';
import { DoctorsShowcase } from '@/components/home/doctors-showcase';
import { ClinicGallery } from '@/components/home/clinic-gallery';
import { HowItWorks } from '@/components/home/how-it-works';
import { TelehealthBand } from '@/components/home/telehealth-band';
import { Testimonials } from '@/components/home/testimonials';
import { FaqSection } from '@/components/home/faq-section';
import { CtaBand } from '@/components/home/cta-band';

export default function HomePage() {
	return (
		<>
			<Hero />
			<DepartmentsGrid />
			<TrustBand />
			<LocationsStrip />
			<DoctorsShowcase />
			<ClinicGallery />
			<HowItWorks />
			<TelehealthBand />
			<Testimonials />
			<FaqSection />
			<CtaBand />
		</>
	);
}
