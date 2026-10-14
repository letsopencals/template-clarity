'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/button';
import { DepartmentIcon } from '@/components/ui/department-icon';

type Status = 'idle' | 'requesting' | 'live' | 'denied' | 'missing' | 'unsupported' | 'error';

const BARS = 14;
const BAR_KEYS = Array.from({ length: BARS }, (_, i) => i);

interface Media {
	stream: MediaStream | null;
	ctx: AudioContext | null;
	raf: number;
}

async function requestMedia(): Promise<MediaStream> {
	try {
		return await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
	} catch (err) {
		// A laptop without a camera (or mic) can still pass half the check.
		if (err instanceof DOMException && (err.name === 'NotFoundError' || err.name === 'OverconstrainedError')) {
			try {
				return await navigator.mediaDevices.getUserMedia({ audio: true });
			} catch {
				return await navigator.mediaDevices.getUserMedia({ video: true });
			}
		}
		throw err;
	}
}

/**
 * Thirty-second camera and microphone check. Everything stays in this tab:
 * the preview is a local <video>, the level meter reads an AnalyserNode, and
 * every track is stopped on "Stop", on unmount and on navigation.
 */
export function DeviceCheck() {
	const [status, setStatus] = useState<Status>('idle');
	const [hasVideo, setHasVideo] = useState(false);
	const [hasAudio, setHasAudio] = useState(false);
	const [heard, setHeard] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);
	const barsRef = useRef<(HTMLSpanElement | null)[]>([]);
	const media = useRef<Media>({ stream: null, ctx: null, raf: 0 });

	const stop = useCallback(() => {
		const m = media.current;
		cancelAnimationFrame(m.raf);
		m.stream?.getTracks().forEach((t) => t.stop());
		void m.ctx?.close().catch(() => undefined);
		media.current = { stream: null, ctx: null, raf: 0 };
		if (videoRef.current) videoRef.current.srcObject = null;
		barsRef.current.forEach((b) => b?.style.setProperty('--lvl', '0'));
	}, []);

	useEffect(() => stop, [stop]);

	const start = async () => {
		if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
			setStatus('unsupported');
			return;
		}
		stop();
		setHeard(false);
		setStatus('requesting');
		try {
			const stream = await requestMedia();
			media.current.stream = stream;
			const v = stream.getVideoTracks().length > 0;
			const a = stream.getAudioTracks().length > 0;
			setHasVideo(v);
			setHasAudio(a);
			if (v && videoRef.current) {
				videoRef.current.srcObject = stream;
				void videoRef.current.play().catch(() => undefined);
			}
			if (a) {
				const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
				const ctx = new Ctx();
				const analyser = ctx.createAnalyser();
				analyser.fftSize = 512;
				ctx.createMediaStreamSource(stream).connect(analyser);
				media.current.ctx = ctx;
				const buf = new Uint8Array(analyser.fftSize);
				let loud = 0;
				const tick = () => {
					analyser.getByteTimeDomainData(buf);
					let sum = 0;
					for (let i = 0; i < buf.length; i++) {
						const x = (buf[i]! - 128) / 128;
						sum += x * x;
					}
					const rms = Math.min(1, Math.sqrt(sum / buf.length) * 4);
					barsRef.current.forEach((b, i) => {
						if (!b) return;
						const threshold = (i + 1) / BARS;
						b.style.setProperty('--lvl', rms >= threshold ? '1' : rms >= threshold - 1 / BARS ? '0.5' : '0');
					});
					if (rms > 0.25 && ++loud === 6) setHeard(true);
					media.current.raf = requestAnimationFrame(tick);
				};
				media.current.raf = requestAnimationFrame(tick);
			}
			setStatus('live');
		} catch (err) {
			stop();
			const name = err instanceof DOMException ? err.name : '';
			setStatus(name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : name === 'NotFoundError' ? 'missing' : 'error');
		}
	};

	const end = () => {
		stop();
		setStatus('idle');
	};

	const live = status === 'live';
	const checks = [
		{ label: 'Camera', ok: live && hasVideo, pending: !live || !hasVideo, hint: live && !hasVideo ? 'No camera found — your clinician can still call you.' : 'You should see yourself.' },
		{ label: 'Microphone', ok: live && hasAudio && heard, pending: !(live && hasAudio && heard), hint: live && !hasAudio ? 'No microphone found.' : live && !heard ? 'Say hello — the bars should move.' : 'We can hear you.' },
	];

	return (
		<div id="device-check" className="scroll-mt-28 overflow-hidden rounded-window border border-line bg-card shadow-paper">
			<div className="grid grid-cols-1 md:grid-cols-5">
				<div className="relative aspect-[4/3] min-w-0 bg-steel-night md:col-span-3 md:aspect-auto md:min-h-[22rem]">
					<video
						ref={videoRef}
						muted
						playsInline
						aria-label="Your camera preview"
						className={clsx('absolute inset-0 h-full w-full -scale-x-100 object-cover transition-opacity duration-500', live && hasVideo ? 'opacity-100' : 'opacity-0')}
					/>
					{live && hasVideo ? null : (
						<div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center text-paper/80">
							<span className="flex h-16 w-16 items-center justify-center rounded-full border border-paper/25">
								<DepartmentIcon name="video" className="h-7 w-7" />
							</span>
							<p className="max-w-[30ch] text-[15px]">{statusCopy(status)}</p>
						</div>
					)}
					{live ? (
						<span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-steel-night/70 px-3 py-1.5 text-[12px] font-medium text-paper backdrop-blur">
							<span className="live-dot" aria-hidden />
							Preview · only you can see this
						</span>
					) : null}
					<div aria-hidden className="absolute bottom-4 left-4 right-4 flex h-8 items-end gap-1">
						{BAR_KEYS.map((i) => (
							<span
								key={i}
								ref={(el) => {
									barsRef.current[i] = el;
								}}
								className="flex-1 rounded-full transition-[background-color,height] duration-100"
								style={{ ['--lvl' as string]: 0, height: 'calc(20% + var(--lvl, 0) * 80%)', backgroundColor: 'color-mix(in srgb, var(--color-sage) calc(var(--lvl, 0) * 100%), rgb(255 253 249 / 0.2))' }}
							/>
						))}
					</div>
				</div>
				<div className="flex min-w-0 flex-col gap-6 p-7 md:col-span-2 md:p-8">
					<div>
						<p className="eyebrow text-oak">Device check</p>
						<h3 className="display-xs mt-3 text-ink">
							Ready in <em>thirty seconds.</em>
						</h3>
						<p className="mt-2 text-[14px] leading-relaxed text-ink-muted">Nothing is recorded or sent anywhere. Your browser will ask for permission first.</p>
					</div>
					<ul className="flex flex-col gap-4" aria-live="polite">
						{checks.map((c) => (
							<li key={c.label} className="flex items-start gap-3">
								<span className={clsx('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border', c.ok ? 'border-sage-deep bg-sage-deep text-paper' : 'border-line-strong text-ink-dim')}>
									{c.ok ? <DepartmentIcon name="check" className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
								</span>
								<span className="min-w-0">
									<span className="block text-[15px] font-medium text-ink">{c.label}</span>
									<span className="block text-[13px] text-ink-muted">{c.hint}</span>
								</span>
							</li>
						))}
					</ul>
					{status === 'denied' ? (
						<p role="alert" className="rounded-card bg-clay-soft/60 p-4 text-[13px] leading-relaxed text-ink">
							Camera access is blocked. Click the camera icon in your browser’s address bar, allow access, then try again.
						</p>
					) : null}
					<div className="mt-auto flex flex-wrap gap-3">
						{live ? (
							<Button variant="outline" onClick={end}>
								Stop the check
							</Button>
						) : (
							<Button onClick={start} disabled={status === 'requesting'}>
								{status === 'requesting' ? 'Waiting for permission…' : status === 'idle' ? 'Test camera & mic' : 'Try again'}
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

function statusCopy(status: Status): string {
	switch (status) {
		case 'requesting':
			return 'Allow camera and microphone in the prompt above.';
		case 'denied':
			return 'We don’t have permission to use your camera yet.';
		case 'missing':
			return 'We couldn’t find a camera or microphone on this device.';
		case 'unsupported':
			return 'This browser can’t run a video check. Try Chrome, Safari or Edge.';
		case 'error':
			return 'Something got in the way — another app may be using your camera.';
		case 'live':
			return 'Audio only — no camera found.';
		default:
			return 'Press “Test camera & mic” to see yourself here.';
	}
}
