import type { Metadata } from 'next';
import { getClinicians, getClinics } from '@/lib/server-data';
import { getCatalog } from '@/lib/catalog-server';
import { PageHero } from '@/components/layout/page-hero';
import { ClinicianDirectory } from '@/components/clinicians/clinician-directory';
import { toClinicViews } from '@/components/contact/clinic-view';

export const metadata: Metadata = {
	title: 'Clinicians',
	description: 'Meet the doctors, nurses and therapists at Clear Care Medical — filter by department, clinic or video visits.',
};

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? null;

export default async function CliniciansPage({ searchParams }: { searchParams: SP }) {
	const [sp, clinicians, clinics, { departments }] = await Promise.all([searchParams, getClinicians(), getClinics(), getCatalog()]);
	const deptOptions = departments.map((d) => ({ value: d.slug, label: d.short }));
	const clinicOptions = toClinicViews(clinics).map((c) => ({ value: c.slug, label: c.name }));
	const department = one(sp.department);
	const clinic = one(sp.clinic);

	return (
		<>
			<PageHero
				eyebrow="Clinicians"
				title={
					<>
						The people <em>who listen.</em>
					</>
				}
				lead={`${clinicians.length || 'Eighty'} doctors, nurses and therapists across nine departments and three clinics. Choose someone you’ve seen before, or someone new.`}
			/>
			<section className="section-y bg-paper pt-12">
				<div className="container-x">
					{clinicians.length ? (
						<ClinicianDirectory
							clinicians={clinicians}
							departments={deptOptions}
							clinics={clinicOptions}
							initial={{
								department: department && deptOptions.some((d) => d.value === department) ? department : null,
								clinic: clinic && clinicOptions.some((c) => c.value === clinic) ? clinic : null,
								video: one(sp.video) === '1',
								q: one(sp.q)?.slice(0, 80) ?? '',
							}}
						/>
					) : (
						<p className="rounded-card border border-dashed border-line-strong p-10 text-center text-ink-muted">
							We couldn’t load our clinicians just now. Please try again in a moment.
						</p>
					)}
				</div>
			</section>
		</>
	);
}
