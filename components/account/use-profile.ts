'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export const PROFILE_KEY = '/api/account/profile';

export interface CareProfile {
	id: string;
	firstName: string | null;
	lastName: string | null;
	email: string | null;
	phone: string | null;
	/** False for accounts that only ever signed in with an emailed code. */
	isPasswordSet?: boolean;
}

const SWR_OPTIONS = { revalidateOnFocus: false } as const;

/** The signed-in patient's own profile (name for the greeting, settings form). */
export function useProfile() {
	const { data, error, isLoading, mutate } = useSWR<CareProfile>(PROFILE_KEY, fetcher, SWR_OPTIONS);
	return { profile: data ?? null, error, isLoading, mutate };
}
