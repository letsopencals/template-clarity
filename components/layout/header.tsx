'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { clsx } from 'clsx';
import { useSettings } from '@/contexts/settings-context';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { buttonClasses } from '@/components/ui/button';
import { Logo } from './logo';
import { CartPill } from './cart-pill';
import { MobileMenu } from './mobile-menu';
import { FIND_CARE, MY_CARE, NAV_LINKS, isActive } from './nav-links';

/**
 * Transparent over the hero, `.glass-nav` once the page scrolls. Find care is
 * the one primary pill; "Your visits (n)" opens the cart drawer.
 */
export function Header() {
	const pathname = usePathname() ?? '/';
	const { status } = useSession();
	const { settings } = useSettings();
	const logoUrl = settings?.storefrontSettings?.logoImage?.url ?? null;
	const [scrolled, setScrolled] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [cartOpen, setCartOpen] = useState(false);
	const [menuPath, setMenuPath] = useState(pathname);

	// Close the menu on navigation (render-time reset, no effect).
	if (menuPath !== pathname) {
		setMenuPath(pathname);
		if (menuOpen) setMenuOpen(false);
	}

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 24);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	const closeMenu = useCallback(() => setMenuOpen(false), []);
	const openCart = useCallback(() => setCartOpen(true), []);
	const closeCart = useCallback(() => setCartOpen(false), []);
	const signedIn = status === 'authenticated';

	return (
		<>
			<header
				className={clsx(
					'fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow,border-color] duration-500',
					scrolled ? 'glass-nav border-b border-line shadow-[0_10px_30px_-24px_rgba(33,48,58,0.5)]' : 'border-b border-transparent',
				)}
			>
				<div className="container-x flex h-[4.5rem] items-center justify-between gap-6">
					<Logo logoUrl={logoUrl} />

					<nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
						{NAV_LINKS.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								aria-current={isActive(pathname, link.href) ? 'page' : undefined}
								className={clsx(
									'link-underline text-[14px] font-medium transition-colors',
									isActive(pathname, link.href) ? 'text-steel' : 'text-ink-muted hover:text-ink',
								)}
							>
								{link.label}
							</Link>
						))}
						<Link
							href={MY_CARE.href}
							aria-current={isActive(pathname, MY_CARE.href) ? 'page' : undefined}
							className={clsx('link-underline text-[14px] font-medium transition-colors', isActive(pathname, MY_CARE.href) ? 'text-steel' : 'text-ink-muted hover:text-ink')}
						>
							{MY_CARE.label}
						</Link>
					</nav>

					<div className="flex items-center gap-2.5">
						<Link href={FIND_CARE.href} className={buttonClasses({ variant: 'primary', size: 'sm', className: 'max-sm:hidden' })}>
							{FIND_CARE.label}
						</Link>
						<CartPill onOpen={openCart} className="max-md:hidden" />
						<CartPill onOpen={openCart} className="md:hidden [&>span:first-of-type]:sr-only" />
						<button
							type="button"
							onClick={() => setMenuOpen(true)}
							aria-label="Open menu"
							aria-expanded={menuOpen}
							className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong text-ink transition-colors hover:border-steel hover:text-steel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel/40 lg:hidden"
						>
							<svg aria-hidden className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
								<path strokeLinecap="round" d="M4 8h16M4 16h10" />
							</svg>
						</button>
					</div>
				</div>
			</header>
			<MobileMenu open={menuOpen} onClose={closeMenu} pathname={pathname} signedIn={signedIn} />
			<CartDrawer open={cartOpen} onClose={closeCart} />
		</>
	);
}
