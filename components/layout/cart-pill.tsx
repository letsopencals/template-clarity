'use client';

import { clsx } from 'clsx';
import { useCart } from '@/contexts/cart-context';
import { useHydrated } from '@/hooks/use-hydrated';

/** "Your visits (n)" — opens the cart drawer. Count shows after hydration (cart is client state). */
export function CartPill({ onOpen, className }: { onOpen: () => void; className?: string }) {
	const { cart } = useCart();
	const hydrated = useHydrated();
	const count = hydrated ? (cart?.items?.length ?? 0) : 0;
	return (
		<button
			type="button"
			onClick={onOpen}
			aria-label={count ? `Your visits, ${count} in your basket` : 'Your visits'}
			className={clsx(
				'group inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel/40',
				count ? 'border-steel/40 bg-steel-tint text-steel-deep hover:border-steel' : 'border-line-strong text-ink hover:border-steel hover:text-steel',
				className,
			)}
		>
			<svg aria-hidden className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
				<rect x="4" y="5" width="16" height="15" rx="2.5" />
				<path strokeLinecap="round" d="M8 3v4M16 3v4M4 10h16" />
			</svg>
			<span>Your visits</span>
			{count ? (
				<span className="tabular flex h-5 min-w-5 items-center justify-center rounded-full bg-steel px-1.5 text-[11px] text-paper">{count}</span>
			) : null}
		</button>
	);
}
