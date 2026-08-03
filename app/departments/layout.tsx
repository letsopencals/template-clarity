import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Departments',
	description: 'Browse our medical departments and book an appointment with the right specialist.',
};

export default function DepartmentsLayout({ children }: { children: React.ReactNode }) {
	return children;
}
