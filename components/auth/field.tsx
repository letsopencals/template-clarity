import { FIELD_LABEL } from '@/components/auth/auth-feedback';

/**
 * Label + control + message for react-hook-form fields (auth and settings).
 * Pass the control as children with matching `id` / `aria-describedby`.
 */
export function Field({
	id,
	label,
	optional,
	hint,
	error,
	aside,
	children,
}: {
	id: string;
	label: string;
	optional?: boolean;
	hint?: string;
	error?: string;
	/** Right-aligned link next to the label ("Forgotten it?"). */
	aside?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<div className="min-w-0">
			<div className="flex items-baseline justify-between gap-3">
				<label htmlFor={id} className={FIELD_LABEL}>
					{label}
					{optional ? <span className="ml-1.5 font-normal text-ink-dim">(optional)</span> : null}
				</label>
				{aside}
			</div>
			{children}
			{error ? (
				<p id={`${id}-error`} className="mt-1.5 text-[13px] text-clay">
					{error}
				</p>
			) : hint ? (
				<p id={`${id}-hint`} className="mt-1.5 text-[13px] text-ink-dim">
					{hint}
				</p>
			) : null}
		</div>
	);
}

/** aria props for a control inside `<Field>`. */
export function fieldAria(id: string, error?: string, hint?: string) {
	return {
		id,
		'aria-invalid': error ? true : undefined,
		'aria-describedby': error ? `${id}-error` : hint ? `${id}-hint` : undefined,
	} as const;
}
