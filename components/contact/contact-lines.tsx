import { DepartmentIcon } from '@/components/ui/department-icon';
import { siteConfig } from '@/lib/site-config';

const { contact, emergency } = siteConfig;
const nurseHref = `tel:${contact.nurseLine.replace(/[^\d+]/g, '')}`;

/** The ways to reach a person, with the emergency line set apart in clay. */
export function ContactLines() {
	const a = contact.address;
	const lines = [
		{ icon: 'phone', label: 'Front desk', value: contact.phone, href: contact.phoneHref, note: 'Bookings, changes and questions.' },
		{ icon: 'users', label: 'Nurse line', value: contact.nurseLine, href: nurseHref, note: 'Advice after your visit, from a registered nurse.' },
		{ icon: 'clipboard', label: 'Email', value: contact.email, href: `mailto:${contact.email}`, note: 'We reply within one working day.' },
	];
	return (
		<section className="bg-paper pb-4 pt-12">
			<div className="container-x grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
				{lines.map((l) => (
					<a key={l.label} href={l.href} className="group flex min-w-0 flex-col gap-4 rounded-card border border-line bg-card p-6 shadow-card transition-shadow hover:shadow-float">
						<span className="flex h-10 w-10 items-center justify-center rounded-full bg-steel-tint text-steel">
							<DepartmentIcon name={l.icon} className="h-5 w-5" />
						</span>
						<span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-dim">{l.label}</span>
						<span className="break-words font-display text-xl text-ink group-hover:text-steel-deep">{l.value}</span>
						<span className="text-[13px] text-ink-muted">{l.note}</span>
					</a>
				))}
				<a href={`tel:${emergency.phone}`} className="flex min-w-0 flex-col gap-4 rounded-card border border-clay/30 bg-clay-soft/60 p-6">
					<span className="flex h-10 w-10 items-center justify-center rounded-full bg-clay text-paper">
						<DepartmentIcon name="phone" className="h-5 w-5" />
					</span>
					<span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-clay">Emergency</span>
					<span className="font-display text-xl text-ink">Call {emergency.phone}</span>
					<span className="text-[13px] leading-relaxed text-ink-muted">{emergency.long}</span>
				</a>
			</div>
			<p className="container-x mt-8 text-[13px] text-ink-dim">
				Head office: {a.street}, {a.locality}, {a.region} {a.postalCode}
			</p>
		</section>
	);
}
