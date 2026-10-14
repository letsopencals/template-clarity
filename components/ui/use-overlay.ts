'use client';

import { useEffect, useRef, useSyncExternalStore, type RefObject } from 'react';
import { useSmoothScroll } from '@/components/motion/smooth-scroll';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const noopSubscribe = () => () => {};
/** False on the server and while hydrating, true after (portals can't hydrate). */
export function useMounted(): boolean {
	return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

/**
 * Modal behaviour shared by Sheet and Dialog: body + Lenis scroll lock,
 * Escape to close, a focus trap, focus on open and focus restore on close.
 */
export function useModalOverlay(open: boolean, onClose: () => void, panelRef: RefObject<HTMLElement | null>, initialFocus?: string) {
	const lenis = useSmoothScroll();
	const onCloseRef = useRef(onClose);
	useEffect(() => {
		onCloseRef.current = onClose;
	}, [onClose]);

	useEffect(() => {
		if (!open) return;
		const previouslyFocused = document.activeElement as HTMLElement | null;
		lenis?.stop();
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		const focusTimer = window.setTimeout(() => {
			const panel = panelRef.current;
			if (!panel) return;
			const target = (initialFocus && panel.querySelector<HTMLElement>(initialFocus)) || panel.querySelector<HTMLElement>(FOCUSABLE) || panel;
			target.focus({ preventScroll: true });
		}, 40);

		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				onCloseRef.current();
				return;
			}
			if (e.key !== 'Tab' || !panelRef.current) return;
			const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
			if (nodes.length === 0) return;
			const first = nodes[0]!;
			const last = nodes[nodes.length - 1]!;
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		};
		document.addEventListener('keydown', onKey);
		return () => {
			window.clearTimeout(focusTimer);
			document.removeEventListener('keydown', onKey);
			document.body.style.overflow = prevOverflow;
			lenis?.start();
			previouslyFocused?.focus?.({ preventScroll: true });
		};
	}, [open, lenis, panelRef, initialFocus]);
}
