'use client';

import { motion } from 'framer-motion';
import { siteConfig } from '@/lib/site-config';

const spanClass: Record<'tall' | 'square' | 'wide', string> = {
	tall: 'sm:row-span-2',
	square: '',
	wide: 'sm:col-span-2',
};

export function ClinicGallery() {
	const { lookbook } = siteConfig;

	return (
		<section className="bg-[var(--color-bg)] py-20 lg:py-28">
			<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
				<div className="max-w-2xl">
					<span className="chip">{lookbook.eyebrow}</span>
					<h2 className="heading-display mt-5 text-4xl text-[var(--color-ink)] lg:text-5xl">{lookbook.heading}</h2>
					<p className="mt-5 text-lg leading-relaxed text-[var(--color-ink-muted)]">{lookbook.body}</p>
				</div>

				<div className="mt-12 grid auto-rows-[200px] grid-cols-1 gap-4 sm:grid-cols-2 lg:auto-rows-[220px] lg:grid-cols-4">
					{lookbook.frames.map((frame, i) => (
						<motion.figure
							key={frame.image}
							initial={{ opacity: 0, scale: 0.98 }}
							whileInView={{ opacity: 1, scale: 1 }}
							viewport={{ once: true, margin: '-40px' }}
							transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
							className={`group relative overflow-hidden rounded-3xl border border-[var(--color-line)] card-shadow ${spanClass[frame.size]}`}
						>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={`/images/${frame.image}`}
								alt={frame.caption}
								className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
							/>
							<figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-5 text-sm font-medium text-white">
								{frame.caption}
							</figcaption>
						</motion.figure>
					))}
				</div>
			</div>
		</section>
	);
}
