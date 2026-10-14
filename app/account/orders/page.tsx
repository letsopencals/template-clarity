import type { Metadata } from 'next';
import { BillingView } from '@/components/account/billing/billing-view';

export const metadata: Metadata = { title: 'Billing' };

export default function Page() {
	return <BillingView />;
}
