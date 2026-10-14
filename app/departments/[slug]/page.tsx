import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCatalog } from '@/lib/catalog-server';
import { getClinicians } from '@/lib/server-data';
import { siteConfig } from '@/lib/site-config';
import { DepartmentHero } from '@/components/departments/department-hero';
import { DepartmentTreats } from '@/components/departments/department-treats';
import { DepartmentVisits } from '@/components/departments/department-visits';
import { DepartmentClinicians } from '@/components/departments/department-clinicians';
import { DepartmentFaq } from '@/components/departments/department-faq';

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
	return Object.keys(siteConfig.departments).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
	const { slug } = await params;
	const { departments } = await getCatalog();
	const d = departments.find((x) => x.slug === slug);
	const content = siteConfig.departments[slug];
	if (!d && !content) return { title: 'Department' };
	return {
		title: d?.title ?? content?.short,
		description: content?.intro ?? d?.tagline ?? undefined,
	};
}

export default async function DepartmentPage({ params }: { params: Params }) {
	const { slug } = await params;
	const [{ departments, currency }, clinicians] = await Promise.all([getCatalog(), getClinicians()]);
	const index = departments.findIndex((x) => x.slug === slug);
	const department = departments[index];
	if (!department) notFound();
	const team = clinicians.filter((c) => c.departments.includes(slug));
	const next = departments.length > 1 ? departments[(index + 1) % departments.length]! : null;

	return (
		<>
			<DepartmentHero department={department} currency={currency} clinicianCount={team.length} />
			<DepartmentTreats slug={slug} title={department.short} treats={department.treats} video={department.video} />
			<DepartmentVisits visits={department.visits} currency={currency} title={department.short} />
			<DepartmentClinicians clinicians={team} slug={slug} short={department.short} />
			<DepartmentFaq department={department} next={next} />
		</>
	);
}
