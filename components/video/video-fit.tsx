import { Reveal } from '@/components/motion/reveal';
import { DepartmentIcon } from '@/components/ui/department-icon';
import { EmergencyNotice } from '@/components/care/emergency-notice';
import { siteConfig } from '@/lib/site-config';

/** Honest guidance: what works well by video and what needs a room. */
export function VideoFit() {
	const { goodFor, notFor } = siteConfig.videoVisit;
	return (
		<section className="section-y bg-cream">
			<div className="container-x">
				<p className="eyebrow text-oak">Is video right for this?</p>
				<h2 className="display-md mt-4 max-w-3xl text-ink">
					Good by video, <em>better in person.</em>
				</h2>
				<div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
					<Reveal className="paper min-w-0 p-8 md:p-10">
						<p className="inline-flex items-center gap-2 text-sm font-semibold text-sage-deep">
							<DepartmentIcon name="video" className="h-4 w-4" />
							Works well by video
						</p>
						<ul className="ruled mt-6">
							{goodFor.map((g) => (
								<li key={g} className="flex min-h-[2.1rem] items-center gap-3 text-[16px] text-ink">
									<DepartmentIcon name="check" className="h-4 w-4 shrink-0 text-sage-deep" />
									{g}
								</li>
							))}
						</ul>
					</Reveal>
					<Reveal delay={0.08} className="paper min-w-0 p-8 md:p-10">
						<p className="inline-flex items-center gap-2 text-sm font-semibold text-oak">
							<DepartmentIcon name="pin" className="h-4 w-4" />
							Better in one of our clinics
						</p>
						<ul className="ruled mt-6">
							{notFor.map((g) => (
								<li key={g} className="flex min-h-[2.1rem] items-center gap-3 text-[16px] text-ink">
									<span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />
									{g}
								</li>
							))}
						</ul>
					</Reveal>
				</div>
				<EmergencyNotice className="mt-8" />
			</div>
		</section>
	);
}
