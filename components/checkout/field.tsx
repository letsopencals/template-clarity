import type { ReactNode } from 'react';

/** Stationery field label: eyebrow caption, optional mark, helper copy and an inline error. */
export function Field({
	htmlFor,
	label,
	required,
	optional,
	hint,
	error,
	children,
}: {
	htmlFor: string;
	label: ReactNode;
	required?: boolean;
	/** Show "(optional)" after the label. */
	optional?: boolean;
	hint?: ReactNode;
	error?: string;
	children: ReactNode;
}) {
	return (
		<div className="min-w-0">
			<label htmlFor={htmlFor} className="eyebrow mb-2 block text-[0.62rem] text-ink-muted">
				{label}
				{required ? (
					<span className="ml-1 text-clay" aria-hidden>
						*
					</span>
				) : null}
				{optional ? <span className="ml-1.5 normal-case tracking-normal text-ink-dim">(optional)</span> : null}
			</label>
			{hint ? (
				<p id={`${htmlFor}-hint`} className="-mt-0.5 mb-2 text-xs leading-relaxed text-ink-muted">
					{hint}
				</p>
			) : null}
			{children}
			{error ? (
				<p id={`${htmlFor}-error`} className="mt-1.5 text-xs text-clay">
					{error}
				</p>
			) : null}
		</div>
	);
}

/** aria-describedby for a field with optional hint/error. */
export function describedBy(id: string, hint: boolean, error: string | undefined): string | undefined {
	const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean);
	return ids.length ? ids.join(' ') : undefined;
}
