/** Primary navigation (header + mobile menu). "Find care" renders as the pill. */
export const NAV_LINKS = [
	{ href: '/departments', label: 'Departments' },
	{ href: '/video-visits', label: 'Video visits' },
	{ href: '/clinicians', label: 'Clinicians' },
	{ href: '/contact#clinics', label: 'Clinics' },
] as const;

export const FIND_CARE = { href: '/care', label: 'Find care' } as const;
export const MY_CARE = { href: '/account', label: 'My Care' } as const;

/** Active when the path is the link's route or below it. */
export function isActive(pathname: string, href: string): boolean {
	const base = href.split('#')[0]!;
	if (base === '/') return pathname === '/';
	return pathname === base || pathname.startsWith(`${base}/`);
}
