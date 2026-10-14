import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { siteConfig } from '@/lib/site-config';

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Fraunces for the headline; falls back to the default face if Google Fonts is unreachable at build. */
async function loadFraunces(text: string, italic: boolean): Promise<ArrayBuffer | null> {
	try {
		const axis = italic ? 'ital,wght@1,400' : 'wght@400';
		const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Fraunces:${axis}&text=${encodeURIComponent(text)}`)).text();
		const url = css.match(/src: url\((.+?)\) format/)?.[1];
		return url ? await (await fetch(url)).arrayBuffer() : null;
	} catch {
		return null;
	}
}

/** Share card: the hero portrait in a window, the wordmark and the tagline on paper. */
export default async function OpengraphImage() {
	const photo = await readFile(join(process.cwd(), 'public/images/hero/hero-portrait.jpg'));
	const src = `data:image/jpeg;base64,${photo.toString('base64')}`;
	const [lead, accent] = ['Care that has', 'time for you.'];
	const strap = 'Three clinics · Video visits';
	const glyphs = `${siteConfig.name}${lead}${accent}${strap}CC`;
	const [fraunces, frauncesItalic] = await Promise.all([loadFraunces(glyphs, false), loadFraunces(glyphs, true)]);

	return new ImageResponse(
		(
			<div style={{ display: 'flex', width: '100%', height: '100%', background: '#FBF8F2', padding: 48, gap: 56, fontFamily: fraunces ? 'Fraunces' : 'serif' }}>
				<div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, padding: '24px 0 24px 24px' }}>
					<div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
						<div style={{ display: 'flex', width: 52, height: 52, borderRadius: 52, border: '2px solid #B08D57', alignItems: 'center', justifyContent: 'center', color: '#23465C', fontSize: 20, fontStyle: 'italic' }}>
							CC
						</div>
						<div style={{ display: 'flex', fontSize: 30, color: '#21303A' }}>
							Clear Care&nbsp;<span style={{ fontStyle: 'italic', color: '#3F6E8C' }}>Medical</span>
						</div>
					</div>
					<div style={{ display: 'flex', flexDirection: 'column', fontSize: 76, lineHeight: 1.04, color: '#21303A', letterSpacing: -2 }}>
						<span>{lead}</span>
						<span style={{ fontStyle: 'italic', color: '#3F6E8C' }}>{accent}</span>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 24, color: '#5D6870' }}>
						<svg width="140" height="28" viewBox="0 0 140 28">
							<path d="M0 14 H62 L68 4 L74 24 L80 14 H140" fill="none" stroke="#3F6E8C" strokeWidth="2" />
						</svg>
						{strap}
					</div>
				</div>
				<div style={{ display: 'flex', width: 470, height: '100%', borderRadius: 28, overflow: 'hidden', border: '2px solid #EFE4D0' }}>
					<img src={src} alt="" width={470} height={534} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
				</div>
			</div>
		),
		{
			...size,
			fonts: fraunces
				? [
						{ name: 'Fraunces', data: fraunces, style: 'normal', weight: 400 },
						...(frauncesItalic ? [{ name: 'Fraunces', data: frauncesItalic, style: 'italic' as const, weight: 400 as const }] : []),
					]
				: undefined,
		},
	);
}
