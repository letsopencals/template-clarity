'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { clsx } from 'clsx';
import { fetcher } from '@/lib/fetcher';
import { onSessionExpired } from '@/lib/session-expired';
import { CHECKBOX_FALSE, CHECKBOX_TRUE, displayAnswer } from '@/lib/intake';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Seal } from '@/components/motifs/seal';
import { Notice } from '@/components/auth/auth-feedback';
import { Bone } from '@/components/account/skeletons';
import type { CareAnswer, CareFeedbackQuestion } from '@/components/account/care-types';

const SWR_OPTIONS = { revalidateOnFocus: false } as const;
const STARS = [1, 2, 3, 4, 5] as const;
const STAR_WORDS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'] as const;

function Stars({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
	const n = Number(value) || 0;
	return (
		<div role="radiogroup" aria-labelledby={`${id}-label`} className="flex items-center gap-1.5">
			{STARS.map((s) => (
				<button
					key={s}
					type="button"
					role="radio"
					aria-checked={n === s}
					aria-label={`${s} of 5 — ${STAR_WORDS[s]}`}
					onClick={() => onChange(String(s))}
					className="rounded-full p-1 text-brass transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-steel"
				>
					<svg viewBox="0 0 24 24" className="size-7" fill={s <= n ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.4}>
						<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" strokeLinejoin="round" />
					</svg>
				</button>
			))}
			{n ? <span className="ml-2 text-sm text-ink-muted">{STAR_WORDS[n]}</span> : null}
		</div>
	);
}

function QuestionField({ q, value, onChange }: { q: CareFeedbackQuestion; value: string; onChange: (v: string) => void }) {
	const id = `fb-${q.id}`;
	if (q.type === 'checkbox') {
		return (
			<label className="flex cursor-pointer items-start gap-3">
				<input
					type="checkbox"
					checked={value === CHECKBOX_TRUE}
					onChange={(e) => onChange(e.target.checked ? CHECKBOX_TRUE : CHECKBOX_FALSE)}
					className="mt-1 size-4 accent-[var(--color-steel)]"
				/>
				<span className="text-[15px] text-ink">
					{q.title}
					{q.description ? <span className="block text-[13px] text-ink-muted">{q.description}</span> : null}
				</span>
			</label>
		);
	}
	return (
		<div>
			<p id={`${id}-label`} className="text-[15px] font-medium text-ink">
				<label htmlFor={q.type === 'rating' ? undefined : id}>{q.title}</label>
				{q.required ? null : <span className="ml-1.5 text-xs font-normal text-ink-dim">(optional)</span>}
			</p>
			{q.description ? <p className="mt-0.5 text-[13px] text-ink-muted">{q.description}</p> : null}
			<div className="mt-2.5">
				{q.type === 'rating' ? (
					<Stars id={id} value={value} onChange={onChange} />
				) : q.type === 'dropdown' ? (
					<select
						id={id}
						value={value}
						onChange={(e) => onChange(e.target.value)}
						className="h-12 w-full rounded-field border border-line-strong bg-card px-4 text-[15px] text-ink outline-none focus:border-steel"
					>
						<option value="">Choose…</option>
						{q.options.map((o) => (
							<option key={o} value={o}>
								{o}
							</option>
						))}
					</select>
				) : q.type === 'multi-line-text-field' ? (
					<Textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} maxLength={5000} />
				) : (
					<Input id={id} value={value} onChange={(e) => onChange(e.target.value)} maxLength={500} />
				)}
			</div>
		</div>
	);
}

function Given({ feedback }: { feedback: CareAnswer[] }) {
	return (
		<div className="flex gap-5">
			<Seal size={72} motion="stamp" center="✓" ring="Thank you · Clear Care · " className="shrink-0 max-sm:hidden" />
			<div className="min-w-0">
				<p className="font-display text-lg text-ink">Thank you for telling us.</p>
				<dl className="mt-3 space-y-2">
					{feedback.map((f, i) => (
						<div key={f.questionId ?? i} className="text-sm">
							<dt className="text-ink-muted">{f.question}</dt>
							<dd className="text-ink">{displayAnswer(f.answer) || '—'}</dd>
						</div>
					))}
				</dl>
			</div>
		</div>
	);
}

/** "Rate your care" for a completed visit. Shows what was said once it's given. */
export function RateYourCare({ appointmentId, feedback, onSaved }: { appointmentId: string; feedback: CareAnswer[]; onSaved: () => void }) {
	const given = feedback.length > 0;
	const { data: questions, isLoading } = useSWR<CareFeedbackQuestion[]>(given ? null : `/api/account/appointments/${appointmentId}/feedback`, fetcher, SWR_OPTIONS);
	const [values, setValues] = useState<Record<string, string>>({});
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	if (!given && !isLoading && !questions?.length) return null;

	const missing = (questions ?? []).filter((q) => q.required && !(values[q.id] ?? '').trim());

	const submit = async () => {
		if (!questions) return;
		if (missing.length) {
			setError(`Please answer “${missing[0]!.title}”.`);
			return;
		}
		setSaving(true);
		setError(null);
		const answers = questions
			.map((q) => ({ questionId: q.id, question: q.title, answer: (values[q.id] ?? '').trim() }))
			.filter((a) => a.answer);
		try {
			const res = await fetch(`/api/account/appointments/${appointmentId}/feedback`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ answers }),
			});
			if (res.status === 401) {
				onSessionExpired();
				return;
			}
			if (!res.ok) {
				const body = (await res.json().catch(() => null)) as { error?: string } | null;
				setError(body?.error || 'We couldn’t save your feedback. Please try again.');
				return;
			}
			onSaved();
		} catch {
			setError('We couldn’t reach the clinic. Please try again.');
		} finally {
			setSaving(false);
		}
	};

	return (
		<section aria-labelledby="rate-title" className={clsx('rounded-card border p-6 sm:p-8', given ? 'border-sage/40 bg-sage-soft/50' : 'border-line bg-card')}>
			<h2 id="rate-title" className="display-xs text-ink">
				Rate your <em>care</em>
			</h2>
			{given ? (
				<div className="mt-5">
					<Given feedback={feedback} />
				</div>
			) : isLoading || !questions ? (
				<div role="status" aria-label="Loading questions" className="mt-5 space-y-3">
					<Bone className="h-4 w-1/2" />
					<Bone className="h-8 w-40" />
				</div>
			) : (
				<form
					onSubmit={(e) => {
						e.preventDefault();
						void submit();
					}}
					className="mt-2"
				>
					<p className="text-sm text-ink-muted">A minute of your time helps us look after the next patient better. Your clinician reads every answer.</p>
					{error ? <Notice className="mt-5">{error}</Notice> : null}
					<div className="mt-6 space-y-6">
						{questions.map((q) => (
							<QuestionField key={q.id} q={q} value={values[q.id] ?? ''} onChange={(v) => setValues((prev) => ({ ...prev, [q.id]: v }))} />
						))}
					</div>
					<Button type="submit" className="mt-7" disabled={saving}>
						{saving ? 'Sending…' : 'Send feedback'}
					</Button>
				</form>
			)}
		</section>
	);
}
