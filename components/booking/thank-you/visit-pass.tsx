'use client';

import { memo, useEffect, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { motion, type Transition } from 'framer-motion';
import { clsx } from 'clsx';
import { CareLine } from '@/components/motifs/care-line';
import { Seal } from '@/components/motifs/seal';
import { SafeImage } from '@/components/ui/safe-image';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { DURATION, EASE_OUT } from '@/components/motion/easing';
import { googleCalendarHref, icsHref, ICS_FILENAME } from '@/lib/calendar';
import { firstName } from '@/lib/intake';
import { siteConfig } from '@/lib/site-config';
import type { VisitRow } from './visit-model';

const PASS_INITIAL = { opacity: 0, y: 36, rotate: -0.6 };
const PASS_ANIMATE = { opacity: 1, y: 0, rotate: 0 };

function passTransition(i: number): Transition {
	return { duration: DURATION.slow, ease: EASE_OUT, delay: 0.2 + i * 0.12 };
}

const SETTLE_AFTER_MS = 1400;

/** The care line on each pass: drawn with its pulse, then settles flat ("from worry to calm"). */
function SettlingLine() {
	const reduce = useReducedMotion();
	const [settled, setSettled] = useState(false);
	useEffect(() => {
		const t = window.setTimeout(() => setSettled(true), reduce ? 0 : SETTLE_AFTER_MS);
		return () => window.clearTimeout(t);
	}, [reduce]);
	return <CareLine settled={settled} trigger="mount" tone="steel" className="h-8 w-full" />;
}

interface PatientPayload {
	patient?: { visitFor?: string; name?: string | null } | null;
}

async function patientFetcher(url: string): Promise<PatientPayload | null> {
	try {
		const res = await fetch(url);
		return res.ok ? ((await res.json()) as PatientPayload) : null;
	} catch {
		return null;
	}
}

const SWR_OPTIONS = { revalidateOnFocus: false, revalidateIfStale: false, shouldRetryOnError: false } as const;

/**
 * Who the visit is for. The order payload doesn't carry intake answers, so a
 * signed-in patient's pass reads them from the care record; guests (and
 * "Myself" visits) simply show no patient line.
 */
function usePatientName(appointmentId: string, enabled: boolean): string | null {
	const { data } = useSWR(enabled ? `/api/account/appointments/${appointmentId}` : null, patientFetcher, SWR_OPTIONS);
	const p = data?.patient;
	return p && p.visitFor !== 'self' && p.name ? p.name : null;
}

interface VisitPassProps {
	row: VisitRow;
	index: number;
	count: number;
	orderName: string | null;
	authenticated: boolean;
}

/**
 * One perforated visit pass: brass "Confirmed" seal pressed on, the care line
 * settling flat, the essentials (when, where, who with, who for), and a stub
 * with calendar, directions or the video link.
 */
export const VisitPass = memo(function VisitPass({ row, index, count, orderName, authenticated }: VisitPassProps) {
	const reduce = useReducedMotion();
	const patient = usePatientName(row.id, authenticated);
	const ics = icsHref([row.event]);

	return (
		<motion.article
			initial={reduce ? false : PASS_INITIAL}
			animate={PASS_ANIMATE}
			transition={passTransition(index)}
			aria-label={`Visit pass: ${row.title}`}
			className="paper relative overflow-hidden border border-line"
		>
			<span aria-hidden className={clsx('absolute inset-y-0 left-0 w-1.5', row.video ? 'bg-sage' : 'bg-steel')} />

			<div className="relative px-6 pt-7 pb-6 sm:px-9 sm:pt-9">
				<div className="flex items-start justify-between gap-6">
					<div className="min-w-0">
						<p className="eyebrow text-[0.62rem] text-ink-muted">
							Visit pass
							<span className="tabular text-brass">
								{' '}
								· {String(index + 1).padStart(2, '0')}
								{count > 1 ? ` of ${String(count).padStart(2, '0')}` : ''}
							</span>
							{orderName ? <span className="tabular text-ink-dim"> · {orderName}</span> : null}
						</p>
						<h2 className="display-sm mt-3 text-ink">{row.title}</h2>
						<p className="mt-2 text-sm text-ink-muted">
							{[row.option, row.clinicianName ? `with ${row.clinicianName}` : null].filter(Boolean).join(' · ') || 'Your clinician will confirm on the day'}
						</p>
						{patient ? (
							<p className="mt-3 inline-flex items-center gap-2 rounded-full bg-honey-soft px-3 py-1 text-xs text-oak">
								<span aria-hidden className="h-1.5 w-1.5 rounded-full bg-honey" />
								For {firstName(patient)}
								<span className="sr-only">, {patient}</span>
							</p>
						) : null}
					</div>
					<Seal motion="stamp" size={96} ring="Confirmed · Clear Care Medical · " className="-mt-1 -mr-2 shrink-0 max-sm:hidden" />
					<Seal motion="stamp" size={72} ring="Confirmed · Clear Care · " className="-mt-1 -mr-1 shrink-0 sm:hidden" />
				</div>

				<p className="sr-only">Confirmed.</p>
				<SettlingLine />

				<dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
					<div className="min-w-0">
						<dt className="eyebrow text-[0.6rem] text-ink-dim">When</dt>
						<dd className="mt-1.5 text-[15px] text-ink">
							{row.dateLabel || <span className="image-placeholder inline-block h-4 w-40 rounded-full" aria-hidden />}
						</dd>
						<dd className="tabular mt-0.5 text-sm text-ink-muted">
							{row.timeLabel}
							{row.zoneLabel ? <span className="text-ink-dim"> {row.zoneLabel}</span> : null}
						</dd>
						{row.arriveLabel ? <dd className="mt-1 text-xs text-brass">{row.arriveLabel}</dd> : null}
					</div>
					<div className="min-w-0">
						<dt className="eyebrow text-[0.6rem] text-ink-dim">Where</dt>
						{row.video ? (
							<>
								<dd className="mt-1.5 text-[15px] text-ink">Video visit</dd>
								<dd className="mt-0.5 text-sm text-ink-muted">
									Your link opens {siteConfig.videoVisit.joinWindowMinutes} minutes before.
								</dd>
							</>
						) : (
							<>
								<dd className="mt-1.5 text-[15px] text-ink">{row.locationTitle ?? siteConfig.shortName}</dd>
								{row.address ? <dd className="mt-0.5 text-sm text-ink-muted">{row.address}</dd> : null}
								{row.clinicNote ? <dd className="mt-1 text-xs text-ink-dim">{row.clinicNote}</dd> : null}
							</>
						)}
					</div>
				</dl>

				{row.addOns.length > 0 ? (
					<p className="mt-5 text-xs text-ink-muted">
						<span className="eyebrow mr-2 text-[0.58rem] text-ink-dim">Also</span>
						{row.addOns.map((a) => (a.quantity > 1 ? `${a.title} ×${a.quantity}` : a.title)).join(' · ')}
					</p>
				) : null}
			</div>

			<div className="relative">
				<div className="perforation" aria-hidden />
				{/* Notches where the stub tears off. */}
				<span aria-hidden className="absolute top-1/2 -left-3 h-6 w-6 -translate-y-1/2 rounded-full bg-paper" />
				<span aria-hidden className="absolute top-1/2 -right-3 h-6 w-6 -translate-y-1/2 rounded-full bg-paper" />
			</div>

			<div className="flex flex-wrap items-center gap-x-6 gap-y-3 bg-cream/60 px-6 py-5 sm:px-9">
				{row.clinicianImage ? (
					<span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-line">
						<SafeImage src={row.clinicianImage} alt="" fill sizes="36px" className="object-cover" />
					</span>
				) : null}
				<a href={ics} download={ICS_FILENAME} className="eyebrow link-underline text-[0.62rem] text-ink hover:text-steel">
					Add to calendar
				</a>
				<a
					href={googleCalendarHref(row.event)}
					target="_blank"
					rel="noopener noreferrer"
					className="eyebrow link-underline text-[0.62rem] text-ink hover:text-steel"
				>
					Google Calendar<span className="sr-only"> (opens in a new tab)</span>
				</a>
				{row.directionsHref ? (
					<a
						href={row.directionsHref}
						target="_blank"
						rel="noopener noreferrer"
						className="eyebrow link-underline text-[0.62rem] text-ink hover:text-steel"
					>
						Directions<span className="sr-only"> to {row.locationTitle ?? 'the clinic'} (opens in a new tab)</span>
					</a>
				) : null}
				{row.video ? (
					<Link href="/video-visits#device-check" className="eyebrow link-underline text-[0.62rem] text-ink hover:text-steel">
						Test your camera
					</Link>
				) : null}
			</div>
		</motion.article>
	);
});
