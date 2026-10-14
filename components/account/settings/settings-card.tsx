/** A titled paper card for one settings group. */
export function SettingsCard({ id, title, intro, children }: { id: string; title: string; intro?: string; children: React.ReactNode }) {
	return (
		<section aria-labelledby={id} className="paper grid grid-cols-1 gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10">
			<div className="min-w-0">
				<h3 id={id} className="font-display text-xl text-ink">
					{title}
				</h3>
				{intro ? <p className="mt-2 text-sm leading-relaxed text-ink-muted">{intro}</p> : null}
			</div>
			<div className="min-w-0">{children}</div>
		</section>
	);
}
