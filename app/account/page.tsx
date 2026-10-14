import { Suspense } from 'react';
import type { Metadata } from 'next';
import { OverviewView } from '@/components/account/overview/overview-view';
import { OverviewSkeleton } from '@/components/account/skeletons';

export const metadata: Metadata = { title: 'Overview' };

export default function Page() {
	return (
		<Suspense fallback={<OverviewSkeleton />}>
			<OverviewView />
		</Suspense>
	);
}
