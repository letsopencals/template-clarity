import { Suspense } from 'react';
import type { Metadata } from 'next';
import { VisitsView } from '@/components/account/visits/visits-view';
import { ListSkeleton } from '@/components/account/skeletons';

export const metadata: Metadata = { title: 'Visits' };

export default function Page() {
	return (
		<Suspense fallback={<ListSkeleton />}>
			<VisitsView />
		</Suspense>
	);
}
