'use client';

import { useId, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { useCart } from '@/contexts/cart-context';

/**
 * Compact promo-code group shared by the drawer and /checkout. Collapsed to a
 * single line until opened; the applied code shows as a chip with Remove.
 */
export function PromoCode({ className }: { className?: string }) {
	const { cart, applyDiscountCode, removeDiscountCode, discountCodeError, clearDiscountCodeError } = useCart();
	const [open, setOpen] = useState(false);
	const [code, setCode] = useState('');
	const [pending, setPending] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const inputId = useId();
	const errorId = useId();

	const applied = cart?.appliedDiscountCode ?? null;

	const handleApply = async (e: React.FormEvent) => {
		e.preventDefault();
		e.stopPropagation();
		const value = code.trim();
		if (!value) return;
		setPending(true);
		try {
			const ok = await applyDiscountCode(value);
			if (ok) {
				setCode('');
				setOpen(false);
			}
		} finally {
			setPending(false);
		}
	};

	const handleToggle = () => {
		clearDiscountCodeError();
		setOpen((v) => !v);
		if (!open) setTimeout(() => inputRef.current?.focus(), 0);
	};

	const handleRemove = async () => {
		setPending(true);
		try {
			await removeDiscountCode();
		} finally {
			setPending(false);
		}
	};

	if (applied) {
		return (
			<div className={clsx('flex items-center justify-between gap-3', className)}>
				<span className="eyebrow text-[0.62rem] text-ink-muted">Code</span>
				<span className="flex items-center gap-3">
					<span className="tabular rounded-full border border-dashed border-sage px-3 py-1 text-xs uppercase text-sage-deep">{applied}</span>
					<button
						type="button"
						onClick={handleRemove}
						disabled={pending}
						className="rounded-full text-xs text-ink-muted underline-offset-4 hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-steel disabled:opacity-50"
					>
						Remove<span className="sr-only"> code {applied}</span>
					</button>
				</span>
			</div>
		);
	}

	return (
		<div className={className}>
			<button
				type="button"
				onClick={handleToggle}
				aria-expanded={open}
				className="group flex items-center gap-2 rounded-full text-xs text-ink-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-steel"
			>
				<span className={clsx('tabular inline-block transition-transform duration-300', open ? 'rotate-45' : null)} aria-hidden>
					+
				</span>
				<span className="link-underline">{open ? 'Hide the code field' : 'Have a promo or referral code?'}</span>
			</button>
			{open ? (
				<form onSubmit={handleApply} className="mt-3 flex gap-2">
					<label htmlFor={inputId} className="sr-only">
						Promo code
					</label>
					<input
						id={inputId}
						ref={inputRef}
						type="text"
						value={code}
						autoComplete="off"
						spellCheck={false}
						onChange={(e) => {
							setCode(e.target.value);
							if (discountCodeError) clearDiscountCodeError();
						}}
						aria-invalid={discountCodeError ? true : undefined}
						aria-describedby={discountCodeError ? errorId : undefined}
						placeholder="Enter code"
						className="tabular min-w-0 flex-1 rounded-full border border-line-strong bg-card px-4 py-2.5 text-sm uppercase text-ink outline-none transition-[border-color,box-shadow] placeholder:normal-case placeholder:text-ink-dim focus:border-steel focus:shadow-[0_0_0_4px_rgba(63,110,140,0.12)] aria-[invalid=true]:border-clay"
					/>
					<button
						type="submit"
						disabled={pending || !code.trim()}
						className="rounded-full bg-steel px-5 text-[13px] font-semibold text-white transition-colors hover:bg-steel-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-steel disabled:opacity-45"
					>
						{pending ? 'Applying…' : 'Apply'}
					</button>
				</form>
			) : null}
			{discountCodeError ? (
				<p id={errorId} role="alert" className="mt-2 text-xs text-clay">
					{discountCodeError.message ?? 'That code didn’t work. Check it and try again.'}
				</p>
			) : null}
		</div>
	);
}
