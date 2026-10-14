'use client';

import { useCallback, useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion, type Transition } from 'framer-motion';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthLink, AuthShell } from '@/components/auth/auth-shell';
import { CODE_LENGTH, CodeInput } from '@/components/auth/code-input';
import { FIELD_LABEL, Notice, TEXT_LINK } from '@/components/auth/auth-feedback';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { DURATION, EASE_OUT } from '@/components/motion/easing';

const emailSchema = z.string().trim().min(1, 'Please enter your email').email('Please enter a valid email');

const RESEND_COOLDOWN_S = 30;

type Step = 'email' | 'code' | 'password';

const INTRO: Record<Step, string> = {
	email: 'Your visits, notes and invoices — for you and your family. We’ll email you a six-digit code, so there’s no password to remember.',
	code: 'Enter the six digits we just emailed you. The code works for a few minutes.',
	password: 'Enter your password to continue.',
};

const STEP_FROM = { opacity: 0, y: 10 } as const;
const STEP_TO = { opacity: 1, y: 0 } as const;
const STEP_EXIT = { opacity: 0, y: -6 } as const;
const FADE = { opacity: 0 } as const;
const STEP_T: Transition = { duration: DURATION.fast, ease: EASE_OUT };

/** Only same-origin relative paths are allowed as a post-sign-in destination. */
function safeCallback(raw: string | null): string {
	if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/account';
	return raw;
}

/**
 * Email first, then a six-digit code by email (the default) or the password.
 * Both land on `callbackUrl` (set by the middleware or `onSessionExpired`).
 */
