import type { Metadata } from 'next';
export const metadata: Metadata = {
	title: 'Book a visit',
	description: 'Choose who the visit is for, how you’ll be seen, your clinician and a time. We hold it while you check out.',
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
	return children;
}
