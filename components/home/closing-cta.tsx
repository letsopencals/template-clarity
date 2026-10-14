'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useInView } from 'framer-motion';
import { CareLine } from '@/components/motifs/care-line';
import { buttonClasses } from '@/components/ui/button';
import { MagneticButton } from '@/components/motion/magnetic-button';
import { siteConfig } from '@/lib/site-config';

const { closing } = siteConfig;

/** "Booked. *Breathe.*" — the care line draws its pulse, then settles flat. */
export function ClosingCta() {
	const ref = useRef<HTMLElement>(null);
	const inView = useInView(ref, { once: true, margin: '0px 0px -30% 0px' });
	return (
		<section ref={ref} id="book-cta" className="grain relative overflow-hidden bg-cream">
			<div className="container-x section-y relative z-10 flex flex-col items-center text-center">
				<CareLine settled={inView} tone="steel" className="mb-14 h-12 max-w-4xl" />
				<h2 className="display-xl text-ink">
					{closing.lead} <em>{closing.accent}</em>
				</h2>
				<p className="mt-7 max-w-[40ch] text-[17px] leading-relaxed text-ink-muted">{closing.body}</p>
				<div className="mt-10 flex flex-wrap items-center justify-center gap-3">
					<MagneticButton>
						<Link href="/care" className={buttonClasses({ variant: 'primary', size: 'lg' })}>
							Find care
						</Link>
					</MagneticButton>
					<Link href="/services" className={buttonClasses({ variant: 'outline', size: 'lg' })}>
						Visits & fees
					</Link>
				</div>
				<p className="mt-10 text-[13px] text-clay">{siteConfig.emergency.short}</p>
			</div>
		</section>
	);
}
