import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import { AuthSkeleton } from '@/components/auth/auth-feedback';
import { SignInFlow } from '@/components/auth/sign-in-flow';

export const metadata: Metadata = { title: 'Sign in' };

export default function Page() {
	return (
		<Suspense
			fallback={
				<AuthShell title="Sign in">
					<AuthSkeleton />
				</AuthShell>
			}
		>
			<SignInFlow />
		</Suspense>
	);
}
