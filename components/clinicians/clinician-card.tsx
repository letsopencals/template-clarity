import Link from 'next/link';
import { clsx } from 'clsx';
import type { PublicClinician } from '@/lib/clinicians';
import { Portrait } from './portrait';

export interface ClinicianCardProps {
	clinician: PublicClinician;
	/** Department short names to show under the title. */
	departmentLabel?: string | null;
	className?: string;
	sizes?: string;
}

/** A clinician in a small window: portrait, name, title, where and how they see patients. */
export function ClinicianCard({ clinician: c, departmentLabel, className, sizes }: ClinicianCardProps) {
	const where = c.clinics.map((x) => x.title.split(/\s+[—–-]\s+/).pop()).filter(Boolean);
	return (
		<Link href={`/clinicians/${c.slug}`} className={clsx('group block min-w-0 focus-visible:outline-none', className)}>
			<div className="relative">
				<Portrait name={c.name} src={c.imageUrl} className="aspect-[4/5] rounded-card shadow-card transition-shadow duration-500 group-hover:shadow-float group-focus-visible:ring-2 group-focus-visible:ring-steel/40" sizes={sizes} />
				{c.video ? (
					<span className="absolute bottom-3 left-3 z-[3] inline-flex items-center gap-1.5 rounded-full bg-paper/90 px-2.5 py-1 text-[11px] font-semibold text-sage-deep">
						<span className="h-1.5 w-1.5 rounded-full bg-sage-deep" />
						Video visits
					</span>
				) : null}
			</div>
			<p className="mt-4 font-display text-[1.3rem] leading-tight tracking-tight text-ink transition-colors group-hover:text-steel-deep">{c.name}</p>
			<p className="mt-1 text-[14px] text-ink-muted">{c.title}</p>
			{departmentLabel || where.length ? (
				<p className="mt-2 text-[12px] text-ink-dim">
					{[departmentLabel, where.join(' · ')].filter(Boolean).join(' — ')}
				</p>
			) : null}
		</Link>
	);
}
