'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { onSessionExpired } from '@/lib/session-expired';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { Notice } from '@/components/auth/auth-feedback';
import { formatGap } from '@/components/account/appointment-detail/policy';
import { serviceTitle } from '@/components/account/care-utils';
import type { CareVisit } from '@/components/account/care-types';

/** Confirm a cancellation. Plain language; the clinic is told automatically. */
export function CancelDialog({ visit, open, onClose, onDone }: { visit: CareVisit; open: boolean; onClose: () => void; onDone: () => void }) {
	const { formatCustom } = useDateFormatter();
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const confirm = async () => {
		setSaving(true);
		setError(null);
		try {
			const res = await fetch(`/api/account/appointments/${visit.id}/cancel`, { method: 'PUT' });
			if (res.status === 401) {
				onSessionExpired();
				return;
			}
			if (!res.ok) {
				const body = (await res.json().catch(() => null)) as { error?: string } | null;
				setError(body?.error || 'We couldn’t cancel this visit. Please call the clinic.');
				return;
			}
			onDone();
		} catch {
			setError('We couldn’t reach the clinic. Please try again.');
		} finally {
			setSaving(false);
		}
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			size="sm"
			title="Cancel this visit?"
			description={`${serviceTitle(visit)} · ${formatCustom(visit.from, 'dddd D MMMM, h:mm A')}`}
			footer={
				<>
					<Button variant="ghost" onClick={onClose} disabled={saving}>
						Keep my visit
					</Button>
					<button
						type="button"
						onClick={() => void confirm()}
						disabled={saving}
						className="inline-flex h-11 items-center justify-center rounded-full bg-clay px-6 text-sm font-semibold text-white transition-colors hover:bg-clay/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay disabled:opacity-50"
					>
						{saving ? 'Cancelling…' : 'Cancel visit'}
					</button>
				</>
			}
		>
			{error ? <Notice className="mb-4">{error}</Notice> : null}
			<p className="prose-calm text-[15px] text-ink-muted">
				We’ll let {visit.clinician ? visit.clinician.firstName || visit.clinician.name : 'the clinic'} know and free up the time for someone else.
				{visit.product.cancelGap ? ` Visits can be cancelled up to ${formatGap(visit.product.cancelGap)} before they start.` : ''}
			</p>
			{visit.charge && visit.charge.paidTotal > 0 ? (
				<p className="mt-4 rounded-field bg-cream px-4 py-3 text-sm text-ink-muted">Any refund follows the clinic’s policy and goes back to how you paid.</p>
			) : null}
		</Dialog>
	);
}
