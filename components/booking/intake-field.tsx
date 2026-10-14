'use client';

import { memo, useId } from 'react';
import { clsx } from 'clsx';
import type { CheckoutQuestionResponse } from '@opencals/storefront-sdk';
import { Input, Textarea } from '@/components/ui/input';
import { questionDescription, questionOptions, questionTitle } from '@/hooks/use-checkout-questions';
import { CHECKBOX_FALSE, CHECKBOX_TRUE, intakeKey, joinOptions, splitOptions } from '@/lib/intake';

interface IntakeFieldProps {
	question: CheckoutQuestionResponse;
	value: string;
	required: boolean;
	error: string | null;
	/** "October 14, 2026", for the telehealth sign-off (null before hydration). */
	signOffDate: string | null;
	/** The visit is for a child (patient-name placeholder wording). */
	forChild: boolean;
	onChange: (questionId: string, value: string) => void;
}

/** Keep digits and insert slashes: 04232019 → 04/23/2019. */
export function maskDob(raw: string): string {
	const d = raw.replace(/\D/g, '').slice(0, 8);
	if (d.length <= 2) return d;
	if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
	return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

function Label({ htmlFor, id, text, required }: { htmlFor?: string; id?: string; text: string; required: boolean }) {
	const Tag = htmlFor ? 'label' : 'p';
	return (
		<Tag htmlFor={htmlFor} id={id} className="block text-[15px] font-semibold text-ink">
			{text}
			{required ? null : <span className="ml-2 text-[13px] font-normal text-ink-dim">Optional</span>}
		</Tag>
	);
}

function FieldError({ id, error }: { id: string; error: string | null }) {
	if (!error) return null;
	return (
		<p id={id} className="mt-1.5 text-[13px] text-clay" role="alert">
			{error}
		</p>
	);
}

/** One pre-visit question, rendered by type. Patient name / DOB / consent get clinic treatment. */
export const IntakeField = memo(function IntakeField({ question: q, value, required, error, signOffDate, forChild, onChange }: IntakeFieldProps) {
	const id = useId();
	const errId = `${id}-err`;
	const title = questionTitle(q);
	const description = questionDescription(q);
	const key = intakeKey(q);
	const invalid = error ? true : undefined;
	const described = error ? errId : description ? `${id}-desc` : undefined;
	const desc = description ? (
		<p id={`${id}-desc`} className="mt-0.5 text-[14px] text-ink-muted">
			{description}
		</p>
	) : null;

	// Telehealth consent: a signed line, not a tick box in a list.
	if (q.type === 'checkbox' && key === 'telehealthConsent') {
		const checked = value === CHECKBOX_TRUE;
		return (
			<div className={clsx('rounded-card border bg-paper p-5', error ? 'border-clay' : 'border-line')}>
				<p className="eyebrow text-ink-muted">Consent for video care</p>
				<p className="mt-2 text-[15px] leading-relaxed text-ink">{description || title}</p>
				<label className="mt-4 flex cursor-pointer items-start gap-3">
					<input
						type="checkbox"
						checked={checked}
						onChange={(e) => onChange(q.id, e.target.checked ? CHECKBOX_TRUE : CHECKBOX_FALSE)}
						aria-invalid={invalid}
						aria-describedby={error ? errId : undefined}
						className="mt-1 h-5 w-5 shrink-0 accent-steel"
					/>
					<span className="min-w-0 flex-1">
						<span className="block text-[15px] font-semibold text-ink">I agree to be seen by video</span>
						<span className="mt-2 flex items-end gap-3 border-b border-line-strong pb-1">
							<span className={clsx('font-display text-[22px] italic', checked ? 'animate-ink text-steel-deep' : 'text-ink-dim/50')}>
								{checked ? 'Signed' : 'Sign here'}
							</span>
							<span className="tabular ml-auto text-[13px] text-ink-muted">{signOffDate ?? ''}</span>
						</span>
					</span>
				</label>
				<FieldError id={errId} error={error} />
			</div>
		);
	}

	if (q.type === 'checkbox') {
		const options = questionOptions(q);
		if (options.length > 0) {
			const picked = new Set(splitOptions(value));
			return (
				<fieldset aria-describedby={described}>
					<legend className="contents">
						<Label text={title} required={required} />
					</legend>
					{desc}
					<div className="mt-3 flex flex-wrap gap-2">
						{options.map((o) => {
							const on = picked.has(o);
							return (
								<button
									key={o}
									type="button"
									aria-pressed={on}
									onClick={() => {
										const next = new Set(picked);
										if (on) next.delete(o);
										else next.add(o);
										onChange(q.id, joinOptions(options.filter((x) => next.has(x))));
									}}
									className={clsx(
										'rounded-full border px-4 py-2 text-[14px] transition-colors duration-300',
										on ? 'border-steel bg-steel text-white' : 'border-line-strong bg-card text-ink hover:border-steel',
									)}
								>
									{o}
								</button>
							);
						})}
					</div>
					<FieldError id={errId} error={error} />
				</fieldset>
			);
		}
		return (
			<div>
				<label className="flex cursor-pointer items-start gap-3">
					<input
						type="checkbox"
						checked={value === CHECKBOX_TRUE}
						onChange={(e) => onChange(q.id, e.target.checked ? CHECKBOX_TRUE : CHECKBOX_FALSE)}
						aria-invalid={invalid}
						aria-describedby={described}
						className="mt-1 h-5 w-5 shrink-0 accent-steel"
					/>
					<span>
						<span className="block text-[15px] font-semibold text-ink">{title}</span>
						{desc}
					</span>
				</label>
				<FieldError id={errId} error={error} />
			</div>
		);
	}

	if (q.type === 'dropdown') {
		const options = questionOptions(q);
		return (
			<div>
				<Label htmlFor={id} text={title} required={required} />
				{desc}
				<select
					id={id}
					value={value}
					onChange={(e) => onChange(q.id, e.target.value)}
					aria-invalid={invalid}
					aria-describedby={described}
					className="mt-2 w-full rounded-field border border-line-strong bg-card px-4 py-3 text-[15px] text-ink outline-none focus:border-steel aria-[invalid=true]:border-clay"
				>
					<option value="">Choose…</option>
					{options.map((o) => (
						<option key={o} value={o}>
							{o}
						</option>
					))}
				</select>
				<FieldError id={errId} error={error} />
			</div>
		);
	}

	if (q.type === 'rating') {
		const current = Number(value) || 0;
		return (
			<div>
				<Label id={`${id}-label`} text={title} required={required} />
				{desc}
				<div role="radiogroup" aria-labelledby={`${id}-label`} className="mt-3 flex gap-2">
					{[1, 2, 3, 4, 5].map((n) => (
						<button
							key={n}
							type="button"
							role="radio"
							aria-checked={current === n}
							onClick={() => onChange(q.id, String(n))}
							className={clsx(
								'tabular h-11 w-11 rounded-full border text-[15px] transition-colors duration-300',
								current >= n ? 'border-steel bg-steel text-white' : 'border-line-strong bg-card text-ink hover:border-steel',
							)}
						>
							{n}
						</button>
					))}
				</div>
				<FieldError id={errId} error={error} />
			</div>
		);
	}

	if (q.type === 'multi-line-text-field') {
		return (
			<div>
				<Label htmlFor={id} text={title} required={required} />
				{desc}
				<Textarea
					id={id}
					value={value}
					onChange={(e) => onChange(q.id, e.target.value)}
					aria-invalid={invalid}
					aria-describedby={described}
					placeholder={key === 'reason' ? 'In your own words — how long, what helps, what worries you.' : undefined}
					className="mt-2 bg-transparent"
				/>
				<FieldError id={errId} error={error} />
			</div>
		);
	}

	// single-line (and anything unknown)
	const dob = key === 'patientDob';
	return (
		<div>
			<Label htmlFor={id} text={title} required={required} />
			{desc}
			<Input
				id={id}
				value={value}
				onChange={(e) => onChange(q.id, dob ? maskDob(e.target.value) : e.target.value)}
				aria-invalid={invalid}
				aria-describedby={described}
				inputMode={dob ? 'numeric' : undefined}
				autoComplete={key === 'patientName' ? 'off' : undefined}
				placeholder={dob ? 'MM/DD/YYYY' : key === 'patientName' ? (forChild ? 'Your child’s full name' : 'Their full name') : undefined}
				className={clsx('mt-2 bg-transparent', dob && 'tabular max-w-48')}
			/>
			<FieldError id={errId} error={error} />
		</div>
	);
});
