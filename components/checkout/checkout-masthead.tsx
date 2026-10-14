'use client';

import Link from 'next/link';
import { motion, type Transition } from 'framer-motion';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { DURATION, EASE_OUT } from '@/components/motion/easing';
import { CareLine } from '@/components/motifs/care-line';

const MASK_INITIAL = { y: '105%' };
const MASK_ANIMATE = { y: '0%' };
const FADE_INITIAL = { opacity: 0, y: 8 };
const FADE_ANIMATE = { opacity: 1, y: 0 };
const TITLE_TRANSITION: Transition = { duration: DURATION.slow, ease: EASE_OUT, delay: 0.1 };
const META_TRANSITION: Transition = { duration: DURATION.base, ease: EASE_OUT, delay: 0.35 };

/** "Checkout — Confirm your visit" masthead with the care line settling underneath. */
export function CheckoutMasthead() {
	const reduce = useReducedMotion();
	return (
		<header className="pb-8 sm:pb-10">
			<div className="flex items-baseline justify-between gap-6">
				<p className="eyebrow text-ink-muted">
					<span className="tabular text-brass">Step 2 of 2</span> · Checkout
				</p>
				<Link href="/care" className="eyebrow link-underline text-ink-muted hover:text-ink">
					<span aria-hidden>← </span>Find care
				</Link>
			</div>
			<h1 className="display-lg mt-6 overflow-hidden pb-[0.08em] text-ink">
				<motion.span className="block" initial={reduce ? false : MASK_INITIAL} animate={MASK_ANIMATE} transition={TITLE_TRANSITION}>
					Confirm your <em>visit</em>
				</motion.span>
			</h1>
			<motion.p
				className="mt-4 max-w-[48ch] text-[15px] leading-relaxed text-ink-muted"
				initial={reduce ? false : FADE_INITIAL}
				animate={FADE_ANIMATE}
				transition={META_TRANSITION}
			>
				Two short steps. We&rsquo;re holding your time while you finish, and you can extend the hold if you need longer.
			</motion.p>
			<CareLine trigger="mount" tone="steel" className="mt-8 h-8 w-full max-w-[420px]" />
		</header>
	);
}
