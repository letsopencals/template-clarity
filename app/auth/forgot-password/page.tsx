import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import { AuthSkeleton } from '@/components/auth/auth-feedback';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export const metadata: Metadata = { title: 'Reset your password' };

export default function Page() {
	return (
		<Suspense
			fallback={
				<AuthShell title="Reset your password">
					<AuthSkeleton />
				</AuthShell>
			}
		>
			<ForgotPasswordForm />
		</Suspense>
	);
}
