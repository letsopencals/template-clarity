'use client';

import { useCallback } from 'react';
import { clsx } from 'clsx';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { formatPrice } from '@/lib/format';
import type { CartWithDiscounts } from '@/types/discount';
import { cartSubtotal } from './cart-line';

interface CartTotalsProps {
	cart: CartWithDiscounts;
	/** Show the tax line (checkout). The drawer keeps it short. */
	showTax?: boolean;
	className?: string;
}

/** Hook: a cents → currency formatter for AnimatedNumber (it rounds each frame, so tween in cents). */
export function useCentsFormatter(currency: string | undefined) {
	return useCallback((cents: number) => formatPrice(cents / 100, currency), [currency]);
}

const toCents = (n: number) => Math.round(n * 100);

/** Subtotal, discounts, optional tax and a live-tweening total, set as dotted leader lines. */
export function CartTotals({ cart, showTax = false, className }: CartTotalsProps) {
	const currency = cart.paymentCurrencyCode;
	const format = useCentsFormatter(currency);
	const subtotal = cartSubtotal(cart);
	const discounts = cart.appliedDiscounts ?? [];
	const total = cart.total ?? cart.subtotal ?? 0;

	return (
		<dl className={clsx('space-y-2.5 text-sm', className)}>
			<div className="flex items-baseline">
				<dt className="text-ink-muted">Subtotal</dt>
				<span className="leader-line" aria-hidden />
				<dd className="tabular text-ink">
					<AnimatedNumber value={toCents(subtotal)} format={format} />
				</dd>
			</div>
			{discounts.map((d) => (
				<div key={d.id} className="flex items-baseline">
					<dt className="min-w-0 truncate text-sage-deep">{d.title}</dt>
					<span className="leader-line" aria-hidden />
					<dd className="tabular text-sage-deep">−{formatPrice(d.totalAmount, currency)}</dd>
				</div>
			))}
			{showTax && cart.totalTax > 0 ? (
				<div className="flex items-baseline">
					<dt className="text-ink-muted">{cart.taxesIncluded ? 'Tax (included)' : 'Tax'}</dt>
					<span className="leader-line" aria-hidden />
					<dd className="tabular text-ink">{formatPrice(cart.totalTax, currency)}</dd>
				</div>
			) : null}
			<div className="flex items-baseline border-t border-line pt-3.5">
				<dt className="eyebrow text-ink">Total</dt>
				<span className="leader-line" aria-hidden />
				<dd className="tabular text-[1.35rem] leading-none text-ink">
					<AnimatedNumber value={toCents(total)} format={format} />
				</dd>
			</div>
		</dl>
	);
}
