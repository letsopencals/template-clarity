/**
 * Department glyphs — a small, dependency-free line-icon set keyed by the
 * `icon` field in `siteConfig.departments`. Strokes use `currentColor` so the
 * parent controls the color.
 */

export type DepartmentIconName =
	| 'stethoscope'
	| 'heart'
	| 'skin'
	| 'child'
	| 'activity'
	| 'tooth'
	| 'brain'
	| 'apple'
	| 'flask'
	// Care Finder, trust markers and discovery chrome
	| 'clipboard'
	| 'shield'
	| 'lock'
	| 'clock'
	| 'card'
	| 'video'
	| 'pin'
	| 'phone'
	| 'search'
	| 'arrow'
	| 'user'
	| 'users'
	| 'check'
	| 'globe';

const PATHS: Record<DepartmentIconName, React.ReactNode> = {
	stethoscope: (
		<>
			<path d="M6 3v5a4 4 0 0 0 8 0V3" />
			<path d="M4 3h2M12 3h2" />
			<path d="M10 12v3a5 5 0 0 0 10 0v-1" />
			<circle cx="20" cy="12" r="2" />
		</>
	),
	heart: <path d="M12 20s-7-4.6-9.3-9C1.2 8 2.7 4.5 6 4.5c2 0 3.2 1.3 4 2.6.8-1.3 2-2.6 4-2.6 3.3 0 4.8 3.5 3.3 6.5C19 15.4 12 20 12 20Z" />,
	skin: (
		<>
			<path d="M4 8c0-2.8 3.6-4 8-4s8 1.2 8 4-3.6 4-8 4" />
			<path d="M4 8v6c0 2.8 3.6 4 8 4" />
			<circle cx="9" cy="9" r="0.6" fill="currentColor" stroke="none" />
			<circle cx="14" cy="10" r="0.6" fill="currentColor" stroke="none" />
			<circle cx="11" cy="13" r="0.6" fill="currentColor" stroke="none" />
		</>
	),
	child: (
		<>
			<circle cx="12" cy="6" r="2.5" />
			<path d="M12 9v6M8 12h8M9 20l3-4 3 4" />
		</>
	),
	activity: <path d="M3 12h4l2.5-7 5 14 2.5-7H21" />,
	tooth: <path d="M12 4c-2.2-1.6-6-1.4-6 2.5 0 2 .7 3.4 1.1 6 .3 2 .6 5.5 1.9 5.5 1.1 0 1-2.5 2-2.5s.9 2.5 2 2.5c1.3 0 1.6-3.5 1.9-5.5.4-2.6 1.1-4 1.1-6 0-3.9-3.8-4.1-6-2.5Z" />,
	brain: (
		<>
			<path d="M9 4.5A2.5 2.5 0 0 0 6.5 7 2.5 2.5 0 0 0 5 12a2.5 2.5 0 0 0 2 4.5A2 2 0 0 0 9 20V4.5Z" />
			<path d="M15 4.5A2.5 2.5 0 0 1 17.5 7 2.5 2.5 0 0 1 19 12a2.5 2.5 0 0 1-2 4.5A2 2 0 0 1 15 20V4.5Z" />
			<path d="M9 4.5h6" />
		</>
	),
	apple: (
		<>
			<path d="M12 8c-1-1.5-3.2-2.2-5-1-2 1.3-2.3 4.6-1 7.4C7 16.6 9 19 12 19s5-2.4 6-4.6c1.3-2.8 1-6.1-1-7.4-1.8-1.2-4-.5-5 1Z" />
			<path d="M12 8c0-2 .8-3.5 2.5-4" />
		</>
	),
	flask: (
		<>
			<path d="M9 3h6M10 3v6l-4.2 7.3A2 2 0 0 0 7.5 19h9a2 2 0 0 0 1.7-2.7L14 9V3" />
			<path d="M8 14h8" />
		</>
	),
	clipboard: (
		<>
			<rect x="5.5" y="4.5" width="13" height="16" rx="2" />
			<path d="M9 4.5V3.5h6v1M9 10h6M9 13.5h6M9 17h3.5" />
		</>
	),
	shield: (
		<>
			<path d="M12 3 5 6v5c0 4.4 3 8 7 10 4-2 7-5.6 7-10V6l-7-3Z" />
			<path d="m9 12 2 2 4-4" />
		</>
	),
	lock: (
		<>
			<rect x="5" y="10.5" width="14" height="9.5" rx="2" />
			<path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2" />
		</>
	),
	clock: (
		<>
			<circle cx="12" cy="12" r="8.5" />
			<path d="M12 7.5V12l3 2" />
		</>
	),
	card: (
		<>
			<rect x="3" y="6" width="18" height="12" rx="2" />
			<path d="M3 10h18M7 14.5h3" />
		</>
	),
	video: (
		<>
			<rect x="3" y="7" width="12" height="10" rx="2" />
			<path d="m15 10.5 6-3v9l-6-3" />
		</>
	),
	pin: (
		<>
			<path d="M12 21s-6.5-5.6-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21Z" />
			<circle cx="12" cy="10.5" r="2.2" />
		</>
	),
	phone: <path d="M6 3.5h2.8l1.7 4.4-2 1.3a11 11 0 0 0 6.3 6.3l1.3-2 4.4 1.7v2.8a2 2 0 0 1-2.2 2A16 16 0 0 1 4 5.7a2 2 0 0 1 2-2.2Z" />,
	search: (
		<>
			<circle cx="11" cy="11" r="6.5" />
			<path d="m20 20-4.4-4.4" />
		</>
	),
	arrow: <path d="M4.5 12h15M13.5 6l6 6-6 6" />,
	user: (
		<>
			<circle cx="12" cy="8" r="3.5" />
			<path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
		</>
	),
	users: (
		<>
			<circle cx="9" cy="8.5" r="3" />
			<path d="M3.5 19.5c.6-3 2.8-4.7 5.5-4.7s4.9 1.7 5.5 4.7" />
			<path d="M15.5 5.8a3 3 0 0 1 0 5.4M17 14.9c1.9.6 3.1 2.2 3.5 4.6" />
		</>
	),
	check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
	globe: (
		<>
			<circle cx="12" cy="12" r="8.5" />
			<path d="M3.5 12h17M12 3.5c2.3 2.4 3.5 5.2 3.5 8.5s-1.2 6.1-3.5 8.5c-2.3-2.4-3.5-5.2-3.5-8.5s1.2-6.1 3.5-8.5Z" />
		</>
	),
};

function isIconName(name: string): name is DepartmentIconName {
	return name in PATHS;
}

interface DepartmentIconProps {
	/** Any siteConfig `icon:` string; unknown names fall back to the stethoscope. */
	name: DepartmentIconName | (string & {});
	className?: string;
}

export function DepartmentIcon({ name, className }: DepartmentIconProps) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.6}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			{PATHS[isIconName(name) ? name : 'stethoscope']}
		</svg>
	);
}
