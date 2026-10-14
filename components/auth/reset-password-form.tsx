'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/schemas';
import { Button, buttonClasses } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthLink, AuthShell } from '@/components/auth/auth-shell';
import { Field, fieldAria } from '@/components/auth/field';
import { Notice } from '@/components/auth/auth-feedback';
import { sendJson } from '@/components/auth/post-json';

const REDIRECT_MS = 3000;
const DEFAULTS: ResetPasswordFormValues = { password: '', confirmPassword: '' };

/** Choose a new password from the emailed `?token=` link. */
export function ResetPasswordForm() {
	const router = useRouter();
	const token = useSearchParams().get('token') ?? '';
	const [done, setDone] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema), defaultValues: DEFAULTS });

	useEffect(() => {
		if (!done) return;
		const id = window.setTimeout(() => router.push('/auth/sign-in'), REDIRECT_MS);
		return () => window.clearTimeout(id);
	}, [done, router]);

	const onSubmit = async (data: ResetPasswordFormValues) => {
		setError(null);
		const result = await sendJson('/api/auth/reset-password', { token, newPassword: data.password });
		if (result.ok) setDone(true);
		else setError('This link has expired or was already used. Request a new one and try again.');
	};

	const footer = (
		<>
			Rather not use a password? <AuthLink href="/auth/sign-in">Sign in with a code</AuthLink>
		</>
	);

	if (!token) {
		return (
			<AuthShell title={<>This link is <em>incomplete</em>.</>} intro="The reset link is missing its code. Request a fresh one — it only takes a moment." footer={footer}>
				<Link href="/auth/forgot-password" className={buttonClasses({ size: 'lg', fullWidth: true })}>
					Request a new link
				</Link>
			</AuthShell>
		);
	}

	return (
		<AuthShell title={<>Choose a new <em>password</em>.</>} intro={done ? null : 'Pick something you haven’t used here before.'} footer={footer}>
			{done ? (
				<Notice tone="success">Your password is updated. Taking you to sign in…</Notice>
			) : (
				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
					{error ? (
						<Notice>
							{error}{' '}
							<Link href="/auth/forgot-password" className="font-semibold underline underline-offset-4">
								Request a new link
							</Link>
						</Notice>
					) : null}
					<Field id="reset-password" label="New password" hint="At least 6 characters." error={errors.password?.message}>
						<Input
							{...register('password')}
							{...fieldAria('reset-password', errors.password?.message, 'hint')}
							type="password"
							autoComplete="new-password"
							autoFocus
						/>
					</Field>
					<Field id="reset-confirm" label="Confirm new password" error={errors.confirmPassword?.message}>
						<Input {...register('confirmPassword')} {...fieldAria('reset-confirm', errors.confirmPassword?.message)} type="password" autoComplete="new-password" />
					</Field>
					<Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
						{isSubmitting ? 'Saving…' : 'Save new password'}
					</Button>
				</form>
			)}
		</AuthShell>
	);
}
