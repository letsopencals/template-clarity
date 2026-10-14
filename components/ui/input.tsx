import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { clsx } from 'clsx';

const FIELD_BASE =
	'w-full rounded-field border border-line-strong bg-card px-4 py-3 text-[15px] text-ink outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-ink-dim focus:border-steel focus:shadow-[0_0_0_4px_rgba(63,110,140,0.12)] aria-[invalid=true]:border-clay';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
	function Input({ className, ...props }, ref) {
		return <input ref={ref} className={clsx(FIELD_BASE, className)} {...props} />;
	},
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
	function Textarea({ className, ...props }, ref) {
		return <textarea ref={ref} className={clsx(FIELD_BASE, 'min-h-28 resize-y leading-relaxed', className)} {...props} />;
	},
);
