'use client';

import Image from 'next/image';
import { motion, type Transition } from 'framer-motion';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { DURATION, EASE_EXPO, VIEWPORT_ONCE } from '@/components/motion/easing';

const SHUT = { clipPath: 'inset(100% 0% 0% 0% round 28px)' } as const;
const OPEN = { clipPath: 'inset(0% 0% 0% 0% round 28px)' } as const;
const OPEN_T: Transition = { duration: DURATION.slow, ease: EASE_EXPO };
const IMG_FROM = { scale: 1.12 } as const;
const IMG_TO = { scale: 1 } as const;
const IMG_T: Transition = { duration: 1.6, ease: EASE_EXPO };
const INSTANT: Transition = { duration: 0 };

export interface WindowFrameProps {
	src: string;
	alt: string;
	/** Tailwind aspect class, e.g. `aspect-[4/5]`. Reserve space → no CLS. */
	aspect?: string;
	sizes?: string;
	priority?: boolean;
	/** Reveal like a blind rising (default) or render static. */
	reveal?: boolean;
	/** Slow daylight sweep across the image. */
	daylight?: boolean;
	className?: string;
	imageClassName?: string;
	children?: React.ReactNode;
}

/**
 * The window — every Clear Care image sits in one (DESIGN.md §3): soft radius,
 * inset brass hairline, optional "daylight" sweep, and a blind-rise reveal.
 * Children render on top (captions, floating chips).
 */
export function WindowFrame({
	src,
	alt,
	aspect = 'aspect-[4/5]',
	sizes = '(min-width: 1024px) 40vw, 100vw',
	priority,
	reveal = true,
	daylight,
	className,
	imageClassName,
	children,
}: WindowFrameProps) {
	const reduce = useReducedMotion();
	const animate = reveal && !reduce && !priority;
	// SSR renders the shut blind (reduced motion is only known after hydration), so
	// the static path must still drive it open — `initial` is read on mount only.
	return (
		<motion.div
			className={clsx('window image-placeholder', aspect, className)}
			initial={animate ? SHUT : false}
			whileInView={animate ? OPEN : undefined}
			animate={animate ? undefined : OPEN}
			viewport={VIEWPORT_ONCE}
			transition={animate ? OPEN_T : INSTANT}
		>
			<motion.div
				className="absolute inset-0"
				initial={animate ? IMG_FROM : false}
				whileInView={animate ? IMG_TO : undefined}
				animate={animate ? undefined : IMG_TO}
				viewport={VIEWPORT_ONCE}
				transition={animate ? IMG_T : INSTANT}
			>
				<Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={clsx('object-cover', imageClassName)} />
			</motion.div>
			{daylight ? <span className="daylight" aria-hidden /> : null}
			{children}
		</motion.div>
	);
}
