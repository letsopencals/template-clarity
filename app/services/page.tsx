import type { Metadata } from 'next';
import Link from 'next/link';
import { getCatalog } from '@/lib/catalog-server';
import { PageHero } from '@/components/layout/page-hero';
import { FeeSchedule } from '@/components/services/fee-schedule';
import { buttonClasses } from '@/components/ui/button';

export const metadata: Metadata = {
	title: 'Visits & fees',
	description: 'Every visit at Clear Care Medical, how long it takes and what it costs — clear self-pay prices, up front.',
};

export default async function ServicesPage() {
	const { visits, departments, currency } = await getCatalog();
	const placed = new Set(departments.flatMap((d) => d.visits.map((v) => v.slug)));
	const other = visits.filter((v) => !placed.has(v.slug));

	return (
		<>
			<PageHero
				eyebrow="Visits & fees"
				title={
					<>
						Clear prices, <em>no surprises.</em>
					</>
				}
				lead="Every visit we offer, how long it takes and the self-pay fee. Most insurance is accepted — add your provider in your pre-visit notes and we’ll check before you arrive."
			>
				<Link href="/care" className={buttonClasses({ variant: 'outline', size: 'lg' })}>
					Not sure which? Find care
				</Link>
			</PageHero>
			<section className="section-y bg-paper pt-12">
				<div className="container-x">
					{visits.length ? (
						<FeeSchedule departments={departments} other={other} currency={currency} />
					) : (
						<p className="rounded-card border border-dashed border-line-strong p-10 text-center text-ink-muted">
							We couldn’t load our fees just now. Please try again in a moment, or call us.
						</p>
					)}
				</div>
			</section>
		</>
	);
}
