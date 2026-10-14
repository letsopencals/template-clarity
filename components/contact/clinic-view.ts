import type { PublicClinic } from '@/lib/server-data';
import { imagePath } from '@/lib/catalog';
import { clinicMeta } from '@/lib/site-config';

export interface ClinicView {
	id: string;
	slug: string;
	/** "Chicago" (from "Clear Care Medical — Chicago"). */
	name: string;
	title: string;
	addressLines: string[];
	image: string;
	tagline: string;
	note: string;
	timezone?: string;
	mapHref: string;
}

/** Physical clinics only, with photography and copy from siteConfig. Server-safe pure mapper. */
export function toClinicViews(clinics: PublicClinic[]): ClinicView[] {
	return clinics
		.filter((c) => c.type !== 'online')
		.map((c, i) => {
			const meta = clinicMeta(c.slug, i);
			const name = c.title.split(/\s+[—–-]\s+/).pop() || c.city || c.title;
			const query = c.latitude != null && c.longitude != null ? `${c.latitude},${c.longitude}` : [c.title, ...c.addressLines].join(', ');
			return {
				id: c.id,
				slug: c.slug,
				name,
				title: c.title,
				addressLines: c.addressLines,
				image: imagePath(meta.image),
				tagline: meta.tagline,
				note: meta.note,
				timezone: meta.timezone,
				mapHref: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
			};
		});
}
