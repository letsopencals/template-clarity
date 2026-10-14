import type { Metadata } from 'next';
import { StatementView } from '@/components/account/billing/statement-view';

export const metadata: Metadata = { title: 'Statement' };

export default async function Page({ params }: { params: Promise<{ orderId: string }> }) {
	const { orderId } = await params;
	return <StatementView orderId={orderId} />;
}
