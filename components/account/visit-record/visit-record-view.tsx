'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';
import { fetcher } from '@/lib/fetcher';
import { siteConfig } from '@/lib/site-config';
import { useNow } from '@/hooks/use-now';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { Notice } from '@/components/auth/auth-feedback';
import { getChangePolicy } from '@/components/account/appointment-detail/policy';
import { RecordSkeleton } from '@/components/account/skeletons';
import { LoadError } from '@/components/account/empty-state';
import { useCareRecord, usePersonFilter } from '@/components/account/use-care';
import { isUpcoming } from '@/components/account/care-utils';
import { PrepChecklist } from '@/components/account/overview/prep-checklist';
import { RecordHeader } from '@/components/account/visit-record/record-header';
import { PlaceCard } from '@/components/account/visit-record/place-card';
import { PreVisitNotes } from '@/components/account/visit-record/pre-visit-notes';
import { Receipt } from '@/components/account/visit-record/receipt';
import { RateYourCare } from '@/components/account/visit-record/rate-your-care';
import { RecordActions } from '@/components/account/visit-record/record-actions';
import { RescheduleDialog } from '@/components/account/visit-record/reschedule-dialog';
import { CancelDialog } from '@/components/account/visit-record/cancel-dialog';
import type { CareVisit } from '@/components/account/care-types';

const SWR_OPTIONS = { revalidateOnFocus: false } as const;

type Dialog = 'reschedule' | 'cancel' | null;

function BackLink() {
	const { hrefWith } = usePersonFilter();
	return (
		<Link
			href={hrefWith('/account/appointments')}
			className="inline-flex items-center gap-2 rounded-sm text-sm text-ink-muted transition-colors hover:text-steel focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-steel"
		>
			<svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.6}>
				<path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
			All visits
		</Link>
	);
}

/** One visit's record: appointment card, notes, clinician and place, receipt, feedback. */
export function VisitRecordView({ appointmentId }: { appointmentId: string }) {
	const key = `/api/account/appointments/${appointmentId}`;
	const { data: visit, error, isLoading, mutate } = useSWR<CareVisit>(key, fetcher, SWR_OPTIONS);
	const { mutate: mutateRecord } = useCareRecord();
	const searchParams = useSearchParams();
	const now = useNow(30_000);
	const nowMs = now?.getTime() ?? null;
	const { formatCustom } = useDateFormatter();
	const [dialog, setDialog] = useState<Dialog>(null);
	const [notice, setNotice] = useState<string | null>(null);

	const policy = visit && nowMs ? getChangePolicy(visit, nowMs) : null;

	// Email links land with ?action=reschedule|cancel — open that dialog once, then drop the param.
	const action = searchParams.get('action');
	useEffect(() => {
		if (!policy || (action !== 'reschedule' && action !== 'cancel')) return;
		if (action === 'reschedule' && policy.canReschedule) setDialog('reschedule');
		else if (action === 'cancel' && policy.canCancel) setDialog('cancel');
		else setNotice(action === 'cancel' ? 'This visit can no longer be cancelled online. Please call the clinic.' : 'This visit’s time can no longer be changed online. Please call the clinic.');
		const url = new URL(window.location.href);
		url.searchParams.delete('action');
		window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}`);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [action, !!policy]);

	const refresh = useCallback(async () => {
		await Promise.all([mutate(), mutateRecord()]);
	}, [mutate, mutateRecord]);

	const close = useCallback(() => setDialog(null), []);
	const rescheduled = useCallback(
		(fromIso: string) => {
			setDialog(null);
			setNotice(`Your visit has moved to ${formatCustom(fromIso, 'dddd D MMMM [at] h:mm A')}. We’ve emailed you the details.`);
			void refresh();
		},
		[formatCustom, refresh],
	);
	const canceled = useCallback(() => {
		setDialog(null);
		setNotice('Your visit is cancelled. We’ve emailed you a confirmation.');
		void refresh();
	}, [refresh]);

	if (error && !visit) {
		return (
			<div className="space-y-6">
				<BackLink />
				<LoadError what="this visit" onRetry={() => void mutate()} />
			</div>
		);
	}
	if (isLoading || !visit || !nowMs || !policy) {
		return (
			<div className="space-y-6">
				<BackLink />
				<RecordSkeleton />
			</div>
		);
	}

	const upcoming = isUpcoming(visit, nowMs);
	const completed = visit.status === 'completed';

	return (
		<div className="space-y-6">
			<BackLink />
			{notice ? <Notice tone="success">{notice}</Notice> : null}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-8">
				<div className="min-w-0 space-y-6">
					<RecordHeader visit={visit} nowMs={nowMs} upcoming={upcoming} />
					{upcoming ? <PrepChecklist appointmentId={visit.id} department={visit.department} video={visit.video} /> : null}
					<PreVisitNotes answers={visit.answers} />
					{completed ? <RateYourCare appointmentId={visit.id} feedback={visit.feedback} onSaved={() => void refresh()} /> : null}
				</div>
				<div className="min-w-0 space-y-6">
					<PlaceCard visit={visit} nowMs={nowMs} upcoming={upcoming} />
					<RecordActions visit={visit} upcoming={upcoming} policy={policy} onReschedule={() => setDialog('reschedule')} onCancel={() => setDialog('cancel')} />
					<Receipt visit={visit} />
					{upcoming ? <p className="px-1 text-xs leading-relaxed text-ink-dim">{siteConfig.emergency.long}</p> : null}
				</div>
			</div>
			{policy.canReschedule ? <RescheduleDialog visit={visit} open={dialog === 'reschedule'} onClose={close} onDone={rescheduled} /> : null}
			{policy.canCancel ? <CancelDialog visit={visit} open={dialog === 'cancel'} onClose={close} onDone={canceled} /> : null}
		</div>
	);
}
