'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { buttonClasses } from '@/components/ui/button';
import { AuthShell } from '@/components/auth/auth-shell';
import { Notice, Working } from '@/components/auth/auth-feedback';
import { resolveLink, type ResolveLinkResult } from '@/app/auth/actions/resolve-link';

type LinkError = NonNullable<ResolveLinkResult['errorCode']>;

const ERROR_COPY: Record<LinkError, { title: string; message: string }> = {
	TOKEN_EXPIRED: { title: 'This link has expired', message: 'Links from our emails work for a limited time. Sign in with a code instead — it only takes a moment.' },
	TOKEN_USED: { title: 'This link was already used', message: 'Each link works once. Sign in with a code and you’ll land in the same place.' },
	TOKEN_INVALID: { title: 'We couldn’t open this link', message: 'It may be incomplete. Try copying the whole link from the email, or sign in with a code.' },
};

/**
 * The backend emits `/account/appointments/{id}/view(?action=...)`, but this
 * template's detail route is `/account/appointments/{id}`. Strip the trailing
 * `/view` segment while preserving any query string (e.g. `?action=cancel`).
 */
export function normalizeRedirect(path: string): string {
	return path.replace(/^(\/account\/appointments\/[^/]+)\/view/, '$1');
}

/** Resolves an emailed `/link/{token}`: signs in (when the link carries a session) and forwards. */
export function LinkResolver({ token }: { token: string }) {
	const router = useRouter();
	const [errorCode, setErrorCode] = useState<LinkError | null>(null);
	const ranRef = useRef(false);

	useEffect(() => {
		if (!token || ranRef.current) return;
		ranRef.current = true;
		void (async () => {
			const result = await resolveLink(token);
			if (result.success && result.redirectPath) {
				router.replace(normalizeRedirect(result.redirectPath));
				router.refresh();
			} else {
				setErrorCode(result.errorCode ?? 'TOKEN_INVALID');
			}
		})();
	}, [token, router]);

	if (!errorCode) {
		return (
			<AuthShell title={<>Opening your <em>link</em>.</>} intro="We’re signing you in securely.">
				<Working label="One moment…" />
			</AuthShell>
		);
	}

	const copy = ERROR_COPY[errorCode];
	return (
		<AuthShell title={copy.title} intro={copy.message}>
			<Notice tone="info" className="mb-6">
				Your visits and notes are safe — only this link has stopped working.
			</Notice>
			<Link href="/auth/sign-in" className={buttonClasses({ size: 'lg', fullWidth: true })}>
				Sign in with a code
			</Link>
		</AuthShell>
	);
}
