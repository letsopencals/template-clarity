'use client';

import { clsx } from 'clsx';
import type { ProductListVariant } from '@opencals/storefront-sdk';
import { DepartmentIcon, type DepartmentIconName } from '@/components/ui/department-icon';
import { formatFee, visitLength } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';

interface BookingHeaderProps {
	department: string | null;
	variant: ProductListVariant;
	variants: ProductListVariant[];
	currency: string;
	/** Disabled while a visit is held (release it first). */
	switchDisabled: boolean;
	onSwitchVariant: (slug: string) => void;
}

/** "Dermatology Consultation" → "Dermatology <em>Consultation</em>" — the last word in steel italic. */
function TitleWithEm({ title }: { title: string }) {
	const words = title.trim().split(/\s+/);
	if (words.length < 2) return <em>{title}</em>;
	const last = words.pop()!;
	return (
		<>
			{words.join(' ')} <em>{last}</em>
		</>
	);
}

export function BookingHeader({ department, variant, variants, currency, switchDisabled, onSwitchVariant }: BookingHeaderProps) {
	const dept = department ? (siteConfig.departments as Record<string, { short: string; icon: string }>)[department] : undefined;
	const deptLabel = dept?.short ?? variant.collections?.[0]?.title ?? 'Clear Care';
	return (
		<header className="max-w-3xl">
			<p className="eyebrow flex items-center gap-2 text-steel">
				{dept ? <DepartmentIcon name={dept.icon as DepartmentIconName} className="h-4 w-4" /> : null}
				{deptLabel}
			</p>
			<h1 className="display-lg mt-3 text-ink">
				<TitleWithEm title={variant.title} />
			</h1>
			{variant.description ? <p className="prose-calm mt-4 max-w-2xl text-ink-muted">{variant.description}</p> : null}
			<p className="tabular mt-4 text-[15px] text-ink">
				{visitLength(variant.duration)} <span className="text-ink-dim">·</span> {formatFee(variant.price, currency)}
			</p>

			{variants.length > 1 ? (
				<div role="radiogroup" aria-label="Visit length" className="mt-6 flex flex-wrap gap-2">
					{variants.map((v) => {
						const selected = v.id === variant.id;
						return (
							<button
								key={v.id}
								type="button"
								role="radio"
								aria-checked={selected}
								disabled={switchDisabled && !selected}
								onClick={() => (selected ? undefined : onSwitchVariant(v.slug))}
								className={clsx(
									'rounded-full border px-4 py-2 text-[14px] transition-colors duration-300 disabled:opacity-45',
									selected ? 'border-steel bg-steel text-white' : 'border-line-strong bg-card text-ink hover:border-steel',
								)}
							>
								{v.variantTitle || v.title}
								<span className={clsx('tabular ml-2 text-[12px]', selected ? 'text-white/75' : 'text-ink-muted')}>
									{visitLength(v.duration)} · {formatFee(v.price, currency)}
								</span>
							</button>
						);
					})}
				</div>
			) : null}

			<p className="mt-6 flex items-start gap-2.5 rounded-field border border-line bg-cream px-4 py-3 text-[13px] leading-relaxed text-ink-muted">
				<DepartmentIcon name="phone" className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
				<span>
					<span className="font-semibold text-ink">{siteConfig.emergency.short}</span> {siteConfig.emergency.long}
				</span>
			</p>
		</header>
	);
}
