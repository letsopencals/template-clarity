'use client';

import { motion, type Transition } from 'framer-motion';
import { clsx } from 'clsx';
import { useId } from 'react';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { EASE_OUT } from '@/components/motion/easing';

const STAMP_FROM = { scale: 1.5, opacity: 0, rotate: -16 } as const;
const STAMP_TO = { scale: 1, opacity: 1, rotate: -8 } as const;
const STAMP_TRANSITION: Transition = { type: 'spring', stiffness: 360, damping: 24, mass: 0.8 };
const RING_TRANSITION: Transition = { duration: 1.1, ease: EASE_OUT, delay: 0.15 };

export interface SealProps {
	/** Text set around the ring. Repeats to fill. */
	ring?: string;
	/** Centre monogram. */
	center?: string;
	size?: number;
	/** 'stamp' presses the seal down on mount; 'static' does nothing. */
	motion?: 'stamp' | 'static';
	className?: string;
}

/**
 * The brass Clear Care monogram seal (DESIGN.md §3). Pressed onto the
 * appointment card ("Held for you"), the visit pass ("Confirmed") and used
 * small in the footer. Brass only — never a fill colour.
 */
export function Seal({
	ring = 'Clear Care Medical · Care with time · ',
	center = 'CC',
	size = 112,
	motion: mode = 'static',
	className,
}: SealProps) {
	const reduce = useReducedMotion();
	const id = useId().replace(/:/g, '');
	const stamp = mode === 'stamp' && !reduce;
	return (
		<motion.div
			className={clsx('relative inline-flex items-center justify-center text-brass', className)}
			style={{ width: size, height: size }}
			initial={stamp ? STAMP_FROM : false}
			animate={stamp ? STAMP_TO : undefined}
			transition={STAMP_TRANSITION}
			aria-hidden
		>
			<svg viewBox="0 0 120 120" width={size} height={size}>
				<defs>
					<path id={id} d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" />
				</defs>
				<motion.circle
					cx="60"
					cy="60"
					r="57"
					fill="none"
					stroke="currentColor"
					strokeWidth="1"
					initial={stamp ? { pathLength: 0 } : false}
					animate={{ pathLength: 1 }}
					transition={RING_TRANSITION}
				/>
				<circle cx="60" cy="60" r="34" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.6" />
				<text
					fill="currentColor"
					style={{ fontSize: 8.4, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'var(--font-body)', fontWeight: 600 }}
				>
					<textPath href={`#${id}`} startOffset="0">
						{ring.repeat(Math.max(1, Math.ceil(62 / ring.length)))}
					</textPath>
				</text>
			</svg>
			<span className="font-display absolute italic leading-none tracking-[-0.04em]" style={{ fontSize: size * 0.27 }}>
				{center}
			</span>
		</motion.div>
	);
}
