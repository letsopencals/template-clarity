'use client';

import { motion, type Transition } from 'framer-motion';
import { clsx } from 'clsx';
import { useCart } from '@/contexts/cart-context';
import { AppointmentCard } from '@/components/cart/appointment-card';
import { CartTotals } from '@/components/cart/cart-totals';
import { HoldBar } from '@/components/cart/hold-bar';
import { PromoCode } from '@/components/cart/promo-code';
import { useCartLines } from '@/components/cart/cart-line';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { DURATION, EASE_OUT } from '@/components/motion/easing';
import { siteConfig } from '@/lib/site-config';

const CARD_INITIAL = { opacity: 0, y: 30 };
const CARD_ANIMATE = { opacity: 1, y: 0 };

// Alternate a slight fan so the stack reads as physical cards.
const FAN = ['-rotate-[0.6deg]', 'rotate-[0.6deg]'] as const;

function cardTransition(i: number): Transition {
	return { duration: DURATION.base, ease: EASE_OUT, delay: 0.25 + i * 0.08 };
}

/** Right column: the appointment cards (read-only, slightly fanned), promo, totals, the hold and the emergency line. */
export function OrderStack({ className }: { className?: string }) {
	const { cart, timeRemaining, extendCart } = useCart();
	const lines = useCartLines(cart);
	const reduce = useReducedMotion();

	if (!cart) return null;

	return (
		<div className={clsx('space-y-8', className)}>
			<div className="flex items-baseline justify-between">
				<p className="eyebrow text-ink-muted">Your visits</p>
				<p className="tabular text-xs text-brass">
					{String(lines.length).padStart(2, '0')} {lines.length === 1 ? 'visit held' : 'visits held'}
				</p>
			</div>

			<ul className="relative space-y-5">
				{lines.map((line, i) => (
					<motion.li
						key={line.id}
						initial={reduce ? false : CARD_INITIAL}
						animate={CARD_ANIMATE}
						transition={cardTransition(i)}
						className={clsx('relative', reduce ? null : FAN[i % 2])}
					>
						{/* A paper sheet peeking out behind each card. */}
						<span aria-hidden className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-card border border-line bg-cream" />
						<AppointmentCard line={line} index={i} currency={cart.paymentCurrencyCode} className="shadow-card" />
					</motion.li>
				))}
			</ul>

			<div className="paper border border-line px-5 py-6">
				<PromoCode />
				<CartTotals cart={cart} showTax className="mt-6" />
			</div>

			{timeRemaining !== null ? (
				<div className="rounded-card border border-line bg-card px-5 py-4">
					<HoldBar timeRemaining={timeRemaining} expiresAt={cart.expiresAt} onExtend={extendCart} />
				</div>
			) : null}

			<p className="flex gap-2.5 text-xs leading-relaxed text-ink-muted">
				<span aria-hidden className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />
				{siteConfig.emergency.long}
			</p>
		</div>
	);
}
