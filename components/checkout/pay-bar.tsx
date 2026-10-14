'use client';

import { createPortal } from 'react-dom';
import { buttonClasses } from '@/components/ui/button';
import { useMounted } from '@/components/ui/use-overlay';

export interface PrimaryAction {
	label: string;
	/** Submit this form id (forms live in the sections above). */
	form?: string;
	onClick?: () => void;
	disabled: boolean;
	busy: boolean;
}

/**
 * Mobile/tablet sticky pay bar. The section's own submit buttons are hidden
 * below lg; this one submits the current section's form via `form=`.
 * Portalled to <body> so PageTransition's transform can't break `fixed`.
 */
export function PayBar({ total, action }: { total: string; action: PrimaryAction | null }) {
	const mounted = useMounted();
	if (!action || !mounted) return null;
	return createPortal(
		<div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/92 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
			<div className="mx-auto flex max-w-[640px] items-center gap-4">
				<div className="shrink-0">
					<p className="eyebrow text-[0.58rem] text-ink-muted">Total</p>
					<p className="tabular text-lg leading-tight text-ink">{total}</p>
				</div>
				<button
					type={action.form ? 'submit' : 'button'}
					form={action.form}
					onClick={action.onClick}
					disabled={action.disabled}
					aria-busy={action.busy}
					className={buttonClasses({ variant: 'primary', size: 'sm', className: 'min-h-12 flex-1' })}
				>
					{action.label}
				</button>
			</div>
		</div>,
		document.body,
	);
}
