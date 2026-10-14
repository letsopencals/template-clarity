import Link from 'next/link';
import { CareLine } from '@/components/motifs/care-line';
import { Seal } from '@/components/motifs/seal';
import { Reveal } from '@/components/motion/reveal';
import { buttonClasses } from '@/components/ui/button';
import { DepartmentIcon } from '@/components/ui/department-icon';
import { VideoBadge } from '@/components/services/video-badge';
import { shortName, type PublicClinician } from '@/lib/clinicians';
import { bookingHref } from '@/lib/catalog';
import { Portrait } from './portrait';

/** The top of a clinician's page: portrait in a window, bio on paper, and how to book them. */
export function ClinicianProfile({ clinician: c, departments, firstVisit }: { clinician: PublicClinician; departments: { slug: string; short: string }[]; firstVisit: string | null }) {
	const where = c.clinics.map((x) => x.title.split(/\s+[—–-]\s+/).pop() ?? x.title);
	return (
		<section className="grain relative overflow-hidden bg-paper pt-32 md:pt-36">
			<div aria-hidden className="pointer-events-none absolute -left-40 top-10 h-[34rem] w-[34rem] rounded-full bg-honey-soft/60 blur-3xl" />
			<div className="container-x relative z-10 grid grid-cols-1 gap-12 pb-14 lg:grid-cols-12 lg:gap-16">
				<Reveal className="min-w-0 lg:col-span-5">
					<div className="relative">
						<Portrait name={c.name} src={c.imageUrl} priority className="aspect-[4/5] rounded-window shadow-float" monogramClassName="text-6xl" sizes="(min-width: 1024px) 36vw, 100vw" />
						{c.curated ? (
							<div className="absolute -bottom-6 -right-3 md:-right-6">
								<Seal ring="Clear Care · Clinician · Since 2013 · " center="CC" size={104} motion="static" className="rounded-full bg-paper shadow-card" />
							</div>
						) : null}
					</div>
				</Reveal>
				<div className="min-w-0 lg:col-span-7 lg:pt-6">
					<Reveal>
						<Link href="/clinicians" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-steel">
							<DepartmentIcon name="arrow" className="h-4 w-4 rotate-180" />
							All clinicians
						</Link>
						<p className="eyebrow mt-8 text-oak">{departments.map((d) => d.short).join(' · ') || 'Clinician'}</p>
						<h1 className="display-lg mt-4 text-ink">{c.name}</h1>
						<p className="mt-3 font-display text-xl italic text-steel">{c.title}</p>
					</Reveal>
					<Reveal delay={0.1}>
						<p className="mt-8 max-w-[58ch] text-[17px] leading-relaxed text-ink-muted">
							{c.bio ?? `${shortName(c)} sees patients at Clear Care${where.length ? ` in ${where.join(' and ')}` : ''}, with the same unhurried thirty-minute visits as everyone here.`}
						</p>
					</Reveal>
					<Reveal delay={0.16}>
						<dl className="ruled mt-10 rounded-card border border-line px-6 py-3">
							{c.focus.length ? <ProfileRow label="Focus" value={c.focus.join(', ')} /> : null}
							{c.languages.length ? <ProfileRow label="Speaks" value={c.languages.join(', ')} /> : null}
							<ProfileRow label="Sees patients" value={[where.join(', '), c.video ? 'by video' : null].filter(Boolean).join(' · ') || 'In clinic'} />
						</dl>
					</Reveal>
					<Reveal delay={0.22} className="mt-9 flex flex-wrap items-center gap-3">
						{firstVisit ? (
							<Link href={bookingHref(firstVisit, { staff: c.slug })} className={buttonClasses({ size: 'lg' })}>
								Book with {shortName(c)}
							</Link>
						) : null}
						<Link href="#visits" className={buttonClasses({ variant: 'outline', size: 'lg' })}>
							Visits & fees
						</Link>
						{c.video ? <VideoBadge label="Offers video visits" /> : null}
					</Reveal>
				</div>
			</div>
			<div className="container-x relative z-10">
				<CareLine settled trigger="mount" tone="brass" />
			</div>
		</section>
	);
}

function ProfileRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex min-h-[2.1rem] flex-col justify-center gap-1 py-1.5 sm:flex-row sm:items-center sm:gap-6">
			<dt className="w-32 shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-dim">{label}</dt>
			<dd className="text-[15px] text-ink">{value}</dd>
		</div>
	);
}
