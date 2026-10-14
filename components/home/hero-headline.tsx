'use client';

import { motion, type Transition } from 'framer-motion';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { DURATION, EASE_OUT } from '@/components/motion/easing';

const FROM = { y: '108%' } as const;
const TO = { y: '0%' } as const;
const T1: Transition = { duration: DURATION.slow, ease: EASE_OUT, delay: 0.15 };
const T2: Transition = { duration: DURATION.slow, ease: EASE_OUT, delay: 0.27 };

/** "Care that has / *time for you.*" — two masked lines rising on mount. */
export function HeroHeadline({ lead, accent }: { lead: string; accent: string }) {
	const reduce = useReducedMotion();
	return (
		<h1 className="display-xl text-ink">
			<span className="block overflow-hidden pb-[0.06em]">
				<motion.span className="block" initial={reduce ? false : FROM} animate={TO} transition={T1}>
					{lead}
				</motion.span>
			</span>
			<span className="block overflow-hidden pb-[0.12em]">
				<motion.em className="block" initial={reduce ? false : FROM} animate={TO} transition={T2}>
					{accent}
				</motion.em>
			</span>
		</h1>
	);
}
