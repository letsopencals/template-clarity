import type { Metadata } from 'next';
export const metadata: Metadata = {
	title: 'About',
	description: 'Learn about our story, values, and the clinicians behind Clear Care Medical.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
	return children;
}
