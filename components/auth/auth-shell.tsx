'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, type Transition } from 'framer-motion';
import { Reveal } from '@/components/motion/reveal';
import { WindowFrame } from '@/components/motifs/window-frame';
import { CareLine } from '@/components/motifs/care-line';
import { Seal } from '@/components/motifs/seal';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { DURATION, EASE_OUT } from '@/components/motion/easing';
import { siteConfig } from '@/lib/site-config';

const QUOTE_INTERVAL_MS = 8000;
const QUOTE_FROM = { opacity: 0, y: 12 } as const;
const QUOTE_TO = { opacity: 1, y: 0 } as const;
const QUOTE_EXIT = { opacity: 0, y: -8 } as const;
const QUOTE_FADE = { opacity: 0 } as const;
const QUOTE_T: Transition = { duration: DURATION.base, ease: EASE_OUT };

export const AUTH_IMAGES = {
	care: '/images/trust/trust-care.jpg',
	detail: '/images/about/about-detail.jpg',
} as const;

export interface AuthShellProps {
	/** Small line above the title ("My Care"). */
	eyebrow?: string;
	/** Display headline — put the emotional word in <em>. */
	title: React.ReactNode;
	intro?: React.ReactNode;
	children: React.ReactNode;
	/** Line under the form ("New here? Create an account"). */
	footer?: React.ReactNode;
	image?: string;
	/** Caption on the photograph. */
	caption?: string;
}

/**
 * Split frame for every auth page: a calm photograph in a window on the left
 * (sticky, with a patient's words and the nurse line), the form on paper on the
 * right. On small screens the window shrinks to a short banner above the form.
 */
export function AuthShell({
	eyebrow = 'My Care',
	title,
	intro,
	children,
	footer,
	image = AUTH_IMAGES.care,
	caption = 'Your care record, kept quietly in one place',
}: AuthShellProps) {
	return (
		<section className="relative min-h-[100svh] bg-paper lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
			<aside className="relative hidden bg-cream lg:block">
				<div className="sticky top-0 flex h-[100svh] flex-col gap-8 px-10 pt-28 pb-10 xl:px-16">
					<WindowFrame
						src={image}
						alt=""
						aspect="aspect-auto"
						className="min-h-0 flex-1"
						sizes="(min-width: 1024px) 45vw, 0px"
						priority
						daylight
					>
						<div className="scrim-bottom absolute inset-x-0 bottom-0 z-[3] px-8 pt-24 pb-7">
							<p className="eyebrow text-paper/80">{caption}</p>
						</div>
					</WindowFrame>
					<PatientWords />
				</div>
			</aside>

			<div className="relative flex flex-col px-5 pt-24 pb-16 sm:px-10 lg:min-h-[100svh] lg:justify-center lg:px-16 lg:pt-28 xl:px-24">
				<div className="mx-auto mb-8 w-full max-w-[440px] lg:hidden">
					<WindowFrame src={image} alt="" aspect="aspect-[16/7]" sizes="(max-width: 1023px) 440px, 0px" priority />
				</div>

				<div className="mx-auto w-full max-w-[440px]">
					<Reveal>
						<div className="flex items-center gap-3">
							<Link
								href="/"
								className="rounded-sm font-display text-xl tracking-tight text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-steel"
								aria-label={`${siteConfig.name} home`}
							>
								{siteConfig.logo.text} <em className="text-steel">{siteConfig.logo.accent}</em>
							</Link>
							<span aria-hidden className="h-px flex-1 bg-brass/40" />
							<span className="eyebrow text-brass">{eyebrow}</span>
						</div>
						<h1 className="display-md mt-8 text-ink">{title}</h1>
						{intro ? <div className="prose-calm mt-4 max-w-[40ch] text-[15px] text-ink-muted">{intro}</div> : null}
					</Reveal>

					<Reveal delay={0.1} className="mt-9">
						{children}
					</Reveal>

					{footer ? <div className="mt-10 border-t border-line pt-6 text-center text-sm text-ink-muted">{footer}</div> : null}

					<p className="mt-8 text-center text-xs leading-relaxed text-ink-dim">
						Need help signing in? Call{' '}
						<a href={siteConfig.contact.phoneHref} className="tabular text-ink-muted underline-offset-4 hover:text-steel hover:underline">
							{siteConfig.contact.phone}
						</a>
						. {siteConfig.emergency.short}
					</p>
				</div>
			</div>
		</section>
	);
}

/** Underlined inline link used in auth footers. */
export function AuthLink({ href, children }: { href: string; children: React.ReactNode }) {
	return (
		<Link href={href} className="link-underline font-semibold text-steel transition-colors hover:text-steel-deep">
			{children}
		</Link>
	);
}

/** A patient's words under the window, crossfading slowly (still for reduced motion). */
function PatientWords() {
	const words = siteConfig.testimonials;
	const reduce = useReducedMotion();
	const [index, setIndex] = useState(0);

	useEffect(() => {
		if (reduce || words.length < 2) return;
		const id = window.setInterval(() => setIndex((i) => (i + 1) % words.length), QUOTE_INTERVAL_MS);
		return () => window.clearInterval(id);
	}, [reduce, words.length]);

	const item = words[index];
	if (!item) return null;

	return (
		<div className="flex items-end gap-6">
			<figure className="min-w-0 flex-1" aria-live="off">
				<div className="w-28">
					<CareLine settled tone="brass" trigger="mount" />
				</div>
				<div className="relative mt-3 min-h-[6.5rem]">
					<AnimatePresence mode="wait" initial={false}>
						<motion.blockquote key={index} initial={reduce ? QUOTE_FADE : QUOTE_FROM} animate={QUOTE_TO} exit={reduce ? QUOTE_FADE : QUOTE_EXIT} transition={QUOTE_T}>
							<p className="font-display text-[1.3rem] leading-snug text-ink italic">&ldquo;{item.quote}&rdquo;</p>
							<figcaption className="eyebrow mt-3 text-ink-muted">
								{item.author} <span className="text-brass">·</span> {item.context}
							</figcaption>
						</motion.blockquote>
					</AnimatePresence>
				</div>
			</figure>
			<Seal size={84} className="shrink-0 max-xl:hidden" />
		</div>
	);
}
