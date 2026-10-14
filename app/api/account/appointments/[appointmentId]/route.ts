import '@/lib/opencals';
import { AppointmentService } from '@opencals/storefront-sdk';
import { requireAuth } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { getDepartmentIndex } from '@/lib/server-data';
import { intakeKeysFor, toCareVisit } from '@/app/api/account/_lib/care';

/** One visit from the patient's care record, as a public-safe `CareVisit`. */
export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ appointmentId: string }> },
) {
	const { appointmentId } = await params;
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	try {
		const [{ data }, departments] = await Promise.all([
			AppointmentService.find({ path: { appointmentId }, headers: auth.headers, throwOnError: true }),
			getDepartmentIndex(),
		]);
		const keys = await intakeKeysFor([data.product?.id]);
		return NextResponse.json(toCareVisit(data, departments, keys[data.product?.id]));
	} catch (err) {
		return handleApiError(err);
	}
}
