'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/contexts/cart-context';
import { useSettings } from '@/contexts/settings-context';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { siteConfig } from '@/lib/site-config';

const navLinks = [
	{ href: '/departments', label: 'Departments' },
	{ href: '/telehealth', label: 'Telehealth' },
	{ href: '/#doctors', label: 'Clinicians' },
	{ href: '/about', label: 'About' },
	{ href: '/contact', label: 'Contact' },
];

export function Header() {
	const { data: session, status } = useSession();
	const { cart } = useCart();
	const { settings } = useSettings();
	const logoUrl = settings?.storefrontSettings?.logoImage?.url ?? null;
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isCartOpen, setIsCartOpen] = useState(false);

	const cartItemCount = cart?.items?.length ?? 0;

	useEffect(() => {
		const handleScroll = () => setIsScrolled(window.scrollY > 24);
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	useEffect(() => {
		document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	}, [isMobileMenuOpen]);

	return (
		<>
			<header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 lg:px-6 lg:pt-4">
				<div
					className={`mx-auto max-w-[1400px] rounded-full transition-all duration-300 ${
						isScrolled ? 'glass-nav rounded-full shadow-[0_8px_32px_-12px_rgba(18,48,63,0.22)]' : 'border border-transparent'
					}`}
				>
					<div className="flex h-16 items-center justify-between pl-6 pr-4">
						{/* Logo */}
						<Link href="/" className="flex items-center gap-2.5">
							{logoUrl ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img
									src={logoUrl}
									alt={settings?.name ?? `${siteConfig.logo.text} ${siteConfig.logo.accent}`}
									className="h-9 w-9 rounded-xl object-cover"
								/>
							) : (
								<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary)] text-sm font-bold text-white">
									{siteConfig.logo.text.charAt(0)}
								</span>
							)}
							<span className="font-display text-xl font-bold tracking-tight text-[var(--color-ink)]">
								{siteConfig.logo.text}{' '}
								<span className="text-[var(--color-primary)]">{siteConfig.logo.accent}</span>
							</span>
						</Link>

						{/* Desktop Nav */}
						<nav className="hidden items-center gap-8 lg:flex">
							{navLinks.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									className="link-underline text-sm font-medium text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink)]"
								>
									{link.label}
								</Link>
							))}
						</nav>

						{/* Actions */}
						<div className="flex items-center gap-2.5">
							<CartButton count={cartItemCount} onClick={() => setIsCartOpen(true)} />

							{status === 'authenticated' ? (
								<Link
									href="/account"
									className="hidden rounded-full border border-[var(--color-line-strong)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] transition-colors hover:border-[var(--color-primary)]/40 lg:block"
								>
									{session.customer?.firstName || 'Account'}
								</Link>
							) : (
								<Link
									href="/auth/sign-in"
									className="hidden rounded-full border border-[var(--color-line-strong)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] transition-colors hover:border-[var(--color-primary)]/40 lg:block"
								>
									Sign In
								</Link>
							)}

							<Link
								href="/departments"
								className="hidden rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-bright)] lg:block"
							>
								Book Appointment
							</Link>

							{/* Mobile hamburger */}
							<button
								onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
								className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
								aria-label="Toggle menu"
							>
								<motion.span animate={isMobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} className="block h-[2px] w-6 bg-[var(--color-ink)]" />
								<motion.span animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }} className="block h-[2px] w-6 bg-[var(--color-ink)]" />
								<motion.span animate={isMobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} className="block h-[2px] w-6 bg-[var(--color-ink)]" />
							</button>
						</div>
					</div>
				</div>
			</header>

			<CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />

			{/* Mobile Menu Overlay */}
			<AnimatePresence>
				{isMobileMenuOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						className="fixed inset-0 z-40 bg-[var(--color-bg)]/95 backdrop-blur-xl lg:hidden"
					>
						<div className="flex h-full flex-col items-center justify-center gap-7 px-6">
							{navLinks.map((link, i) => (
								<motion.div
									key={link.href}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: i * 0.08 + 0.15 }}
								>
									<Link
										href={link.href}
										onClick={() => setIsMobileMenuOpen(false)}
										className="heading-display text-4xl text-[var(--color-ink)] transition-colors hover:text-[var(--color-primary)]"
									>
										{link.label}
									</Link>
								</motion.div>
							))}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.5 }}
								className="mt-4 flex flex-col items-center gap-4"
							>
								<Link
									href="/departments"
									onClick={() => setIsMobileMenuOpen(false)}
									className="rounded-full bg-[var(--color-primary)] px-10 py-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-bright)]"
								>
									Book Appointment
								</Link>
								{status === 'authenticated' ? (
									<>
										<Link href="/account" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-primary)]">
											My Account
										</Link>
										<button onClick={() => { signOut(); setIsMobileMenuOpen(false); }} className="text-sm font-medium text-[var(--color-ink-dim)] hover:text-[var(--color-primary)]">
											Sign Out
										</button>
									</>
								) : (
									<Link href="/auth/sign-in" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-primary)]">
										Sign In
									</Link>
								)}
							</motion.div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}

function CartButton({ count, onClick }: { count: number; onClick: () => void }) {
	return (
		<button
			onClick={onClick}
			className="relative flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
			aria-label={`Cart (${count} items)`}
		>
			<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
			</svg>
			{count > 0 && (
				<span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-bold text-white">
					{count}
				</span>
			)}
		</button>
	);
}
