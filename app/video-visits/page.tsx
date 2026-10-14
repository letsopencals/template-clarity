import type { Metadata } from 'next';
import Link from 'next/link';
import { getCatalog } from '@/lib/catalog-server';
import { siteConfig } from '@/lib/site-config';
import { imagePath } from '@/lib/catalog';
import { PageHero } from '@/components/layout/page-hero';
import { buttonClasses } from '@/components/ui/button';
import { FaqAccordion } from '@/components/ui/faq-accordion';
import { VideoServices } from '@/components/video/video-services';
import { VideoSteps } from '@/components/video/video-steps';
import { VideoFit } from '@/components/video/video-fit';
import { DeviceCheck } from '@/components/video/device-check';

const { videoVisit } = siteConfig;

export const metadata: Metadata = {
	title: 'Video visits',
	description: videoVisit.body,
};

export default async function VideoVisitsPage() {
	const { visits, departments, currency } = await getCatalog();
	const video = visits.filter((v) => v.video);
	const labels = Object.fromEntries(departments.map((d) => [d.slug, d.short]));

	return (
		<>
			<PageHero
				eyebrow={videoVisit.eyebrow}
				title={
					<>
						{videoVisit.title} <em>{videoVisit.accent}</em>
					</>
				}
				lead={videoVisit.body}
				image={imagePath(videoVisit.image)}
				imageAlt="A patient on a video visit with a Clear Care clinician"
				imageChildren={
					<span className="absolute left-5 top-5 z-[3] inline-flex items-center gap-2 rounded-full bg-paper/90 px-3 py-1.5 text-[12px] font-medium text-ink shadow-card">
						<span className="live-dot" aria-hidden />
						Encrypted · never recorded
					</span>
				}
			>
				<div className="flex flex-wrap items-center gap-3">
					<Link href="#video-services" className={buttonClasses({ size: 'lg' })}>
						Book a video visit
					</Link>
					<Link href="#device-check" className={buttonClasses({ variant: 'outline', size: 'lg' })}>
						Check your camera
					</Link>
				</div>
			</PageHero>
			<VideoServices visits={video} currency={currency} departmentLabel={labels} />
			<VideoSteps />
			<section className="section-y bg-paper">
				<div className="container-x">
					<DeviceCheck />
				</div>
			</section>
			<VideoFit />
			<section className="section-y bg-paper">
				<div className="container-x grid grid-cols-1 gap-12 lg:grid-cols-12">
					<div className="min-w-0 lg:col-span-4">
						<p className="eyebrow text-oak">Questions</p>
						<h2 className="display-sm mt-4 text-ink">
							About <em>video visits.</em>
						</h2>
					</div>
					<div className="min-w-0 lg:col-span-8">
						<FaqAccordion items={videoVisit.faqs} />
					</div>
				</div>
			</section>
		</>
	);
}
