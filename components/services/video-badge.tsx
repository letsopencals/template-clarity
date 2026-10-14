import { clsx } from 'clsx';
import { DepartmentIcon } from '@/components/ui/department-icon';

/** Small "Video available" mark for visits bookable at the online location. */
export function VideoBadge({ className, label = 'Video available', tone = 'ink' }: { className?: string; label?: string; tone?: 'ink' | 'light' }) {
	return (
		<span
			className={clsx(
				'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide',
				tone === 'light' ? 'bg-paper/12 text-paper' : 'bg-sage-soft text-sage-deep',
				className,
			)}
		>
			<DepartmentIcon name="video" className="h-3.5 w-3.5" />
			{label}
		</span>
	);
}
