import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import { AuthSkeleton } from '@/components/auth/auth-feedback';
import { VerifyEmailView } from '@/components/auth/verify-email-view';

export const metadata: Metadata = { title: 'Confirm your email' };

export default function Page() {
	return (
		<Suspense
			fallback={
				<AuthShell title="Confirm your email">
					<AuthSkeleton />
				</AuthShell>
			}
		>
			<VerifyEmailView />
		</Suspense>
	);
}
