'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, type Transition } from 'framer-motion';
import { clsx } from 'clsx';
import type { PublicClinician } from '@/lib/clinicians';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { EASE_OUT } from '@/components/motion/easing';
import { DepartmentIcon } from '@/components/ui/department-icon';
import { ClinicianCard } from './clinician-card';

export interface DirectoryOption {
	value: string;
	label: string;
}

export interface ClinicianDirectoryProps {
	clinicians: PublicClinician[];
	departments: DirectoryOption[];
	clinics: DirectoryOption[];
	initial: { department: string | null; clinic: string | null; video: boolean; q: string };
}

const ITEM_IN = { opacity: 1, y: 0 } as const;
const ITEM_FROM = { opacity: 0, y: 12 } as const;
const ITEM_OUT = { opacity: 0 } as const;
const ITEM_T: Transition = { duration: 0.35, ease: EASE_OUT };
const NO_T: Transition = { duration: 0 };

function chip(active: boolean) {
	return clsx(
		'inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel/40',
		active ? 'border-steel bg-steel text-paper' : 'border-line-strong bg-card text-ink-muted hover:border-steel hover:text-steel',
	);
}

/**
 * The directory: filter by department, clinic and video, or search by name.
 * Seeded with the server list (no client fetch); filters live in the URL.
 */
export function ClinicianDirectory({ clinicians, departments, clinics, initial }: ClinicianDirectoryProps) {
	const reduce = useReducedMotion();
	const [department, setDepartment] = useState<string | null>(initial.department);
	const [clinic, setClinic] = useState<string | null>(initial.clinic);
	const [video, setVideo] = useState(initial.video);
	const [q, setQ] = useState(initial.q);
	const query = useDeferredValue(q.trim().toLowerCase());

	useEffect(() => {
		const p = new URLSearchParams();
		if (department) p.set('department', department);
		if (clinic) p.set('clinic', clinic);
		if (video) p.set('video', '1');
		if (query) p.set('q', query);
		const qs = p.toString();
		window.history.replaceState(window.history.state, '', qs ? `/clinicians?${qs}` : '/clinicians');
	}, [department, clinic, video, query]);

	const labels = useMemo(() => new Map(departments.map((d) => [d.value, d.label])), [departments]);
	const list = useMemo(
		() =>
			clinicians.filter(
				(c) =>
					(!department || c.departments.includes(department)) &&
					(!clinic || c.clinics.some((x) => x.slug === clinic)) &&
					(!video || c.video) &&
					(!query || `${c.name} ${c.title} ${c.focus.join(' ')} ${c.languages.join(' ')}`.toLowerCase().includes(query)),
			),
		[clinicians, department, clinic, video, query],
	);

	const reset = () => {
		setDepartment(null);
		setClinic(null);
		setVideo(false);
		setQ('');
	};
	const filtered = !!(department || clinic || video || query);

	return (
		<div>
			<div className="flex flex-col gap-5 border-b border-line pb-8">
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<label className="relative block w-full md:max-w-sm">
						<span className="sr-only">Search clinicians by name, focus or language</span>
						<DepartmentIcon name="search" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-dim" />
						<input
							type="search"
							value={q}
							onChange={(e) => setQ(e.target.value)}
							placeholder="Name, focus or language"
							className="h-12 w-full rounded-full border border-line-strong bg-card pl-11 pr-4 text-[15px] text-ink placeholder:text-ink-dim focus:border-steel focus:outline-none focus:ring-2 focus:ring-steel/25"
						/>
					</label>
					<div className="flex flex-wrap items-center gap-2" role="group" aria-label="Clinic">
						<button type="button" className={chip(!clinic)} aria-pressed={!clinic} onClick={() => setClinic(null)}>
							Every clinic
						</button>
						{clinics.map((c) => (
							<button key={c.value} type="button" className={chip(clinic === c.value)} aria-pressed={clinic === c.value} onClick={() => setClinic(clinic === c.value ? null : c.value)}>
								{c.label}
							</button>
						))}
						<button type="button" className={chip(video)} aria-pressed={video} onClick={() => setVideo(!video)}>
							<DepartmentIcon name="video" className="h-3.5 w-3.5" />
							Video visits
						</button>
					</div>
				</div>
				<div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Department">
					<button type="button" className={chip(!department)} aria-pressed={!department} onClick={() => setDepartment(null)}>
						All departments
					</button>
					{departments.map((d) => (
						<button key={d.value} type="button" className={chip(department === d.value)} aria-pressed={department === d.value} onClick={() => setDepartment(department === d.value ? null : d.value)}>
							{d.label}
						</button>
					))}
				</div>
			</div>

			<div className="mt-6 flex items-center justify-between gap-4">
				<p className="tabular text-sm text-ink-muted" aria-live="polite">
					{list.length} {list.length === 1 ? 'clinician' : 'clinicians'}
					{department ? ` in ${labels.get(department)?.toLowerCase()}` : ''}
				</p>
				{filtered ? (
					<button type="button" onClick={reset} className="text-sm font-medium text-steel hover:text-steel-deep">
						Clear filters
					</button>
				) : null}
			</div>

			{list.length ? (
				<ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
					<AnimatePresence initial={false} mode="popLayout">
						{list.map((c) => (
							<motion.li
								key={c.id}
								layout={!reduce}
								initial={ITEM_FROM}
								animate={ITEM_IN}
								exit={ITEM_OUT}
								transition={reduce ? NO_T : ITEM_T}
								className="min-w-0"
							>
								<ClinicianCard
									clinician={c}
									departmentLabel={c.departments.map((d) => labels.get(d)).filter(Boolean).slice(0, 2).join(' · ')}
									sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 46vw"
								/>
							</motion.li>
						))}
					</AnimatePresence>
				</ul>
			) : (
				<div className="ruled mt-8 rounded-card border border-line px-8 py-12 text-center">
					<p className="font-display text-2xl text-ink">
						Nobody matches <em className="text-steel">just yet.</em>
					</p>
					<p className="mt-3 text-ink-muted">Try fewer filters, or let the Care Finder pick the right person for you.</p>
				</div>
			)}
		</div>
	);
}
