import type { Metadata } from 'next';
import { LinkResolver } from '@/components/auth/link-resolver';

export const metadata: Metadata = {
	title: 'Opening your link',
	robots: { index: false, follow: false },
};

export default async function LinkPage({ params }: { params: Promise<{ token: string }> }) {
	const { token } = await params;
	return <LinkResolver token={token} />;
}
