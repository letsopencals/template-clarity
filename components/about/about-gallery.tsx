import { clsx } from 'clsx';
import { WindowFrame } from '@/components/motifs/window-frame';
import { imagePath } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';

const SHAPES = ['aspect-[4/5]', 'aspect-[4/3]', 'aspect-[4/5]', 'aspect-[4/3]', 'aspect-[4/5]', 'aspect-[4/3]'];

/** A walk through the rooms: six windows, staggered like a corridor. */
export function AboutGallery() {
	return (
		<section className="section-y bg-paper">
			<div className="container-x">
				<p className="eyebrow text-oak">Inside the practice</p>
				<h2 className="display-md mt-4 text-ink">
					Rooms with <em>daylight.</em>
				</h2>
				<ul className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{siteConfig.about.gallery.map((g, i) => (
						<li key={g.image} className={clsx('min-w-0', i % 3 === 1 && 'lg:mt-16')}>
							<WindowFrame src={imagePath(g.image)} alt={g.caption} aspect={SHAPES[i % SHAPES.length]} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw" daylight={i === 0}>
								<span className="scrim-bottom absolute inset-x-0 bottom-0 z-[2] h-1/3" aria-hidden />
								<span className="absolute bottom-4 left-5 z-[3] font-display text-lg italic text-paper">{g.caption}</span>
							</WindowFrame>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
