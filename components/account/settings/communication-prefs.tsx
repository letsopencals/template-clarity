'use client';

import { memo, useState } from 'react';
import useSWR from 'swr';
import { clsx } from 'clsx';
import { fetcher } from '@/lib/fetcher';
import { useSettings } from '@/contexts/settings-context';
import { Notice } from '@/components/auth/auth-feedback';
import { sendJson } from '@/components/auth/post-json';
import { onSessionExpired } from '@/lib/session-expired';
import { Bone } from '@/components/account/skeletons';
import { SettingsCard } from '@/components/account/settings/settings-card';
import type { CareConsent } from '@/components/account/care-types';

const KEY = '/api/account/marketing-consent';
const SWR_OPTIONS = { revalidateOnFocus: false } as const;

type Channel = keyof CareConsent;

const CHANNELS: Array<{ key: Channel; setting: 'emailMarketingOptIn' | 'smsMarketingOptIn' | 'whatsappMarketingOptIn'; label: string; body: string }> = [
	{ key: 'email', setting: 'emailMarketingOptIn', label: 'Email', body: 'Seasonal health reminders, new clinics and the occasional newsletter.' },
	{ key: 'sms', setting: 'smsMarketingOptIn', label: 'Text message', body: 'Short notes about vaccination drives and open appointment days.' },
	{ key: 'whatsapp', setting: 'whatsappMarketingOptIn', label: 'WhatsApp', body: 'The same news, sent on WhatsApp.' },
];

/** Which channels the store lets patients manage from their account. */
export function useManagedChannels() {
	const { settings } = useSettings();
	const cs = settings?.checkoutSettings;
	return CHANNELS.filter((c) => cs?.[c.setting] === 'checkout_and_account');
}

const ChannelSwitch = memo(function ChannelSwitch({
	id,
	label,
	body,
	checked,
	disabled,
	onToggle,
}: {
	id: string;
	label: string;
	body: string;
	checked: boolean;
	disabled: boolean;
	onToggle: () => void;
}) {
	return (
		<div className="flex items-start justify-between gap-6 border-b border-line py-4 first:pt-0 last:border-b-0 last:pb-0">
			<div className="min-w-0">
				<p id={`${id}-label`} className="text-sm font-semibold text-ink">
					{label}
				</p>
				<p id={`${id}-body`} className="mt-1 text-sm text-ink-muted">
					{body}
				</p>
			</div>
			<button
				type="button"
				role="switch"
				aria-checked={checked}
				aria-labelledby={`${id}-label`}
				aria-describedby={`${id}-body`}
				disabled={disabled}
				onClick={onToggle}
				className={clsx(
					'relative mt-0.5 inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-steel disabled:opacity-50',
					checked ? 'border-steel bg-steel' : 'border-line-strong bg-cream',
				)}
			>
				<span aria-hidden className={clsx('block size-5 rounded-full bg-card shadow-sm transition-transform duration-200 motion-reduce:transition-none', checked ? 'translate-x-[1.35rem]' : 'translate-x-[0.2rem]')} />
			</button>
		</div>
	);
});

/** Marketing consent per channel. Visit reminders and confirmations are separate and always sent. */
export function CommunicationPrefs() {
	const channels = useManagedChannels();
	const { data, error, mutate } = useSWR<CareConsent>(channels.length ? KEY : null, fetcher, SWR_OPTIONS);
	const [saving, setSaving] = useState<Channel | null>(null);
	const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

	if (!channels.length) return null;

	const toggle = async (channel: Channel) => {
		if (!data) return;
		const next = data[channel] !== 'subscribed';
		setSaving(channel);
		setMessage(null);
		const optimistic: CareConsent = { ...data, [channel]: next ? 'subscribed' : 'unsubscribed' };
		await mutate(optimistic, { revalidate: false });
		const res = await sendJson(KEY, { [channel]: next }, 'PUT');
		setSaving(null);
		if (res.ok) {
			await mutate();
			setMessage({ tone: 'success', text: next ? 'Thanks — you’re subscribed.' : 'Done. You won’t receive these any more.' });
			return;
		}
		await mutate(data, { revalidate: false });
		if (res.status === 401) return onSessionExpired();
		setMessage({ tone: 'error', text: res.message });
	};

	return (
		<SettingsCard id="comms-title" title="Clinic news" intro="Choose what we may send you beyond your visits. Confirmations and reminders for booked visits always arrive.">
			{message ? (
				<Notice tone={message.tone} className="mb-5">
					{message.text}
				</Notice>
			) : null}
			{error && !data ? <Notice>We couldn’t load your preferences just now. Please try again later.</Notice> : null}
			{!data && !error ? (
				<div aria-busy="true" aria-label="Loading preferences" className="space-y-5">
					{channels.map((c) => (
						<Bone key={c.key} className="h-10 w-full rounded-field" />
					))}
				</div>
			) : null}
			{data ? (
				<div>
					{channels.map((c) => (
						<ChannelSwitch
							key={c.key}
							id={`consent-${c.key}`}
							label={c.label}
							body={c.body}
							checked={data[c.key] === 'subscribed'}
							disabled={saving !== null}
							onToggle={() => void toggle(c.key)}
						/>
					))}
				</div>
			) : null}
		</SettingsCard>
	);
}
