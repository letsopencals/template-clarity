import type { MetadataRoute } from 'next';
import { getCatalog } from '@/lib/catalog-server';
import { getClinicians } from '@/lib/server-data';
import { siteConfig } from '@/lib/site-config';

type Entry = MetadataRoute.Sitemap[number];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const base = siteConfig.url;
	const now = new Date();
	const page = (path: string, priority: number, changeFrequency: Entry['changeFrequency'] = 'weekly'): Entry => ({
		url: `${base}${path}`,
		lastModified: now,
		changeFrequency,
		priority,
	});

	const staticRoutes = [
		page('', 1),
		page('/care', 0.9),
		page('/departments', 0.9),
		page('/services', 0.8),
		page('/clinicians', 0.8),
		page('/video-visits', 0.8),
		page('/about', 0.6, 'monthly'),
		page('/contact', 0.7, 'monthly'),
	];

	// Both helpers swallow API errors and return empty lists.
	const [{ visits, departments }, clinicians] = await Promise.all([getCatalog(), getClinicians()]);
	const departmentSlugs = departments.length ? departments.map((d) => d.slug) : Object.keys(siteConfig.departments);

	return [
		...staticRoutes,
		...departmentSlugs.map((slug) => page(`/departments/${slug}`, 0.8)),
		...clinicians.map((c) => page(`/clinicians/${c.slug}`, c.curated ? 0.7 : 0.5, 'monthly')),
		...visits.map((v) => page(`/booking/${v.slug}`, 0.7)),
	];
}
