'use client';

import type { CheckoutQuestionResponse } from '@opencals/storefront-sdk';
import { useNow } from '@/hooks/use-now';
import { questionDescription, questionTitle } from '@/hooks/use-checkout-questions';
import type { FileUploads } from '@/hooks/use-file-uploads';
import { isRequiredFor, type AnswerMap, type VisitFor } from '@/lib/intake';
import { IntakeField } from '@/components/booking/intake-field';
import { FileField } from '@/components/booking/file-field';
import { formatSignOffDate } from '@/components/booking/slot-time';

interface PreVisitNotesProps {
	questions: CheckoutQuestionResponse[];
	answers: AnswerMap;
	visitFor: VisitFor;
	errors: Record<string, string>;
	showErrors: boolean;
	uploads: FileUploads;
	onChange: (questionId: string, value: string) => void;
}

/**
 * The store's checkout questions for this visit, on a ruled card: the
 * clinic's notepad. Patient name / DOB appear when the visit isn't for "me".
 */
export function PreVisitNotes({ questions, answers, visitFor, errors, showErrors, uploads, onChange }: PreVisitNotesProps) {
	const now = useNow(60 * 60_000);
	const signOffDate = now ? formatSignOffDate(now) : null;

	if (questions.length === 0) {
		return <p className="text-[15px] text-ink-muted">Nothing to fill in beforehand. Your clinician will ask what they need on the day.</p>;
	}

	return (
		<div className="ruled rounded-card border border-line p-5 shadow-paper sm:p-7">
			<p className="eyebrow text-ink-muted">For your clinician</p>
			<p className="mt-1 text-[14px] text-ink-muted">Private to your care team. A few words now saves time in the room.</p>
			<div className="mt-6 space-y-7">
				{questions.map((q) => {
					const required = isRequiredFor(q, visitFor);
					const error = showErrors ? (errors[q.id] ?? null) : null;
					return q.type === 'file-upload' ? (
						<FileField
							key={q.id}
							question={q}
							label={questionTitle(q)}
							description={questionDescription(q)}
							required={required}
							error={error}
							uploads={uploads}
						/>
					) : (
						<IntakeField
							key={q.id}
							question={q}
							value={answers[q.id] ?? ''}
							required={required}
							error={error}
							signOffDate={signOffDate}
							forChild={visitFor === 'child'}
							onChange={onChange}
						/>
					);
				})}
			</div>
		</div>
	);
}
