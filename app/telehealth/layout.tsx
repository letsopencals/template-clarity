import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Telehealth',
	description: 'Secure online video and phone consultations with the same trusted Clear Care clinicians — book an online visit in minutes.',
};

export default function TelehealthLayout({ children }: { children: React.ReactNode }) {
	return children;
}
