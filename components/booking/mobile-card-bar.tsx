'use client';

import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Sheet } from '@/components/ui/sheet';
import { useMounted } from '@/components/ui/use-overlay';
import { AnimatedNumber } from '@/components/ui/animated-number';

interface MobileCardBarProps {
	total: number;
	format: (n: number) => string;
	held: boolean;
	/** One-line status, e.g. "Fri, Oct 16 · 9:30 AM". */
	status: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	children: ReactNode;
}

/**
 * Phones: a sticky bottom bar ("Your visit · $120 ▾") that opens the live
 * appointment card in a Sheet. Portalled out of PageTransition so `fixed` works.
 */
export function MobileCardBar({ total, format, held, status, open, onOpenChange, children }: MobileCardBarProps) {
	const mounted = useMounted();
	if (!mounted) return null;
	return (
		<>
			{createPortal(
				<div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 backdrop-blur lg:hidden">
					<button
						type="button"
						onClick={() => onOpenChange(true)}
						aria-haspopup="dialog"
						aria-expanded={open}
						className="flex w-full items-center justify-between gap-3 rounded-full bg-steel px-5 py-3 text-left text-white shadow-float"
					>
						<span className="min-w-0">
							<span className="block text-[13px] font-semibold">{held ? 'Held for you' : 'Your visit'}</span>
							{status ? <span className="block truncate text-[12px] text-white/75">{status}</span> : null}
						</span>
						<span className="flex shrink-0 items-center gap-2">
							<AnimatedNumber value={total} format={format} className="tabular text-[16px]" />
							<svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
								<path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</span>
					</button>
				</div>,
				document.body,
			)}
			<Sheet open={open} onClose={() => onOpenChange(false)} title="Your visit">
				{children}
			</Sheet>
		</>
	);
}
