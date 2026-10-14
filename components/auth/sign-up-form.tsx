'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, type SignUpFormValues } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthLink, AuthShell, AUTH_IMAGES } from '@/components/auth/auth-shell';
import { Field, fieldAria } from '@/components/auth/field';
import { Notice } from '@/components/auth/auth-feedback';
import { sendJson } from '@/components/auth/post-json';

const DEFAULTS: SignUpFormValues = { firstName: '', lastName: '', email: '', password: '' };

/** New patient account. Verification email next, then the six-digit code works too. */
export function SignUpForm() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const form = useForm<SignUpFormValues>({ resolver: zodResolver(signUpSchema), defaultValues: DEFAULTS });
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = form;

	const onSubmit = async (data: SignUpFormValues) => {
		setError(null);
		const email = data.email.trim();
		const result = await sendJson('/api/auth/sign-up', {
			email,
			password: data.password,
			firstName: data.firstName.trim(),
			lastName: data.lastName?.trim() || undefined,
		});
		if (result.ok) {
			router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
			return;
		}
		for (const [k, msg] of Object.entries(result.fields)) {
			if (k in DEFAULTS) form.setError(k as keyof SignUpFormValues, { message: msg });
		}
		setError(result.status === 409 ? 'There’s already an account with this email. Try signing in with a code instead.' : result.message);
	};

	return (
		<AuthShell
			eyebrow="New patient"
			title={
				<>
					Make yourself <em>at home</em>.
				</>
			}
			intro="One account keeps your visits, pre-visit notes and invoices together — for you and anyone you book for. After this, signing in is just a code by email."
			image={AUTH_IMAGES.detail}
			caption="Unhurried appointments, one record"
			footer={
				<>
					Already registered? <AuthLink href="/auth/sign-in">Sign in</AuthLink>
				</>
			}
		>
			{error ? <Notice className="mb-6">{error}</Notice> : null}
			<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
					<Field id="signup-first" label="First name" error={errors.firstName?.message}>
						<Input {...register('firstName')} {...fieldAria('signup-first', errors.firstName?.message)} autoComplete="given-name" autoFocus />
					</Field>
					<Field id="signup-last" label="Last name" optional error={errors.lastName?.message}>
						<Input {...register('lastName')} {...fieldAria('signup-last', errors.lastName?.message)} autoComplete="family-name" />
					</Field>
				</div>
				<Field id="signup-email" label="Email" error={errors.email?.message}>
					<Input
						{...register('email')}
						{...fieldAria('signup-email', errors.email?.message)}
						type="email"
						autoComplete="email"
						placeholder="you@example.com"
					/>
				</Field>
				<Field id="signup-password" label="Password" hint="At least 6 characters. You can always sign in with a code instead." error={errors.password?.message}>
					<Input
						{...register('password')}
						{...fieldAria('signup-password', errors.password?.message, 'hint')}
						type="password"
						autoComplete="new-password"
					/>
				</Field>
				<Button type="submit" size="lg" fullWidth disabled={isSubmitting} className="mt-2">
					{isSubmitting ? 'Creating your account…' : 'Create my account'}
				</Button>
				<p className="text-xs leading-relaxed text-ink-dim">
					We use your details only to arrange your care and send visit reminders. Marketing emails are opt-in, and you can change them any time in My Care.
				</p>
			</form>
		</AuthShell>
	);
}
