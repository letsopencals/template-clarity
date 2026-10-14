'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, type Transition } from 'framer-motion';
import type { OrderDetailResponse } from '@opencals/storefront-sdk';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { DURATION, EASE_OUT } from '@/components/motion/easing';
import { icsHref, ICS_FILENAME } from '@/lib/calendar';
import { useVisitRows, type DepartmentIndex } from './visit-model';
import { VisitPass } from './visit-pass';
import { PrepNotes } from './prep-notes';
import { AccountPrompt } from './account-prompt';
import { GuestFallback } from './guest-fallback';

// Guests can't read the order (the route requires a session) — resolve to null
// rather than throwing, and don't go through lib/fetcher (its 401 handler would
// treat this as an expired session).
async function orderFetcher(url: string): Promise<OrderDetailResponse | null> {
	try {
		const res = await fetch(url);
		return res.ok ? ((await res.json()) as OrderDetailResponse) : null;
	} catch {
		return null;
	}
}

const SWR_OPTIONS = { revalidateOnFocus: false, revalidateIfStale: false, shouldRetryOnError: false } as const;

const MASK_INITIAL = { y: '105%' };
const MASK_ANIMATE = { y: '0%' };
const TITLE_TRANSITION: Transition = { duration: DURATION.slow, ease: EASE_OUT, delay: 0.1 };
const SIDE_INITIAL = { opacity: 0, y: 24 };
const SIDE_ANIMATE = { opacity: 1, y: 0 };
const SIDE_TRANSITION: Transition = { duration: DURATION.base, ease: EASE_OUT, delay: 0.6 };

/** /thank-you?orderId= — one visit pass per visit, how to prepare, and the care-record prompt. */
export function ThankYouView({ departments }: { departments: DepartmentIndex }) {
	const orderId = useSearchParams().get('orderId');
	const { status } = useSession();
	const reduce = useReducedMotion();
	const authenticated = status === 'authenticated';

	const { data: order, isLoading } = useSWR(orderId ? `/api/account/orders/${orderId}` : null, orderFetcher, SWR_OPTIONS);
	const rows = useVisitRows(order ?? null, departments);
	const sessionLoading = status === 'loading';

	return (
		<section className="bg-paper pt-28 pb-24 sm:pt-32 lg:pt-40 lg:pb-32">
			<div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">
				<header className="pb-10 sm:pb-12">
					<p className="eyebrow text-ink-muted">
						<span className="tabular text-brass">Confirmed</span> · Your visit pass
					</p>
					<h1 className="display-lg mt-6 overflow-hidden pb-[0.08em] text-ink">
						<motion.span className="block" initial={reduce ? false : MASK_INITIAL} animate={MASK_ANIMATE} transition={TITLE_TRANSITION}>
							You&rsquo;re booked. <em>Breathe.</em>
						</motion.span>
					</h1>
					<p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-ink-muted">
						We&rsquo;ve emailed your confirmation and we&rsquo;ll remind you before the visit. Everything you need is below.
					</p>
				</header>

				{isLoading || sessionLoading ? (
					<div className="grid grid-cols-1 gap-10 lg:grid-cols-12" aria-busy="true" aria-label="Loading your visit pass">
						<div className="image-placeholder h-[420px] rounded-card lg:col-span-7" />
						<div className="hidden space-y-4 lg:col-span-5 lg:block">
							<div className="image-placeholder h-56 rounded-card" />
							<div className="image-placeholder h-40 rounded-card" />
						</div>
					</div>
				) : !order || rows.length === 0 ? (
					<GuestFallback orderId={orderId} />
				) : (
					<div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14 xl:gap-20">
						<div className="min-w-0 space-y-6 lg:col-span-7">
							{rows.map((row, i) => (
								<VisitPass
									key={row.id}
									row={row}
									index={i}
									count={rows.length}
									orderName={order.name ?? null}
									authenticated={authenticated}
								/>
							))}
							{rows.length > 1 ? (
								<a
									href={icsHref(rows.map((r) => r.event))}
									download={ICS_FILENAME}
									className="eyebrow link-underline inline-block text-[0.62rem] text-ink-muted hover:text-ink"
								>
									Add all {rows.length} visits to your calendar
								</a>
							) : null}
						</div>
						<motion.div
							className="min-w-0 space-y-6 lg:col-span-5"
							initial={reduce ? false : SIDE_INITIAL}
							animate={SIDE_ANIMATE}
							transition={SIDE_TRANSITION}
						>
							<PrepNotes rows={rows} />
							<AccountPrompt authenticated={authenticated} />
							<Link href="/care" className="eyebrow link-underline inline-block text-[0.62rem] text-ink-muted hover:text-ink">
								Book another visit
							</Link>
						</motion.div>
					</div>
				)}
			</div>
		</section>
	);
}
