'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { motion, type Transition } from 'framer-motion';
import { clsx } from 'clsx';
import { useNow } from '@/hooks/use-now';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { SPRING_SOFT } from '@/components/motion/easing';
import { CareLine } from '@/components/motifs/care-line';
import { FamilyChips } from '@/components/account/family-chips';
import { ShellSkeleton } from '@/components/account/skeletons';
import { useFilteredCare, usePersonFilter } from '@/components/account/use-care';
import { useProfile } from '@/components/account/use-profile';

const NAV = [
	{ href: '/account', label: 'Overview', exact: true },
	{ href: '/account/appointments', label: 'Visits', exact: false },
	{ href: '/account/orders', label: 'Billing', exact: false },
	{ href: '/account/settings', label: 'Settings', exact: false },
] as const;

const UNDERLINE_T: Transition = SPRING_SOFT;
const NO_T: Transition = { duration: 0 };

function partOfDay(hour: number): string {
	if (hour < 5) return 'Good evening';
	if (hour < 12) return 'Good morning';
	if (hour < 18) return 'Good afternoon';
	return 'Good evening';
}

/** "Good afternoon, Anna." — only once the visitor's clock is known. */
function Greeting() {
	const now = useNow();
	const { profile } = useProfile();
	const { data: session } = useSession();
	const name = profile?.firstName || session?.customer?.firstName || '';
	const hello = now ? partOfDay(now.getHours()) : 'Welcome';
	return (
		<h1 className="display-md text-ink">
			{hello}
			{name ? (
				<>
					, <em>{name}</em>
				</>
			) : null}
			.
		</h1>
	);
}

function AccountNav() {
	const pathname = usePathname();
	const { hrefWith } = usePersonFilter();
	const reduce = useReducedMotion();
	return (
		<nav aria-label="My Care" className="flex items-end justify-between gap-6 border-b border-line">
			<ul className="-mb-px flex gap-6 overflow-x-auto sm:gap-9" data-lenis-prevent>
				{NAV.map((item) => {
					const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
					return (
						<li key={item.href} className="relative shrink-0">
							<Link
								href={hrefWith(item.href)}
								aria-current={active ? 'page' : undefined}
								className={clsx(
									'block rounded-sm pt-2 pb-3.5 text-[15px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-steel',
									active ? 'font-semibold text-ink' : 'text-ink-muted hover:text-ink',
								)}
							>
								{item.label}
							</Link>
							{active ? (
								<motion.span layoutId="account-nav-underline" transition={reduce ? NO_T : UNDERLINE_T} className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-steel" />
							) : null}
						</li>
					);
				})}
			</ul>
			<button
				type="button"
				onClick={() => void signOut({ callbackUrl: '/' })}
				className="mb-3 shrink-0 rounded-sm text-sm text-ink-muted transition-colors hover:text-clay focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-steel"
			>
				Sign out
			</button>
		</nav>
	);
}

function ShellHeader() {
	const { people, person } = useFilteredCare();
	return (
		<header>
			<div className="flex items-center gap-4">
				<span className="eyebrow text-brass">My Care</span>
				<span aria-hidden className="block w-20">
					<CareLine settled trigger="mount" tone="brass" />
				</span>
			</div>
			<div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
				<Greeting />
				<FamilyChips people={people} active={person} />
			</div>
			<div className="mt-8">
				<AccountNav />
			</div>
		</header>
	);
}

/** The portal frame: greeting, family filter, calm tab nav. Pages render below. */
function Shell({ children }: { children: React.ReactNode }) {
	return (
		<section className="grain min-h-[100svh] bg-paper">
			<div className="container-x relative pt-28 pb-24 lg:pt-32">
				<ShellHeader />
				<div className="mt-10 min-w-0 lg:mt-12">{children}</div>
			</div>
		</section>
	);
}

export function AccountShell({ children }: { children: React.ReactNode }) {
	return (
		<Suspense fallback={<ShellSkeleton />}>
			<Shell>{children}</Shell>
		</Suspense>
	);
}
