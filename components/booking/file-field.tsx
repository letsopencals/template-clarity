'use client';

import { memo, useEffect, useId, useMemo, useRef, useState, type DragEvent } from 'react';
import { clsx } from 'clsx';
import type { CheckoutQuestionResponse } from '@opencals/storefront-sdk';
import { DepartmentIcon } from '@/components/ui/department-icon';
import { fileRulesFor, formatBytes, type FileUploads, type UploadItem } from '@/hooks/use-file-uploads';

interface FileFieldProps {
	question: CheckoutQuestionResponse;
	label: string;
	description: string | null;
	required: boolean;
	error: string | null;
	uploads: FileUploads;
}

/** Object-URL preview for an image, revoked on unmount. */
function useObjectUrl(file: File, enabled: boolean): string | null {
	const [url, setUrl] = useState<string | null>(null);
	useEffect(() => {
		if (!enabled) return;
		const u = URL.createObjectURL(file);
		setUrl(u);
		return () => URL.revokeObjectURL(u);
	}, [file, enabled]);
	return url;
}

const UploadTile = memo(function UploadTile({
	item,
	onRemove,
	onRetry,
}: {
	item: UploadItem;
	onRemove: () => void;
	onRetry: () => void;
}) {
	const isImage = item.mime.startsWith('image/') && !item.mime.includes('heic') && !item.mime.includes('heif');
	const preview = useObjectUrl(item.file, isImage);
	return (
		<li className="flex min-w-0 items-center gap-3 rounded-field border border-line bg-card p-2.5">
			<span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-cream text-ink-dim">
				{preview ? (
					// eslint-disable-next-line @next/next/no-img-element -- local object URL preview
					<img src={preview} alt="" className="h-full w-full object-cover" />
				) : (
					<DepartmentIcon name="clipboard" className="h-5 w-5" />
				)}
				{item.status === 'uploading' ? (
					<span className="absolute inset-x-1 bottom-1 h-1 overflow-hidden rounded-full bg-white/70">
						<span className="block h-full bg-steel transition-[width] duration-200" style={{ width: `${Math.round(item.progress * 100)}%` }} />
					</span>
				) : null}
			</span>
			<span className="min-w-0 flex-1">
				<span className="block truncate text-[14px] font-medium text-ink">{item.filename}</span>
				<span className={clsx('block text-[12px]', item.status === 'error' ? 'text-clay' : 'text-ink-muted')} aria-live="polite">
					{item.status === 'uploading'
						? `Uploading… ${Math.round(item.progress * 100)}%`
						: item.status === 'error'
							? item.error
							: `${formatBytes(item.size)} · attached securely`}
				</span>
			</span>
			{item.status === 'error' ? (
				<button type="button" onClick={onRetry} className="text-[13px] font-semibold text-steel hover:text-steel-deep">
					Retry
				</button>
			) : null}
			<button
				type="button"
				onClick={onRemove}
				aria-label={`Remove ${item.filename}`}
				className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-cream hover:text-ink"
			>
				<svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
					<path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
				</svg>
			</button>
		</li>
	);
});

/** A real upload field: presign → PUT → fileIds, with previews, progress, retry and remove. */
export function FileField({ question, label, description, required, error, uploads }: FileFieldProps) {
	const id = useId();
	const input = useRef<HTMLInputElement>(null);
	const rules = useMemo(() => fileRulesFor(question), [question]);
	const list = uploads.uploads[question.id] ?? [];
	const [rejected, setRejected] = useState<string[]>([]);
	const [dragging, setDragging] = useState(false);
	const full = list.length >= rules.maxFiles;

	const add = (files: FileList | null) => {
		if (!files || files.length === 0) return;
		setRejected(uploads.addFiles(question, files));
	};
	const onDrop = (e: DragEvent<HTMLLabelElement>) => {
		e.preventDefault();
		setDragging(false);
		add(e.dataTransfer.files);
	};

	return (
		<div>
			<p id={`${id}-label`} className="text-[15px] font-semibold text-ink">
				{label}
				{required ? null : <span className="ml-2 text-[13px] font-normal text-ink-dim">Optional</span>}
			</p>
			{description ? <p className="mt-0.5 text-[14px] text-ink-muted">{description}</p> : null}
			{list.length > 0 ? (
				<ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
					{list.map((item) => (
						<UploadTile key={item.key} item={item} onRemove={() => uploads.remove(question.id, item.key)} onRetry={() => uploads.retry(question.id, item.key)} />
					))}
				</ul>
			) : null}
			{full ? null : (
				<label
					htmlFor={id}
					onDragOver={(e) => {
						e.preventDefault();
						setDragging(true);
					}}
					onDragLeave={() => setDragging(false)}
					onDrop={onDrop}
					className={clsx(
						'mt-3 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-card border border-dashed px-4 py-6 text-center transition-colors duration-300',
						dragging ? 'border-steel bg-steel-tint' : error ? 'border-clay bg-clay-soft/40' : 'border-line-strong bg-paper hover:border-steel',
					)}
				>
					<span className="text-[14px] font-semibold text-steel">{list.length > 0 ? 'Add another' : 'Add a photo'}</span>
					<span className="text-[12px] text-ink-muted">{rules.hint}</span>
					<input
						ref={input}
						id={id}
						type="file"
						className="sr-only"
						accept={rules.accept}
						multiple={rules.maxFiles - list.length > 1}
						aria-labelledby={`${id}-label`}
						aria-invalid={error ? true : undefined}
						onChange={(e) => {
							add(e.target.files);
							if (input.current) input.current.value = '';
						}}
					/>
				</label>
			)}
			{rejected.length > 0 ? (
				<ul className="mt-2 space-y-0.5 text-[13px] text-clay" role="alert">
					{rejected.map((r) => (
						<li key={r}>{r}</li>
					))}
				</ul>
			) : null}
			{error ? (
				<p className="mt-2 text-[13px] text-clay" role="alert">
					{error}
				</p>
			) : null}
			<p className="mt-2 text-[12px] text-ink-dim">Only your care team can see what you upload.</p>
		</div>
	);
}
