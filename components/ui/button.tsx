import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'quiet';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	fullWidth?: boolean;
}

// Every button is a pill (rounded-full) — the canonical shape for this template.
const BASE =
	'group/btn inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[0.01em] transition-[background-color,color,border-color,box-shadow,transform] duration-300 ease-[var(--ease-calm)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 aria-disabled:opacity-60 aria-disabled:shadow-none';

const VARIANTS: Record<ButtonVariant, string> = {
	// Steel — the single action colour.
	primary:
		'bg-steel text-white shadow-[0_10px_24px_-12px_rgba(35,70,92,0.7)] hover:bg-steel-deep hover:shadow-[0_14px_30px_-12px_rgba(35,70,92,0.75)]',
	outline: 'border border-line-strong bg-card/60 text-ink hover:border-steel hover:text-steel',
	ghost: 'text-ink hover:text-steel',
	// Light-on-dark, for steel-deep spreads.
	quiet: 'bg-paper text-steel-deep hover:bg-white',
};

const SIZES: Record<ButtonSize, string> = {
	sm: 'h-9 px-4 text-[13px]',
	md: 'h-11 px-6 text-sm',
	lg: 'h-14 px-8 text-[15px]',
};

/** Shared so `next/link` CTAs can look identical: `<Link className={buttonClasses()}>`. */
export function buttonClasses({
	variant = 'primary',
	size = 'md',
	fullWidth,
	className,
}: { variant?: ButtonVariant; size?: ButtonSize; fullWidth?: boolean; className?: string } = {}) {
	return clsx(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className);
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
	{ variant = 'primary', size = 'md', fullWidth, className, type = 'button', ...props },
	ref,
) {
	return <button ref={ref} type={type} className={buttonClasses({ variant, size, fullWidth, className })} {...props} />;
});
