'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthLink, AuthShell } from '@/components/auth/auth-shell';
import { Field, fieldAria } from '@/components/auth/field';
import { Notice } from '@/components/auth/auth-feedback';
import { sendJson } from '@/components/auth/post-json';

/** Request a reset link. Always confirms (the route never reveals whether an account exists). */
export function ForgotPasswordForm() {
	const searchParams = useSearchParams();
	const [sentTo, setSentTo] = useState<string | null>(null);
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ForgotPasswordFormValues>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: { email: searchParams.get('email') ?? '' },
	});

	const onSubmit = async ({ email }: ForgotPasswordFormValues) => {
		const address = email.trim();
		await sendJson('/api/auth/forgot-password', { email: address });
		setSentTo(address);
	};

	return (
		<AuthShell
			title={
				<>
					A new <em>password</em>.
				</>
			}
			intro={
				sentTo ? null : 'Tell us the email on your account and we’ll send a link to choose a new password. Or skip passwords altogether — sign in with a code by email.'
			}
			footer={
				<>
					Remembered it? <AuthLink href="/auth/sign-in">Back to sign in</AuthLink>
				</>
			}
		>
			{sentTo ? (
				<div className="flex flex-col gap-5">
					<Notice tone="success">
						If there’s an account for <span className="font-semibold">{sentTo}</span>, a reset link is on its way. It can take a minute or two —
						check your spam folder if it doesn’t arrive.
					</Notice>
					<Button variant="outline" size="lg" fullWidth onClick={() => setSentTo(null)}>
						Use a different email
					</Button>
				</div>
			) : (
				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
					<Field id="forgot-email" label="Email" error={errors.email?.message}>
						<Input
							{...register('email')}
							{...fieldAria('forgot-email', errors.email?.message)}
							type="email"
							autoComplete="email"
							autoFocus
							placeholder="you@example.com"
						/>
					</Field>
					<Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
						{isSubmitting ? 'Sending…' : 'Send me a reset link'}
					</Button>
				</form>
			)}
		</AuthShell>
	);
}
