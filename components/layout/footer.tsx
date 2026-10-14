import Link from 'next/link';
import { CareLine } from '@/components/motifs/care-line';
import { Seal } from '@/components/motifs/seal';
import { siteConfig } from '@/lib/site-config';
import { Logo } from './logo';
import { FooterSettings } from './footer-settings';

const HOURS = siteConfig.contact.hours.split('\n');

/** Footer: blurb, link columns, emergency line, hours, and the global selectors. */
export function Footer() {
	return (
		<footer className="grain relative overflow-hidden bg-cream text-ink">
			<div className="container-x relative z-10">
				<CareLine settled tone="brass" className="h-8 pt-2" />

				<div className="grid grid-cols-1 gap-14 py-16 md:grid-cols-6 md:py-20 lg:grid-cols-12">
					<div className="min-w-0 md:col-span-6 lg:col-span-5">
						<Logo />
						<p className="mt-6 max-w-sm text-[15px] leading-relaxed text-ink-muted">{siteConfig.footer.blurb}</p>
						<div className="mt-8 flex items-center gap-5">
							<Seal size={72} />
							<div className="flex flex-col gap-1 text-sm">
								<a href={siteConfig.contact.phoneHref} className="tabular text-ink transition-colors hover:text-steel">
									{siteConfig.contact.phone}
								</a>
								<a href={`mailto:${siteConfig.contact.email}`} className="text-ink-muted transition-colors hover:text-steel">
									{siteConfig.contact.email}
								</a>
							</div>
						</div>
					</div>

					{siteConfig.footer.columns.map((col) => (
						<div key={col.title} className="min-w-0 md:col-span-2">
							<h2 className="eyebrow text-oak">{col.title}</h2>
							<ul className="mt-5 flex flex-col gap-3">
								{col.links.map((link) => (
									<li key={link.href}>
										<Link href={link.href} className="link-underline text-[15px] text-ink/80 transition-colors hover:text-steel">
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}

					<div className="min-w-0 md:col-span-2 lg:col-span-3">
						<h2 className="eyebrow text-oak">Clinic hours</h2>
						<ul className="mt-5 flex flex-col gap-2 text-[15px] text-ink/80">
							{HOURS.map((h) => (
								<li key={h} className="tabular text-[13px]">
									{h}
								</li>
							))}
						</ul>
						<div className="mt-6 rounded-card border border-clay/25 bg-clay-soft/60 p-4">
							<p className="text-[13px] font-semibold text-clay">{siteConfig.emergency.short}</p>
							<p className="mt-1 text-[13px] leading-relaxed text-ink-muted">Nurse line (non-urgent): <a href={`tel:${siteConfig.contact.nurseLine.replace(/[^+\d]/g, '')}`} className="tabular whitespace-nowrap text-ink hover:text-steel">{siteConfig.contact.nurseLine}</a></p>
						</div>
					</div>
				</div>

				<div className="flex flex-col gap-5 border-t border-line py-8 md:flex-row md:items-center md:justify-between">
					<FooterSettings />
					<div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-dim">
						{siteConfig.footer.socials.map((s) => (
							<a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="uppercase tracking-[0.16em] transition-colors hover:text-steel">
								{s.label}
							</a>
						))}
						<p suppressHydrationWarning>
							&copy; {new Date().getFullYear()} {siteConfig.name}. Powered by{' '}
							<a href="https://opencals.com" target="_blank" rel="noopener noreferrer" className="text-ink-muted transition-colors hover:text-steel">
								Opencals
							</a>
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}
