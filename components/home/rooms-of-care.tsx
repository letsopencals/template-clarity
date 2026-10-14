'use client';

import { useState, type PointerEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useMotionValue, useSpring, type Transition } from 'framer-motion';
import { clsx } from 'clsx';
import { DepartmentIcon } from '@/components/ui/department-icon';
import { SectionHeader } from '@/components/ui/section-header';
import { Reveal } from '@/components/motion/reveal';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { EASE_OUT } from '@/components/motion/easing';
import { VideoBadge } from '@/components/services/video-badge';

export interface RoomItem {
	slug: string;
	title: string;
	tagline: string;
	image: string;
	icon: string;
	fromLabel: string | null;
	video: boolean;
	count: number;
}

const FOLLOW = { stiffness: 180, damping: 24, mass: 0.6 } as const;
const PREVIEW_FROM = { opacity: 0, scale: 0.9, clipPath: 'inset(30% 0% 0% 0% round 28px)' } as const;
const PREVIEW_TO = { opacity: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0% round 28px)' } as const;
const PREVIEW_T: Transition = { duration: 0.45, ease: EASE_OUT };
const IMG_FROM = { opacity: 0, scale: 1.08 } as const;
const IMG_TO = { opacity: 1, scale: 1 } as const;
const IMG_EXIT = { opacity: 0 } as const;
const IMG_T: Transition = { duration: 0.5, ease: EASE_OUT };

/**
 * "Rooms of care": the nine departments as a numbered index. On desktop a
 * window follows the pointer, showing the room you're hovering; on touch and
 * small screens each room is an image card.
 */
export function RoomsOfCare({ rooms }: { rooms: RoomItem[] }) {
	const reduce = useReducedMotion();
	const [active, setActive] = useState<number | null>(null);
	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const sx = useSpring(x, FOLLOW);
	const sy = useSpring(y, FOLLOW);

	const onMove = (e: PointerEvent<HTMLElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		x.set(e.clientX - rect.left);
		y.set(e.clientY - rect.top);
	};

	const current = active !== null ? rooms[active] : null;

	return (
		<section className="section-y overflow-x-clip bg-paper" id="departments">
			<div className="container-x">
				<SectionHeader
					eyebrow="02 · Rooms of care"
					title={
						<>
							Nine rooms, <em>one practice.</em>
						</>
					}
					lead="Every department sits under one roof and one record — so your doctor, your dentist and your physio are never strangers to each other."
					action={
						<Link href="/departments" className="link-underline text-sm font-medium text-steel">
							All departments
						</Link>
					}
				/>

				{rooms.length === 0 ? (
					<p className="mt-14 text-ink-muted">Our departments are being updated. Please check back in a moment.</p>
				) : null}

				{/* Desktop: index with a pointer-following window */}
				<div className="relative mt-16 hidden lg:block" onPointerMove={onMove} onPointerLeave={() => setActive(null)}>
					<ol className="border-t border-line">
						{rooms.map((r, i) => (
							<li key={r.slug} className="border-b border-line">
								<Link
									href={`/departments/${r.slug}`}
									onPointerEnter={() => setActive(i)}
									onFocus={() => setActive(i)}
									onBlur={() => setActive(null)}
									className="group grid grid-cols-[4rem_1fr_auto] items-center gap-6 py-7 focus-visible:outline-none"
								>
									<span className="tabular text-sm text-ink-dim">{String(i + 1).padStart(2, '0')}</span>
									<span className="flex min-w-0 items-baseline gap-6">
										<span
											className={clsx(
												'font-display text-[2.6rem] leading-none tracking-tight transition-all duration-500',
												active === i ? 'translate-x-3 italic text-steel' : active !== null ? 'text-ink/35' : 'text-ink',
											)}
										>
											{r.title}
										</span>
										<span className={clsx('truncate text-[15px] transition-opacity duration-500', active === i ? 'text-ink-muted opacity-100' : 'opacity-0')}>{r.tagline}</span>
									</span>
									<span className="flex items-center gap-5 text-sm">
										{r.video ? <VideoBadge /> : null}
										{r.fromLabel ? (
											<span className="tabular text-ink-muted">
												from <span className="text-ink">{r.fromLabel}</span>
											</span>
										) : null}
										<span className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong text-steel transition-all duration-300 group-hover:border-steel group-hover:bg-steel group-hover:text-paper group-focus-visible:ring-2 group-focus-visible:ring-steel/40">
											<DepartmentIcon name="arrow" className="h-4 w-4" />
										</span>
									</span>
								</Link>
							</li>
						))}
					</ol>

					{!reduce ? (
						<motion.div aria-hidden className="pointer-events-none absolute left-0 top-0 z-20" style={{ x: sx, y: sy }}>
							<div className="translate-x-10 -translate-y-1/2">
							<AnimatePresence>
								{current ? (
									<motion.div
										key="preview"
										className="window relative shadow-float"
										style={{ width: 280, height: 350 }}
										initial={PREVIEW_FROM}
										animate={PREVIEW_TO}
										exit={PREVIEW_FROM}
										transition={PREVIEW_T}
									>
										<AnimatePresence initial={false}>
											<motion.div key={current.slug} className="image-placeholder absolute inset-0" initial={IMG_FROM} animate={IMG_TO} exit={IMG_EXIT} transition={IMG_T}>
												<Image src={current.image} alt="" fill sizes="280px" className="object-cover" />
											</motion.div>
										</AnimatePresence>
										<span className="daylight" />
										<span className="scrim-bottom absolute inset-x-0 bottom-0 z-[3] flex h-1/3 items-end p-5">
											<span className="flex items-center gap-2 text-[13px] font-medium text-paper">
												<DepartmentIcon name={current.icon} className="h-4 w-4" />
												{current.count} {current.count === 1 ? 'visit type' : 'visit types'}
											</span>
										</span>
									</motion.div>
								) : null}
							</AnimatePresence>
							</div>
						</motion.div>
					) : null}
				</div>

				{/* Mobile + tablet: image cards */}
				<ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:hidden">
					{rooms.map((r, i) => (
						<Reveal as="li" key={r.slug} delay={(i % 2) * 0.06} className="min-w-0">
							<Link href={`/departments/${r.slug}`} className="group block focus-visible:outline-none">
								<div className="window image-placeholder relative aspect-[5/4]">
									<Image src={r.image} alt="" fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
									<span className="scrim-bottom absolute inset-x-0 bottom-0 z-[3] h-1/2" />
									<span className="tabular absolute left-5 top-5 z-[3] rounded-full bg-paper/85 px-2.5 py-1 text-[11px] text-ink">{String(i + 1).padStart(2, '0')}</span>
									<span className="absolute inset-x-5 bottom-5 z-[3] flex items-end justify-between gap-3">
										<span className="font-display text-[1.7rem] leading-none tracking-tight text-paper">{r.title}</span>
										{r.video ? <VideoBadge tone="light" label="Video" /> : null}
									</span>
								</div>
								<p className="mt-3 flex items-baseline justify-between gap-4 text-sm">
									<span className="min-w-0 truncate text-ink-muted">{r.tagline}</span>
									{r.fromLabel ? <span className="tabular shrink-0 text-ink">from {r.fromLabel}</span> : null}
								</p>
							</Link>
						</Reveal>
					))}
				</ul>
			</div>
		</section>
	);
}
