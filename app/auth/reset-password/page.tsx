import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import { AuthSkeleton } from '@/components/auth/auth-feedback';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata: Metadata = { title: 'Choose a new password' };

export default function Page() {
	return (
		<Suspense
			fallback={
				<AuthShell title="Choose a new password">
					<AuthSkeleton />
				</AuthShell>
			}
		>
			<ResetPasswordForm />
		</Suspense>
	);
}
