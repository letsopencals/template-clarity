import { clsx } from 'clsx';
import { SafeImage } from '@/components/ui/safe-image';

function initials(name: string): string {
	const parts = name.replace(/^Dr\.?\s+/i, '').split(/\s+/).filter(Boolean);
	return (parts[0]?.[0] ?? '') + (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '');
}

export interface PortraitProps {
	name: string;
	src: string | null;
	className?: string;
	sizes?: string;
	/** Monogram size class. */
	monogramClassName?: string;
	priority?: boolean;
}

/**
 * A clinician portrait in a small window. Without a photo (or if it fails to
 * load) a brass monogram on cream shows through.
 */
export function Portrait({ name, src, className, sizes = '(min-width: 1024px) 20vw, 50vw', monogramClassName, priority }: PortraitProps) {
	return (
		<div className={clsx('window-sm image-placeholder relative', className)}>
			<div aria-hidden className="absolute inset-0 flex items-center justify-center">
				<span className={clsx('flex aspect-square w-[42%] items-center justify-center rounded-full border border-brass/60 font-display italic tracking-tight text-brass', monogramClassName ?? 'text-3xl')}>
					{initials(name)}
				</span>
			</div>
			{src ? (
				<SafeImage
					src={src}
					alt={name}
					fill
					sizes={sizes}
					priority={priority}
					className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
				/>
			) : null}
		</div>
	);
}
