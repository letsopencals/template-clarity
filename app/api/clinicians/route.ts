import '@/lib/opencals';
import { NextResponse } from 'next/server';
import { getClinicians } from '@/lib/server-data';

/** Public-safe clinician cards (see lib/clinicians.ts). */
export async function GET() {
	return NextResponse.json(await getClinicians());
}
