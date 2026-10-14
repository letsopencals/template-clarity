import '@/lib/opencals';
import { AppointmentService, type AppointmentDetailResponse } from '@opencals/storefront-sdk';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { handleApiError } from '@/lib/api-error-handler';
import { getDepartmentIndex } from '@/lib/server-data';
import { intakeKeysFor, toCareVisit } from '@/app/api/account/_lib/care';
import type { CareRecord } from '@/components/account/care-types';

/** Most recent visits loaded into the portal (details are fetched one by one). */
const CAP = 30;

/**
 * The signed-in patient's care record: their most recent visits (newest first),
 * each mapped to a public-safe `CareVisit` with who it was for, department,
 * clinician, place, notes and charge.
 */
export async function GET() {
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	try {
		const { data: list } = await AppointmentService.list({
			query: { take: CAP, page: 1, orderBy: 'from', order: 'DESC' },
			headers: auth.headers,
			throwOnError: true,
		});
		const items = list?.data ?? [];
		const total = (list?.meta as { total?: number } | undefined)?.total ?? items.length;

		const [details, departments] = await Promise.all([
			Promise.all(
				items.map(async (item) => {
					try {
						const { data } = await AppointmentService.find({ path: { appointmentId: item.id }, headers: auth.headers });
						return (data as AppointmentDetailResponse | undefined) ?? null;
					} catch {
						return null;
					}
				}),
			),
			getDepartmentIndex(),
		]);
		const found = details.filter((d): d is AppointmentDetailResponse => !!d);
		const keys = await intakeKeysFor(found.map((d) => d.product?.id));

		const visits = found
			.map((d) => toCareVisit(d, departments, keys[d.product?.id]))
			.sort((a, b) => new Date(b.from).getTime() - new Date(a.from).getTime());

		const body: CareRecord = { visits, truncated: total > items.length };
		return NextResponse.json(body);
	} catch (err) {
		return handleApiError(err);
	}
}
