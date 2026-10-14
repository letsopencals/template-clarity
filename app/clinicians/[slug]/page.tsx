import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getClinician, getClinicians } from '@/lib/server-data';
import { getCatalog } from '@/lib/catalog-server';
import { ClinicianProfile } from '@/components/clinicians/clinician-profile';
import { ClinicianVisits } from '@/components/clinicians/clinician-visits';
import { DepartmentClinicians } from '@/components/departments/department-clinicians';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
	const { slug } = await params;
	const c = await getClinician(slug);
	if (!c) return { title: 'Clinician' };
	return { title: `${c.name} · ${c.title}`, description: c.bio ?? `Book a visit with ${c.name} at Clear Care Medical.` };
}

export default async function ClinicianPage({ params }: { params: Params }) {
	const { slug } = await params;
	const [clinician, all, { visits, departments, currency }] = await Promise.all([getClinician(slug), getClinicians(), getCatalog()]);
	if (!clinician) notFound();

	const theirs = clinician.services.length ? visits.filter((v) => clinician.services.includes(v.slug)) : [];
	const depts = departments.filter((d) => clinician.departments.includes(d.slug)).map((d) => ({ slug: d.slug, short: d.short }));
	const primary = depts[0];
	const colleagues = primary ? all.filter((c) => c.id !== clinician.id && c.departments.includes(primary.slug)) : [];

	return (
		<>
			<ClinicianProfile clinician={clinician} departments={depts} firstVisit={theirs[0]?.slug ?? null} />
			<ClinicianVisits clinician={clinician} visits={theirs} currency={currency} />
			{primary ? <DepartmentClinicians clinicians={colleagues} slug={primary.slug} short={primary.short} /> : null}
		</>
	);
}
