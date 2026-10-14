import { Suspense } from 'react';
import type { Metadata } from 'next';
import { VisitRecordView } from '@/components/account/visit-record/visit-record-view';
import { RecordSkeleton } from '@/components/account/skeletons';

export const metadata: Metadata = { title: 'Visit' };

export default async function Page({ params }: { params: Promise<{ appointmentId: string }> }) {
	const { appointmentId } = await params;
	return (
		<Suspense fallback={<RecordSkeleton />}>
			<VisitRecordView appointmentId={appointmentId} />
		</Suspense>
	);
}
