import { permanentRedirect } from 'next/navigation';

/** Old URL — video visits live at /video-visits now. */
export default function TelehealthPage() {
	permanentRedirect('/video-visits');
}
