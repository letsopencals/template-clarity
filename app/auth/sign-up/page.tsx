import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import { AuthSkeleton } from '@/components/auth/auth-feedback';
import { SignUpForm } from '@/components/auth/sign-up-form';

export const metadata: Metadata = { title: 'Create your account' };

export default function Page() {
	return (
		<Suspense
			fallback={
				<AuthShell title="Create your account">
					<AuthSkeleton />
				</AuthShell>
			}
		>
			<SignUpForm />
		</Suspense>
	);
}
