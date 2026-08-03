import { ImageResponse } from 'next/og';

export const size = {
	width: 32,
	height: 32,
};
export const contentType = 'image/png';

// Generated favicon — a rounded medical-blue tile with the clinic initial.
// Replace this file with a static icon.png (and a plain file export) to use your own mark.
export default function Icon() {
	return new ImageResponse(
		(
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					background: '#005B8E',
					color: '#FFFFFF',
					fontSize: 22,
					fontWeight: 700,
					borderRadius: 7,
				}}
			>
				C
			</div>
		),
		{ ...size },
	);
}
