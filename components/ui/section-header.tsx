import { clsx } from 'clsx';

export interface SectionHeaderProps {
	/** Small label, e.g. "02 · Rooms of care". */
	eyebrow?: string;
	/** Headline. Pass JSX to put the emotional word in <em>. */
	title: React.ReactNode;
	lead?: React.ReactNode;
	align?: 'left' | 'center';
	/** Light text for steel-deep spreads. */
	tone?: 'ink' | 'light';
	size?: 'lg' | 'md' | 'sm';
	action?: React.ReactNode;
	className?: string;
}

/** The one section opener used on every page (DESIGN.md §2). */
export function SectionHeader({
	eyebrow,
	title,
	lead,
	align = 'left',
	tone = 'ink',
	size = 'md',
	action,
	className,
}: SectionHeaderProps) {
	const light = tone === 'light';
	return (
		<div
			className={clsx(
				'flex flex-col gap-6',
				align === 'center' ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between',
				className,
			)}
		>
			<div className={clsx('flex flex-col gap-4', align === 'center' && 'items-center')}>
				{eyebrow ? <span className={clsx('eyebrow', light ? 'text-honey' : 'text-oak')}>{eyebrow}</span> : null}
				<h2
					className={clsx(
						size === 'lg' ? 'display-lg' : size === 'md' ? 'display-md' : 'display-sm',
						light ? 'text-paper [&_em]:text-honey' : 'text-ink',
					)}
				>
					{title}
				</h2>
				{lead ? (
					<p className={clsx('max-w-[54ch] text-[17px] leading-relaxed', light ? 'text-paper/75' : 'text-ink-muted')}>{lead}</p>
				) : null}
			</div>
			{action ? <div className="shrink-0">{action}</div> : null}
		</div>
	);
}
