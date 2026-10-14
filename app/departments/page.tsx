import type { Metadata } from 'next';
import Link from 'next/link';
import { getCatalog } from '@/lib/catalog-server';
import { PageHero } from '@/components/layout/page-hero';
import { DepartmentIndex } from '@/components/departments/department-index';
import { EmergencyNotice } from '@/components/care/emergency-notice';
import { buttonClasses } from '@/components/ui/button';

export const metadata: Metadata = {
	title: 'Departments',
	description: 'Nine departments under one roof — general medicine to mental health — with clear fees, unhurried visits and video where it works.',
};

export default async function DepartmentsPage() {
	const { departments, currency } = await getCatalog();
	return (
		<>
			<PageHero
				eyebrow="Departments · Rooms of care"
				title={
					<>
						Nine rooms, <em>one practice.</em>
					</>
				}
				lead="Every department shares the same calm rooms, the same notes and the same promise: time to listen. Step inside one, or let the Care Finder choose for you."
			>
				<div className="flex flex-wrap items-center gap-3">
					<Link href="/care" className={buttonClasses({ size: 'lg' })}>
						Find the right care
					</Link>
					<Link href="/services" className={buttonClasses({ variant: 'outline', size: 'lg' })}>
						All visits & fees
					</Link>
				</div>
			</PageHero>
			<section className="section-y bg-paper">
				<div className="container-x">
					{departments.length ? (
						<DepartmentIndex departments={departments} currency={currency} />
					) : (
						<p className="rounded-card border border-dashed border-line-strong p-10 text-center text-ink-muted">
							Our departments are taking a short break from the internet. Please call us and we’ll book you in.
						</p>
					)}
					<EmergencyNotice className="mt-16" />
				</div>
			</section>
		</>
	);
}
