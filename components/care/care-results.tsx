'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, type Transition } from 'framer-motion';
import { buttonClasses } from '@/components/ui/button';
import { VideoBadge } from '@/components/services/video-badge';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { EASE_OUT } from '@/components/motion/easing';
import { bookingHref, formatFee, visitLength, type VisitFor } from '@/lib/catalog';
import type { FinderVisit, MatchResult, SeenMode } from './match';
import { NextTimes } from './next-times';

const CARD_FROM = { opacity: 0, y: 24 } as const;
const CARD_TO = { opacity: 1, y: 0 } as const;
const cardT = (i: number): Transition => ({ duration: 0.6, ease: EASE_OUT, delay: 0.08 + i * 0.1 });

function ResultCard({ visit, index, who, mode, currency }: { visit: FinderVisit; index: number; who: VisitFor | null; mode: SeenMode | null; currency: string }) {
	const reduce = useReducedMotion();
	const linkMode = mode === 'video' && visit.video ? 'video' : mode === 'clinic' ? 'clinic' : null;
	return (
		<motion.li initial={reduce ? false : CARD_FROM} animate={CARD_TO} transition={cardT(index)} className="paper grid min-w-0 grid-cols-1 overflow-hidden md:grid-cols-[13rem_1fr]">
			<div className="image-placeholder relative hidden md:block">
				{visit.image ? <Image src={visit.image} alt="" fill sizes="208px" className="object-cover" /> : null}
				<span className="tabular absolute left-4 top-4 rounded-full bg-paper/90 px-2.5 py-1 text-[11px] text-ink">{index === 0 ? 'Best fit' : `Option ${index + 1}`}</span>
			</div>
			<div className="flex min-w-0 flex-col gap-4 p-6 md:p-7">
				<div className="flex flex-wrap items-center gap-2">
					{visit.departmentLabel ? <span className="eyebrow text-oak">{visit.departmentLabel}</span> : null}
					{index === 0 ? <span className="rounded-full bg-steel-tint px-2.5 py-0.5 text-[11px] font-semibold text-steel-deep md:hidden">Best fit</span> : null}
				</div>
				<div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
					<h3 className="display-xs text-ink">{visit.title}</h3>
					<p className="tabular shrink-0 text-sm text-ink-muted">
						{visitLength(visit.duration)} <span className="text-ink-dim">·</span> <span className="text-ink">{formatFee(visit.price, currency)}</span>
					</p>
				</div>
				{visit.reason ? <p className="text-[15px] leading-relaxed text-ink-muted">{visit.reason}</p> : null}
				<div className="flex flex-wrap gap-2">
					{visit.video ? <VideoBadge /> : <span className="rounded-full bg-cream px-2.5 py-1 text-[11px] font-semibold text-ink-muted">In clinic only</span>}
				</div>
				<div className="border-t border-line pt-4">
					<p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-dim">Next free</p>
					<NextTimes slug={visit.slug} mode={linkMode} />
				</div>
				<div className="mt-1 flex flex-wrap gap-3">
					<Link href={bookingHref(visit.slug, { for: who, mode: linkMode })} className={buttonClasses({ variant: index === 0 ? 'primary' : 'outline', size: 'md' })}>
						Book this visit
					</Link>
					{visit.department ? (
						<Link href={`/departments/${visit.department}`} className={buttonClasses({ variant: 'ghost', size: 'md' })}>
							About this department
						</Link>
					) : null}
				</div>
			</div>
		</motion.li>
	);
}

export function CareResults({ result, who, mode, currency }: { result: MatchResult; who: VisitFor | null; mode: SeenMode | null; currency: string }) {
	return (
		<div>
			{result.note ? <p className="mb-6 max-w-[60ch] rounded-card bg-honey-soft/70 px-5 py-4 text-[15px] leading-relaxed text-ink">{result.note}</p> : null}
			<ol className="flex flex-col gap-5">
				{result.visits.map((v, i) => (
					<ResultCard key={v.slug} visit={v} index={i} who={who} mode={mode} currency={currency} />
				))}
			</ol>
		</div>
	);
}