export function SignInFlow() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = safeCallback(searchParams.get('callbackUrl'));
	const reduce = useReducedMotion();

	const [step, setStep] = useState<Step>('email');
	const [email, setEmail] = useState(searchParams.get('email') ?? '');
	const [code, setCode] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [info, setInfo] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [cooldown, setCooldown] = useState(0);

	useEffect(() => {
		if (cooldown <= 0) return;
		const id = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
		return () => window.clearTimeout(id);
	}, [cooldown]);

	const finish = useCallback(() => {
		router.push(callbackUrl);
		router.refresh();
	}, [router, callbackUrl]);

	const go = (next: Step) => {
		setError(null);
		setInfo(null);
		setStep(next);
	};

	const validEmail = (): string | null => {
		const parsed = emailSchema.safeParse(email);
		if (!parsed.success) {
			setError(parsed.error.issues[0]?.message ?? 'Please enter a valid email');
			return null;
		}
		setEmail(parsed.data);
		return parsed.data;
	};

	const sendCode = async (isResend = false) => {
		const address = isResend ? email : validEmail();
		if (!address) return;
		setError(null);
		setLoading(true);
		try {
			// Always 204 (no account enumeration) — nothing to branch on.
			await fetch('/api/auth/request-login-code', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: address }),
			});
			setCooldown(RESEND_COOLDOWN_S);
			setCode('');
			setStep('code');
			setInfo(isResend ? 'A fresh code is on its way.' : null);
		} catch {
			setError('Something went wrong. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const verifyCode = async (value = code) => {
		setError(null);
		setInfo(null);
		if (value.length < CODE_LENGTH) {
			setError('Enter all six digits from your email.');
			return;
		}
		setLoading(true);
		try {
			const result = await signIn('login-code', { email, code: value, redirect: false });
			if (result?.error) {
				setError('That code didn’t work. It may have expired — check the latest email, or send a new one.');
				setCode('');
			} else {
				finish();
			}
		} catch {
			setError('Something went wrong. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const usePassword = () => {
		if (!validEmail()) return;
		go('password');
	};

	const signInWithPassword = async () => {
		setError(null);
		if (password.length < 6) {
			setError('Your password has at least 6 characters.');
			return;
		}
		setLoading(true);
		try {
			const result = await signIn('credentials', { email, password, redirect: false });
			if (result?.error) setError('That email and password don’t match. Try again, or sign in with a code.');
			else finish();
		} catch {
			setError('Something went wrong. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const changeEmail = () => {
		setCode('');
		setPassword('');
		go('email');
	};

	return (
		<AuthShell
			title={
				<>
					Welcome <em>back</em>.
				</>
			}
			intro={INTRO[step]}
			footer={
				<>
					First time with us? <AuthLink href="/auth/sign-up">Create your account</AuthLink>
				</>
			}
		>
			{error ? <Notice className="mb-6">{error}</Notice> : null}
			{info && !error ? (
				<Notice tone="success" className="mb-6">
					{info}
				</Notice>
			) : null}

			<AnimatePresence mode="wait" initial={false}>
				<motion.div key={step} initial={reduce ? FADE : STEP_FROM} animate={STEP_TO} exit={reduce ? FADE : STEP_EXIT} transition={STEP_T}>
					{step === 'email' ? (
						<form
							onSubmit={(e) => {
								e.preventDefault();
								void sendCode(false);
							}}
							className="flex flex-col gap-5"
							noValidate
						>
							<div>
								<label htmlFor="signin-email" className={FIELD_LABEL}>
									Email
								</label>
								<Input
									id="signin-email"
									type="email"
									autoComplete="email"
									autoFocus
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="you@example.com"
									aria-invalid={!!error || undefined}
								/>
							</div>
							<Button type="submit" size="lg" fullWidth disabled={loading}>
								{loading ? 'Sending your code…' : 'Email me a sign-in code'}
							</Button>
							<div className="flex items-center gap-4 text-xs text-ink-dim">
								<span aria-hidden className="h-px flex-1 bg-line" />
								or
								<span aria-hidden className="h-px flex-1 bg-line" />
							</div>
							<Button variant="outline" size="lg" fullWidth onClick={usePassword} disabled={loading}>
								Use my password
							</Button>
						</form>
					) : null}

					{step === 'code' ? (
						<form
							onSubmit={(e) => {
								e.preventDefault();
								void verifyCode();
							}}
							className="flex flex-col gap-6"
						>
							<EmailChip email={email} onChange={changeEmail} />
							<CodeInput value={code} onChange={setCode} onComplete={(c) => void verifyCode(c)} disabled={loading} invalid={!!error} autoFocus />
							<Button type="submit" size="lg" fullWidth disabled={loading || code.length < CODE_LENGTH}>
								{loading ? 'Checking…' : 'Sign in'}
							</Button>
							<div className="flex flex-col gap-3">
								<button type="button" onClick={() => void sendCode(true)} disabled={cooldown > 0 || loading} className={TEXT_LINK}>
									{cooldown > 0 ? (
										<>
											Send a new code in <span className="tabular">{cooldown}s</span>
										</>
									) : (
										'Send a new code'
									)}
								</button>
								<button type="button" onClick={() => go('password')} className={TEXT_LINK}>
									Use my password instead
								</button>
							</div>
						</form>
					) : null}

					{step === 'password' ? (
						<form
							onSubmit={(e) => {
								e.preventDefault();
								void signInWithPassword();
							}}
							className="flex flex-col gap-6"
						>
							<EmailChip email={email} onChange={changeEmail} />
							{/* Hidden username so password managers pair the right account. */}
							<input type="email" name="email" autoComplete="username" value={email} readOnly hidden />
							<div>
								<div className="mb-2 flex items-baseline justify-between">
									<label htmlFor="signin-password" className="text-[13px] font-semibold text-ink">
										Password
									</label>
									<Link href={`/auth/forgot-password?email=${encodeURIComponent(email)}`} className="text-[13px] text-ink-muted transition-colors hover:text-steel">
										Forgotten it?
									</Link>
								</div>
								<Input
									id="signin-password"
									type="password"
									autoComplete="current-password"
									autoFocus
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="Your password"
								/>
							</div>
							<Button type="submit" size="lg" fullWidth disabled={loading}>
								{loading ? 'Signing in…' : 'Sign in'}
							</Button>
							<button type="button" onClick={() => void sendCode(true)} disabled={loading} className={TEXT_LINK}>
								Email me a code instead
							</button>
						</form>
					) : null}
				</motion.div>
			</AnimatePresence>
		</AuthShell>
	);
}

/** The email being signed in, with a quiet "Change" control. */
function EmailChip({ email, onChange }: { email: string; onChange: () => void }) {
	return (
		<div className="flex items-center justify-between gap-4 rounded-field border border-line bg-cream/60 px-4 py-3">
			<div className="min-w-0">
				<p className="eyebrow text-ink-dim">Signing in as</p>
				<p className="mt-1 truncate text-sm font-medium text-ink">{email}</p>
			</div>
			<button type="button" onClick={onChange} className={`${TEXT_LINK} shrink-0 self-center`}>
				Change
			</button>
		</div>
	);
}
