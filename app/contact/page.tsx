import type { Metadata } from 'next';
import Link from 'next/link';
import { getClinics } from '@/lib/server-data';
import { PageHero } from '@/components/layout/page-hero';
import { ContactLines } from '@/components/contact/contact-lines';
import { ClinicDirectory } from '@/components/contact/clinic-directory';
import { toClinicViews } from '@/components/contact/clinic-view';
import { buttonClasses } from '@/components/ui/button';

export const metadata: Metadata = {
	title: 'Clinics & contact',
	description: 'Our three clinics, opening hours and directions — plus the front desk, nurse line and emergency information.',
};

export default async function ContactPage() {
	const clinics = toClinicViews(await getClinics());
	return (
		<>
			<PageHero
				eyebrow="Clinics & contact"
				title={
					<>
						A real person, <em>every time.</em>
					</>
				}
				lead="Call, email, or walk into one of our three clinics. If you already know what you need, booking online is the quickest way in."
				line={false}
			>
				<Link href="/care" className={buttonClasses({ size: 'lg' })}>
					Find care
				</Link>
			</PageHero>
			<ContactLines />
			<ClinicDirectory clinics={clinics} />
		</>
	);
}
