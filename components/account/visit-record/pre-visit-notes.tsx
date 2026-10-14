'use client';

import Image from 'next/image';
import { displayAnswer } from '@/lib/intake';
import type { CareAnswer, CareFile } from '@/components/account/care-types';

function isImage(f: CareFile): boolean {
	return f.mime ? f.mime.startsWith('image/') : /\.(jpe?g|png|gif|webp|heic|avif)$/i.test(f.filename ?? '');
}

function Files({ files }: { files: CareFile[] }) {
	const usable = files.filter((f) => f.url);
	if (!usable.length) return null;
	return (
		<ul className="mt-3 flex flex-wrap gap-3">
			{usable.map((f) => (
				<li key={f.id}>
					<a
						href={f.url!}
						target="_blank"
						rel="noopener noreferrer"
						className="group block rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-steel"
						aria-label={`Open ${f.filename ?? 'attachment'}`}
					>
						{isImage(f) ? (
							<span className="window-sm image-placeholder relative block size-24 ring-1 ring-line">
								<Image src={f.url!} alt="" fill sizes="96px" className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
							</span>
						) : (
							<span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-card px-3 py-1.5 text-xs text-ink-muted group-hover:border-steel group-hover:text-steel">
								<svg aria-hidden viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={1.6}>
									<path d="M9 2H4v12h8V5z M9 2v3h3" strokeLinejoin="round" />
								</svg>
								{f.filename ?? 'Attachment'}
							</span>
						)}
					</a>
				</li>
			))}
		</ul>
	);
}

/** Your answers to the pre-visit questions, on lined paper. */
export function PreVisitNotes({ answers }: { answers: CareAnswer[] }) {
	const shown = answers.filter((a) => (a.answer ?? '').trim() || a.files.length);
	return (
		<section aria-labelledby="notes-title" className="ruled rounded-card border border-line px-6 pt-6 pb-7 sm:px-8">
			<div className="flex items-baseline justify-between gap-4">
				<h2 id="notes-title" className="eyebrow text-brass">
					Pre-visit notes
				</h2>
				<span className="text-xs text-ink-dim">Shared with your clinician</span>
			</div>
			{shown.length ? (
				<dl className="mt-5 space-y-5">
					{shown.map((a, i) => (
						<div key={a.questionId ?? `${a.question}-${i}`} className="min-w-0">
							<dt className="text-[13px] text-ink-muted">{a.question}</dt>
							{(a.answer ?? '').trim() ? <dd className="mt-1 font-display text-[1.05rem] leading-relaxed break-words whitespace-pre-line text-ink">{displayAnswer(a.answer)}</dd> : null}
							{a.files.length ? (
								<dd>
									<Files files={a.files} />
								</dd>
							) : null}
						</div>
					))}
				</dl>
			) : (
				<p className="mt-5 text-sm text-ink-muted">No notes were added for this visit. Anything on your mind can be shared in the room.</p>
			)}
		</section>
	);
}
