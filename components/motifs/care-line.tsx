'use client';

import { motion, type Transition } from 'framer-motion';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { DURATION, EASE_IN_OUT, EASE_OUT, VIEWPORT_ONCE } from '@/components/motion/easing';

/*
 * The care line — Clear Care's signature (DESIGN.md §3). A hairline with one
 * gentle pulse that draws itself in view, and SETTLES to a flat, calm line once
 * the patient is booked ("from worry to calm"). Both paths share the same
 * command list so framer can morph `d` between them.
 */
const PULSE = 'M0 20 L560 20 L578 20 L590 7 L604 33 L616 12 L626 20 L1000 20';
const CALM = 'M0 20 L560 20 L578 20 L590 20 L604 20 L616 20 L626 20 L1000 20';

const DRAW: Transition = { duration: DURATION.drive, ease: EASE_OUT };
const SETTLE: Transition = { duration: 1.2, ease: EASE_IN_OUT, delay: 0.2 };

export interface CareLineProps {
	/** Flatten the pulse (booked / confirmed / "Breathe."). */
	settled?: boolean;
	/** Draw when scrolled into view (default) or immediately on mount. */
	trigger?: 'view' | 'mount';
	/** Where the pulse sits along the line, 0–1. */
	tone?: 'steel' | 'brass' | 'light';
	className?: string;
}

export function CareLine({ settled = false, trigger = 'view', tone = 'steel', className }: CareLineProps) {
	const reduce = useReducedMotion();
	const target = settled ? CALM : PULSE;
	const drawn = { pathLength: 1, opacity: 1, d: target };
	const color = tone === 'brass' ? 'text-brass' : tone === 'light' ? 'text-paper/70' : 'text-steel';
	return (
		<svg
			viewBox="0 0 1000 40"
			preserveAspectRatio="none"
			className={clsx('block h-10 w-full overflow-visible', color, className)}
			aria-hidden
		>
			<motion.path
				d={target}
				fill="none"
				stroke="currentColor"
				strokeWidth={1.25}
				strokeLinecap="round"
				strokeLinejoin="round"
				// `d` is in every target so framer always has a from-value to morph.
				initial={reduce ? false : { pathLength: 0, opacity: 0, d: target }}
				{...(trigger === 'mount' ? { animate: drawn } : { whileInView: drawn, viewport: VIEWPORT_ONCE, animate: { d: target } })}
				transition={{ default: DRAW, d: SETTLE }}
			/>
		</svg>
	);
}
