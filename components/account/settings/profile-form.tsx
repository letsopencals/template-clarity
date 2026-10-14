'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, fieldAria } from '@/components/auth/field';
import { Notice } from '@/components/auth/auth-feedback';
import { sendJson } from '@/components/auth/post-json';
import { onSessionExpired } from '@/lib/session-expired';
import { SettingsCard } from '@/components/account/settings/settings-card';
import type { CareProfile } from '@/components/account/use-profile';

const schema = z.object({
	firstName: z.string().trim().min(1, 'Please enter your first name').max(100),
	lastName: z.string().trim().max(100),
	phone: z
		.string()
		.trim()
		.max(30)
		.refine((v) => !v || /^[+()\d\s.-]{6,}$/.test(v), 'Please enter a valid phone number'),
});
type Values = z.infer<typeof schema>;

function valuesOf(p: CareProfile): Values {
	return { firstName: p.firstName ?? '', lastName: p.lastName ?? '', phone: p.phone ?? '' };
}

/** Name and phone. Email is the sign-in identity, so it's shown but not edited here. */
export function ProfileForm({ profile, onSaved }: { profile: CareProfile; onSaved: () => Promise<unknown> }) {
	const [result, setResult] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
	const {
		register,
		handleSubmit,
		reset,
		setError,
		formState: { errors, isSubmitting, isDirty },
	} = useForm<Values>({ resolver: zodResolver(schema), defaultValues: valuesOf(profile) });

	useEffect(() => {
		reset(valuesOf(profile));
	}, [profile, reset]);

	const onSubmit = async (data: Values) => {
		setResult(null);
		const res = await sendJson('/api/account/profile', data, 'PUT');
		if (res.ok) {
			await onSaved();
			setResult({ tone: 'success', text: 'Your details are saved.' });
			return;
		}
		if (res.status === 401) return onSessionExpired();
		for (const [k, v] of Object.entries(res.fields)) if (k in data) setError(k as keyof Values, { message: v });
		setResult({ tone: 'error', text: res.message });
	};

	return (
		<SettingsCard id="profile-title" title="Your details" intro="How we greet you, and the number we call if something about a visit changes.">
			<form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
				{result ? <Notice tone={result.tone}>{result.text}</Notice> : null}
				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
					<Field id="profile-first" label="First name" error={errors.firstName?.message}>
						<Input {...fieldAria('profile-first', errors.firstName?.message)} autoComplete="given-name" {...register('firstName')} />
					</Field>
					<Field id="profile-last" label="Last name" optional error={errors.lastName?.message}>
						<Input {...fieldAria('profile-last', errors.lastName?.message)} autoComplete="family-name" {...register('lastName')} />
					</Field>
				</div>
				<Field id="profile-phone" label="Phone" optional error={errors.phone?.message}>
					<Input {...fieldAria('profile-phone', errors.phone?.message)} type="tel" autoComplete="tel" {...register('phone')} />
				</Field>
				<Field id="profile-email" label="Email" hint="This is how you sign in. To change it, please call the clinic.">
					<Input {...fieldAria('profile-email', undefined, 'This is how you sign in. To change it, please call the clinic.')} value={profile.email ?? ''} readOnly className="bg-cream text-ink-muted" />
				</Field>
				<Button type="submit" disabled={isSubmitting || !isDirty}>
					{isSubmitting ? 'Saving…' : 'Save details'}
				</Button>
			</form>
		</SettingsCard>
	);
}
