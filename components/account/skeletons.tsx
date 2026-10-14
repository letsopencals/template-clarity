import { clsx } from 'clsx';

/** Skeleton blocks shaped like the real layouts — no spinners in My Care. */
export function Bone({ className }: { className?: string }) {
	return <span aria-hidden className={clsx('block animate-pulse rounded-full bg-cream-deep/60', className)} />;
}

function Busy({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
	return (
		<div role="status" aria-busy="true" aria-label={label} className={className}>
			{children}
		</div>
	);
}

export function RowSkeleton() {
	return (
		<div className="flex items-center gap-5 rounded-card border border-line bg-card px-5 py-4">
			<span aria-hidden className="block h-[4.5rem] w-16 shrink-0 animate-pulse rounded-card bg-cream" />
			<div className="min-w-0 flex-1 space-y-2.5">
				<Bone className="h-4 w-2/3" />
				<Bone className="h-3 w-1/2" />
			</div>
			<Bone className="h-6 w-20 max-sm:hidden" />
		</div>
	);
}

export function OverviewSkeleton() {
	return (
		<Busy label="Loading your care" className="space-y-10">
			<div className="paper grid grid-cols-1 gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
				<div className="flex min-w-0 gap-5">
					<span aria-hidden className="block h-24 w-20 shrink-0 animate-pulse rounded-card bg-cream" />
					<div className="min-w-0 flex-1 space-y-3 pt-1">
						<Bone className="h-3 w-24" />
						<Bone className="h-7 w-3/4" />
						<Bone className="h-4 w-1/2" />
						<Bone className="mt-6 h-11 w-44" />
					</div>
				</div>
				<div className="ruled min-h-40 rounded-card border border-line" />
			</div>
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<RowSkeleton />
				<RowSkeleton />
			</div>
		</Busy>
	);
}

export function ListSkeleton({ rows = 4, label = 'Loading visits' }: { rows?: number; label?: string }) {
	return (
		<Busy label={label} className="space-y-3">
			<Bone className="mb-5 h-8 w-20" />
			{Array.from({ length: rows }, (_, i) => (
				<RowSkeleton key={i} />
			))}
		</Busy>
	);
}

export function RecordSkeleton() {
	return (
		<Busy label="Loading visit" className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
			<div className="min-w-0 space-y-6">
				<div className="paper space-y-4 p-6 sm:p-8">
					<Bone className="h-3 w-28" />
					<Bone className="h-9 w-3/4" />
					<Bone className="h-4 w-1/2" />
				</div>
				<div className="ruled h-56 rounded-card border border-line" />
			</div>
			<div className="min-w-0 space-y-6">
				<div className="paper h-40" />
				<div className="paper h-56" />
			</div>
		</Busy>
	);
}

export function FormSkeleton() {
	return (
		<Busy label="Loading settings" className="paper space-y-5 p-6 sm:p-8">
			<Bone className="h-5 w-40" />
			<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
				<span aria-hidden className="block h-12 animate-pulse rounded-field bg-cream" />
				<span aria-hidden className="block h-12 animate-pulse rounded-field bg-cream" />
			</div>
			<span aria-hidden className="block h-12 animate-pulse rounded-field bg-cream" />
			<Bone className="h-11 w-36" />
		</Busy>
	);
}

export function ShellSkeleton() {
	return (
		<div className="container-x pt-28 pb-24">
			<Bone className="h-3 w-24" />
			<Bone className="mt-4 h-10 w-72 max-w-full" />
			<div className="mt-8 flex gap-6 border-b border-line pb-3">
				<Bone className="h-4 w-16" />
				<Bone className="h-4 w-14" />
				<Bone className="h-4 w-14" />
				<Bone className="h-4 w-16" />
			</div>
			<div className="mt-10">
				<OverviewSkeleton />
			</div>
		</div>
	);
}
