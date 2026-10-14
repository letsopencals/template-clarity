import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getDepartmentIndex } from '@/lib/server-data';
import { ThankYouView } from '@/components/booking/thank-you/thank-you-view';

export const metadata: Metadata = {
	title: 'Your visit pass',
	robots: { index: false, follow: false },
};

export default async function ThankYouPage() {
	const departments = await getDepartmentIndex().catch(() => ({}));
	return (
		<Suspense fallback={<div className="min-h-screen bg-paper" aria-busy="true" />}>
			<ThankYouView departments={departments} />
		</Suspense>
	);
}
