'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, type ChangePasswordFormValues } from '@/lib/schemas';
import { Button, buttonClasses } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, fieldAria } from '@/components/auth/field';
import { Notice } from '@/components/auth/auth-feedback';
import { sendJson } from '@/components/auth/post-json';
import { SettingsCard } from '@/components/account/settings/settings-card';

const DEFAULTS: ChangePasswordFormValues = { currentPassword: '', newPassword: '', confirmPassword: '' };
const INTRO = 'You can always sign in with a code we email you. A password is optional.';

/** Change the password, or — for code-only accounts — set one through the reset email. */
export function PasswordForm({ email, hasPassword }: { email: string | null; hasPassword: boolean }) {
	const [result, setResult] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
	const {
		register,
		handleSubmit,
		reset,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<ChangePasswordFormValues>({ resolver: zodResolver(changePasswordSchema), defaultValues: DEFAULTS });

	if (!hasPassword) {
		return (
			<SettingsCard id="password-title" title="Password" intro={INTRO}>
				<p className="text-sm leading-relaxed text-ink-muted">You haven’t set a password. If you’d like one, we’ll email you a link to choose it.</p>
				<Link href={`/auth/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}`} className={buttonClasses({ variant: 'outline', className: 'mt-5' })}>
					Set a password
				</Link>
			</SettingsCard>
		);
	}

	const onSubmit = async (data: ChangePasswordFormValues) => {
		setResult(null);
		const res = await sendJson('/api/account/password', { currentPassword: data.currentPassword, newPassword: data.newPassword }, 'PUT');
		if (res.ok) {
			reset(DEFAULTS);
			setResult({ tone: 'success', text: 'Your password is changed. Use it next time you sign in.' });
			return;
		}
		// A wrong current password can come back as 400 or 401 — don't treat it as an expired session.
		if (res.status === 400 || res.status === 401 || res.status === 403) {
			setError('currentPassword', { message: 'That doesn’t match your current password.' });
			return;
		}
		setResult({ tone: 'error', text: res.message });
	};

	return (
		<SettingsCard id="password-title" title="Password" intro={INTRO}>
			<form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
				{result ? <Notice tone={result.tone}>{result.text}</Notice> : null}
				<input type="email" name="email" autoComplete="username" value={email ?? ''} readOnly hidden />
				<Field id="pw-current" label="Current password" error={errors.currentPassword?.message}>
					<Input {...fieldAria('pw-current', errors.currentPassword?.message)} type="password" autoComplete="current-password" {...register('currentPassword')} />
				</Field>
				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
					<Field id="pw-new" label="New password" hint="At least 6 characters" error={errors.newPassword?.message}>
						<Input {...fieldAria('pw-new', errors.newPassword?.message, 'At least 6 characters')} type="password" autoComplete="new-password" {...register('newPassword')} />
					</Field>
					<Field id="pw-confirm" label="Confirm new password" error={errors.confirmPassword?.message}>
						<Input {...fieldAria('pw-confirm', errors.confirmPassword?.message)} type="password" autoComplete="new-password" {...register('confirmPassword')} />
					</Field>
				</div>
				<Button type="submit" variant="outline" disabled={isSubmitting}>
					{isSubmitting ? 'Changing…' : 'Change password'}
				</Button>
			</form>
		</SettingsCard>
	);
}
