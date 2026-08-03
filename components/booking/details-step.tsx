'use client';

interface DetailsStepProps {
	email: string;
	firstName: string;
	lastName: string;
	customerId: string | null;
	onChangeEmail: (v: string) => void;
	onChangeFirstName: (v: string) => void;
	onChangeLastName: (v: string) => void;
	fieldErrors: Record<string, string[]>;
	submitting: boolean;
	canSubmit: boolean;
	onSubmit: () => void;
}

export function DetailsStep({
	email,
	firstName,
	lastName,
	customerId,
	onChangeEmail,
	onChangeFirstName,
	onChangeLastName,
	fieldErrors,
	submitting,
	canSubmit,
	onSubmit,
}: DetailsStepProps) {
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit();
			}}
			className="space-y-6"
		>
			<div className="overflow-hidden rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] card-shadow">
				<div className="border-b border-[var(--color-line)] px-6 py-5">
					<p className="text-base font-semibold text-[var(--color-ink)]">Your details</p>
					<p className="mt-1 text-sm text-[var(--color-ink-dim)]">
						{customerId
							? 'Signed in — confirm your details below.'
							: 'We use this to confirm your appointment and send reminders.'}
					</p>
				</div>
				<div className="space-y-4 px-6 py-6">
					<Field label="Email" required error={fieldErrors.email?.[0]}>
						<input
							type="email"
							required
							value={email}
							onChange={(e) => onChangeEmail(e.target.value)}
							placeholder="your@email.com"
							className="w-full rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-ink-dim)] focus:border-[var(--color-primary)]"
						/>
					</Field>
					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="First Name" error={fieldErrors.firstName?.[0]}>
							<input
								type="text"
								value={firstName}
								onChange={(e) => onChangeFirstName(e.target.value)}
								placeholder="Jane"
								className="w-full rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-ink-dim)] focus:border-[var(--color-primary)]"
							/>
						</Field>
						<Field label="Last Name" error={fieldErrors.lastName?.[0]}>
							<input
								type="text"
								value={lastName}
								onChange={(e) => onChangeLastName(e.target.value)}
								placeholder="Smith"
								className="w-full rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-ink-dim)] focus:border-[var(--color-primary)]"
							/>
						</Field>
					</div>
				</div>
			</div>

			<button
				type="submit"
				disabled={submitting || !canSubmit}
				className="flex w-full items-center justify-center gap-2.5 rounded-full bg-[var(--color-primary)] px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-[var(--color-primary-bright)] disabled:cursor-not-allowed disabled:opacity-40"
			>
				{submitting ? 'Reserving…' : 'Continue to payment'}
				{!submitting && (
					<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
					</svg>
				)}
			</button>
		</form>
	);
}

function Field({
	label,
	required,
	error,
	children,
}: {
	label: string;
	required?: boolean;
	error?: string;
	children: React.ReactNode;
}) {
	return (
		<div>
			<label className="mb-1 block text-sm font-semibold text-[var(--color-ink)]">
				{label}
				{required && <span className="ml-1 text-[var(--color-primary)]">*</span>}
			</label>
			{children}
			{error && <p className="mt-1 text-xs text-red-600">{error}</p>}
		</div>
	);
}
