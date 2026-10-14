import Image from 'next/image';
import { clsx } from 'clsx';
import { initialsOf } from '@/components/account/care-utils';

/** Round clinician photo (or warm initials). */
export function ClinicianPortrait({ name, imageUrl, size = 48, className }: { name: string; imageUrl: string | null; size?: number; className?: string }) {
	return (
		<span
			className={clsx('image-placeholder relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-line', className)}
			style={{ width: size, height: size }}
		>
			{imageUrl ? (
				<Image src={imageUrl} alt="" fill sizes={`${size}px`} className="object-cover" />
			) : (
				<span aria-hidden className="font-display text-ink-muted" style={{ fontSize: size * 0.36 }}>
					{initialsOf(name)}
				</span>
			)}
		</span>
	);
}
