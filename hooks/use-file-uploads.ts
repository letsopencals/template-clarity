'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CheckoutQuestionResponse } from '@opencals/storefront-sdk';
import { uploadLimits } from '@/lib/intake';

/*
 * Pre-visit file uploads (e.g. the dermatology photo), per question:
 *   validate (type, size, count) → POST /api/uploads/presign → XHR PUT to S3
 * Each file ends `done` with a `fileId`, or `error` with a message and a retry.
 * The ids go to `/api/book` with the answer (`fileIds`), which links them via
 * `CheckoutService.saveAnswers`.
 */

/** Browsers often report HEIC as '' — infer from the extension so the signed type matches. */
const EXTENSION_MIMES: Record<string, string> = {
	heic: 'image/heic',
	heif: 'image/heif',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	png: 'image/png',
	webp: 'image/webp',
	pdf: 'application/pdf',
	mp4: 'video/mp4',
	mov: 'video/quicktime',
	webm: 'video/webm',
};

export function resolveMime(file: File): string {
	if (file.type) return file.type;
	const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
	return EXTENSION_MIMES[ext] ?? 'application/octet-stream';
}

export function formatBytes(bytes: number): string {
	if (bytes >= 1024 * 1024) return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`;
	return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export interface FileRules {
	maxFiles: number;
	maxSizeBytes: number;
	/** `accept` attribute for the file input. */
	accept: string;
	/** Human hint, e.g. "Photos · up to 10 MB each · up to 3". */
	hint: string;
}

/** Limits from the question's `fileConfig` (via `uploadLimits`), plus a readable hint. */
export function fileRulesFor(question: CheckoutQuestionResponse): FileRules {
	const { maxFiles, maxSizeBytes, accept } = uploadLimits(question);
	const kinds = [
		accept.includes('image/') ? 'Photos' : null,
		accept.includes('application/pdf') ? 'PDF' : null,
		accept.includes('video/') ? 'video' : null,
	].filter(Boolean);
	const what = kinds.length ? kinds.join(', ') : 'Files';
	const accepted = [accept, accept.includes('image/') ? '.heic,.heif' : ''].filter(Boolean).join(',');
	return {
		maxFiles,
		maxSizeBytes,
		accept: accepted,
		hint: `${what} · up to ${formatBytes(maxSizeBytes)} each${maxFiles > 1 ? ` · up to ${maxFiles}` : ''}`,
	};
}

function mimeAllowed(mime: string, accept: string): boolean {
	return accept.split(',').some((a) => {
		const rule = a.trim();
		if (!rule || rule.startsWith('.')) return false;
		if (rule.endsWith('/*')) return mime.startsWith(rule.slice(0, -1));
		return rule === mime;
	});
}

export type UploadStatus = 'uploading' | 'done' | 'error';

export interface UploadItem {
	/** Local key (stable across status changes). */
	key: string;
	filename: string;
	size: number;
	mime: string;
	status: UploadStatus;
	/** 0..1 */
	progress: number;
	/** Set once the PUT succeeds. */
	fileId: string | null;
	error: string | null;
	/** Kept for previews and retry; never sent anywhere but S3. */
	file: File;
}

export type UploadsByQuestion = Record<string, UploadItem[]>;

interface PresignResponse {
	fileId: string;
	presignedUrl: string;
	expiresIn: number;
}

/** Patient-facing copy: keep the backend's type/size reasons, hide configuration errors. */
function presignMessage(status: number, error: string | undefined): string {
	if (status >= 500 || !error || /question/i.test(error)) {
		return 'Photos can’t be added online right now. You can still book and bring it along.';
	}
	return error;
}

let keySeq = 0;
const nextKey = () => `up-${Date.now().toString(36)}-${(keySeq++).toString(36)}`;

/** PUT with XHR (fetch has no upload progress). Content-Type must equal the signed mime. */
function putWithProgress(url: string, file: File, mime: string, onProgress: (p: number) => void, signal: AbortSignal) {
	return new Promise<void>((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open('PUT', url);
		xhr.setRequestHeader('Content-Type', mime);
		xhr.upload.onprogress = (e) => {
			if (e.lengthComputable) onProgress(e.loaded / e.total);
		};
		xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error('The upload did not finish. Please try again.')));
		xhr.onerror = () => reject(new Error('The connection dropped during the upload.'));
		xhr.onabort = () => reject(new DOMException('Aborted', 'AbortError'));
		signal.addEventListener('abort', () => xhr.abort(), { once: true });
		xhr.send(file);
	});
}

export function useFileUploads() {
	const [uploads, setUploads] = useState<UploadsByQuestion>({});
	const controllers = useRef(new Map<string, AbortController>());
	const uploadsRef = useRef(uploads);
	useEffect(() => {
		uploadsRef.current = uploads;
	}, [uploads]);

	useEffect(() => {
		const map = controllers.current;
		return () => {
			for (const c of map.values()) c.abort();
			map.clear();
		};
	}, []);

	const patch = useCallback((questionId: string, key: string, change: Partial<UploadItem>) => {
		setUploads((prev) => {
			const list = prev[questionId];
			if (!list) return prev;
			return { ...prev, [questionId]: list.map((u) => (u.key === key ? { ...u, ...change } : u)) };
		});
	}, []);

	/** presign → PUT. Patches progress/status; resolves with the fileId, rejects on failure. */
	const uploadOnce = useCallback(
		async (questionId: string, item: UploadItem): Promise<string> => {
			const controller = new AbortController();
			controllers.current.set(item.key, controller);
			try {
				const res = await fetch('/api/uploads/presign', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ questionId, filename: item.filename, mime: item.mime, size: item.size }),
					signal: controller.signal,
				});
				const data = (await res.json().catch(() => null)) as (PresignResponse & { error?: string }) | null;
				if (!res.ok || !data?.presignedUrl) throw new Error(presignMessage(res.status, data?.error));
				await putWithProgress(data.presignedUrl, item.file, item.mime, (p) => patch(questionId, item.key, { progress: p }), controller.signal);
				patch(questionId, item.key, { status: 'done', progress: 1, fileId: data.fileId, error: null });
				return data.fileId;
			} catch (err) {
				if (!(err instanceof DOMException && err.name === 'AbortError')) {
					patch(questionId, item.key, { status: 'error', error: err instanceof Error ? err.message : 'The upload did not finish.' });
				}
				throw err;
			} finally {
				controllers.current.delete(item.key);
			}
		},
		[patch],
	);

	const run = useCallback(
		(questionId: string, item: UploadItem) => {
			uploadOnce(questionId, item).catch(() => {
				// State already carries the error.
			});
		},
		[uploadOnce],
	);

	/** Validate and start uploading. Returns plain-language messages for rejected files. */
	const addFiles = useCallback(
		(question: CheckoutQuestionResponse, files: FileList | File[]): string[] => {
			const rules = fileRulesFor(question);
			const current = uploadsRef.current[question.id] ?? [];
			const room = Math.max(0, rules.maxFiles - current.length);
			const rejected: string[] = [];
			const accepted: UploadItem[] = [];

			for (const file of Array.from(files)) {
				const mime = resolveMime(file);
				if (!mimeAllowed(mime, rules.accept)) rejected.push(`${file.name} isn’t a file type we can take here.`);
				else if (file.size > rules.maxSizeBytes) rejected.push(`${file.name} is larger than ${formatBytes(rules.maxSizeBytes)}.`);
				else if (file.size === 0) rejected.push(`${file.name} looks empty.`);
				else if (accepted.length >= room) rejected.push(`You can add up to ${rules.maxFiles} ${rules.maxFiles === 1 ? 'file' : 'files'} here.`);
				else
					accepted.push({ key: nextKey(), filename: file.name, size: file.size, mime, status: 'uploading', progress: 0, fileId: null, error: null, file });
			}

			if (accepted.length > 0) {
				setUploads((prev) => ({ ...prev, [question.id]: [...(prev[question.id] ?? []), ...accepted] }));
				for (const item of accepted) run(question.id, item);
			}
			return Array.from(new Set(rejected));
		},
		[run],
	);

	const remove = useCallback((questionId: string, key: string) => {
		controllers.current.get(key)?.abort();
		setUploads((prev) => ({ ...prev, [questionId]: (prev[questionId] ?? []).filter((u) => u.key !== key) }));
	}, []);

	const retry = useCallback(
		(questionId: string, key: string) => {
			const item = uploadsRef.current[questionId]?.find((u) => u.key === key);
			if (!item) return;
			const fresh = { ...item, status: 'uploading' as const, progress: 0, error: null, fileId: null };
			patch(questionId, key, fresh);
			run(questionId, fresh);
		},
		[patch, run],
	);

	const reset = useCallback(() => {
		for (const c of controllers.current.values()) c.abort();
		controllers.current.clear();
		setUploads({});
	}, []);

	/**
	 * Upload every finished file again and return the fresh ids per question.
	 * The backend links a file to one answer only, so a visit that is reserved
	 * again (after "Change this visit") needs new file records.
	 */
	const reuploadAll = useCallback(async (): Promise<Record<string, string[]>> => {
		const out: Record<string, string[]> = {};
		const jobs: Array<Promise<void>> = [];
		for (const [questionId, list] of Object.entries(uploadsRef.current)) {
			for (const item of list) {
				if (item.status !== 'done') continue;
				const fresh = { ...item, status: 'uploading' as const, progress: 0, fileId: null, error: null };
				patch(questionId, item.key, fresh);
				jobs.push(
					uploadOnce(questionId, fresh).then((fileId) => {
						(out[questionId] ??= []).push(fileId);
					}),
				);
			}
		}
		await Promise.all(jobs);
		return out;
	}, [patch, uploadOnce]);

	const busy = useMemo(() => Object.values(uploads).some((list) => list.some((u) => u.status === 'uploading')), [uploads]);

	return { uploads, addFiles, remove, retry, reset, reuploadAll, busy };
}

export type FileUploads = ReturnType<typeof useFileUploads>;

/** Finished file ids for a question. */
export function doneFileIds(list: UploadItem[] | undefined): string[] {
	return (list ?? []).filter((u) => u.status === 'done' && u.fileId).map((u) => u.fileId as string);
}

/** Finished filenames for a question (the readable answer text). */
export function doneFilenames(list: UploadItem[] | undefined): string[] {
	return (list ?? []).filter((u) => u.status === 'done').map((u) => u.filename);
}
