'use client';

import { motion, type Transition } from 'framer-motion';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { EASE_OUT } from '@/components/motion/easing';
import { ClinicianFace } from '@/components/booking/clinician-face';
import type { PublicClinician } from '@/lib/clinicians';

interface ClinicianConfirmProps {
	/** "9:30 AM" */
	timeLabel: string;
	faces: PublicClinician[];
	confirmedId: string | null;
	onConfirm: (id: string) => void;
}

const INITIAL = { opacity: 0, y: 8 } as const;
const ANIMATE = { opacity: 1, y: 0 } as const;
const T: Transition = { duration: 0.45, ease: EASE_OUT };

/**
 * "First available" with several clinicians free at the chosen time: the
 * patient picks a face inline before Reserve (never booked blind).
 */
export function ClinicianConfirm({ timeLabel, faces, confirmedId, onConfirm }: ClinicianConfirmProps) {
	const reduce = useReducedMotion();
	return (
		<motion.div initial={reduce ? false : INITIAL} animate={ANIMATE} transition={T} className="rounded-card border border-line bg-cream p-5">
			<p className="font-semibold text-ink">
				Who would you like to see at <span className="tabular">{timeLabel}</span>?
			</p>
			<p className="mt-1 text-[14px] text-ink-muted">All of them are free then.</p>
			<div role="radiogroup" aria-label={`Clinicians free at ${timeLabel}`} className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
				{faces.map((c) => {
					const selected = confirmedId === c.id;
					return (
						<button
							key={c.id}
							type="button"
							role="radio"
							aria-checked={selected}
							onClick={() => onConfirm(c.id)}
							className={clsx(
								'flex min-w-0 items-center gap-3 rounded-field border px-3 py-2.5 text-left transition-colors duration-300',
								selected ? 'border-steel bg-steel-tint' : 'border-line bg-card hover:border-steel',
							)}
						>
							<ClinicianFace clinician={c} size="sm" />
							<span className="min-w-0">
								<span className="block truncate text-[14px] font-semibold text-ink">{c.name}</span>
								<span className="block truncate text-[12px] text-ink-muted">{c.title}</span>
							</span>
						</button>
					);
				})}
			</div>
		</motion.div>
	);
}
