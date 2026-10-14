import type { Metadata } from 'next';
import { getClinicians } from '@/lib/server-data';
import { siteConfig } from '@/lib/site-config';
import { imagePath } from '@/lib/catalog';
import { PageHero } from '@/components/layout/page-hero';
import { AboutStory } from '@/components/about/about-story';
import { AboutValues } from '@/components/about/about-values';
import { AboutGallery } from '@/components/about/about-gallery';
import { AboutTeam } from '@/components/about/about-team';
import { ClosingCta } from '@/components/home/closing-cta';

const { about } = siteConfig;

export const metadata: Metadata = {
	title: 'About',
	description: about.body,
};

export default async function AboutPage() {
	const clinicians = await getClinicians();
	const team = clinicians.filter((c) => c.curated && c.imageUrl).slice(0, 8);

	return (
		<>
			<PageHero
				eyebrow={about.eyebrow}
				title={
					<>
						{about.lead} <em>{about.accent}</em>
					</>
				}
				lead={about.body}
				image={imagePath(about.trustImage)}
				imageAlt="A Clear Care clinician with a patient"
			/>
			<AboutStory />
			<AboutValues />
			<AboutGallery />
			<AboutTeam clinicians={team} total={clinicians.length || 80} />
			<ClosingCta />
		</>
	);
}
