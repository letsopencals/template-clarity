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
	| 'flask';

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
};

interface DepartmentIconProps {
	name: DepartmentIconName;
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
			{PATHS[name]}
		</svg>
	);
}
