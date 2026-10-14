'use client';

import { useEffect, useRef, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Seal } from '@/components/motifs/seal';
import { AuthLink, AuthShell } from '@/components/auth/auth-shell';
import { Notice, TEXT_LINK, Working } from '@/components/auth/auth-feedback';

const REDIRECT_MS = 2000;
const RESEND_COOLDOWN_S = 30;

type Status = 'waiting' | 'verifying' | 'verified' | 'failed';

/**
 * Two modes: `?email=` after sign-up ("check your inbox", with resend), or
 * `?token=` from the email link (verifies, signs in, then opens My Care).
 */
export function VerifyEmailView() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get('token');
	const email = searchParams.get('email') ?? '';
	const [status, setStatus] = useState<Status>(token ? 'verifying' : 'waiting');
	const [resent, setResent] = useState(false);
	const [cooldown, setCooldown] = useState(0);
	const ranRef = useRef(false);

	useEffect(() => {
		if (!token || ranRef.current) return;
		ranRef.current = true;
		void (async () => {
			try {
				const result = await signIn('verify-token', { token, redirect: false });
				setStatus(result?.error ? 'failed' : 'verified');
			} catch {
				setStatus('failed');
			}
		})();
	}, [token]);

	useEffect(() => {
		if (status !== 'verified') return;
		const id = window.setTimeout(() => {
			router.push('/account');
			router.refresh();
		}, REDIRECT_MS);
		return () => window.clearTimeout(id);
	}, [status, router]);

	useEffect(() => {
		if (cooldown <= 0) return;
		const id = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
		return () => window.clearTimeout(id);
	}, [cooldown]);

	const resend = async () => {
		if (!email) return;
		await fetch('/api/auth/resend-verification', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email }),
		}).catch(() => null);
		setResent(true);
		setCooldown(RESEND_COOLDOWN_S);
	};

	const footer = (
		<>
			Already verified? <AuthLink href="/auth/sign-in">Sign in</AuthLink>
		</>
	);

	if (status === 'verifying') {
		return (
			<AuthShell title={<>One <em>moment</em>.</>} intro="We’re confirming your email address.">
				<Working label="Checking your link…" />
			</AuthShell>
		);
	}

	if (status === 'verified') {
		return (
			<AuthShell title={<>You’re <em>all set</em>.</>} intro="Your email is confirmed. Opening My Care…">
				<div className="flex items-center gap-6">
					<Seal size={96} motion="stamp" center="✓" ring="Email confirmed · Clear Care Medical · " />
					<Working label="Signing you in…" />
				</div>
			</AuthShell>
		);
	}

	if (status === 'failed') {
		return (
			<AuthShell title={<>That link has <em>expired</em>.</>} intro="Verification links work once and for a limited time. Sign in with a code and we’ll confirm your email along the way." footer={footer}>
				<Notice>We couldn’t confirm your email with this link.</Notice>
				<Button size="lg" fullWidth className="mt-6" onClick={() => router.push('/auth/sign-in')}>
					Sign in with a code
				</Button>
			</AuthShell>
		);
	}

	return (
		<AuthShell
			title={<>Check your <em>inbox</em>.</>}
			intro={
				email ? (
					<>
						We’ve sent a confirmation link to <span className="font-semibold text-ink">{email}</span>. Open it on this device to finish setting up.
					</>
				) : (
					'We’ve sent you a confirmation link. Open it on this device to finish setting up.'
				)
			}
			footer={footer}
		>
			<div className="paper rounded-card border border-line p-6">
				<p className="eyebrow text-brass">While you wait</p>
				<ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-muted">
					<li>It usually arrives within a minute.</li>
					<li>Check spam or promotions if it doesn’t.</li>
					<li>The link works once.</li>
				</ul>
			</div>
			{resent ? (
				<Notice tone="success" className="mt-6">
					A fresh link is on its way.
				</Notice>
			) : null}
			{email ? (
				<button type="button" onClick={() => void resend()} disabled={cooldown > 0} className={`${TEXT_LINK} mt-6 block`}>
					{cooldown > 0 ? (
						<>
							Send another in <span className="tabular">{cooldown}s</span>
						</>
					) : (
						'Send the link again'
					)}
				</button>
			) : null}
		</AuthShell>
	);
}
