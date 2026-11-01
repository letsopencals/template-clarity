'use client';

import useSWR from 'swr';
import type { SelfServiceProfileResponse } from '@opencals/storefront-sdk';
import { fetcher } from '@/lib/fetcher';

export const PROFILE_KEY = '/api/account/profile';

/** The public subset `/api/account/profile` returns. `isPasswordSet` is false for code-only accounts. */
export type CareProfile = Pick<SelfServiceProfileResponse, 'id' | 'firstName' | 'lastName' | 'email' | 'phone'> &
	Partial<Pick<SelfServiceProfileResponse, 'isPasswordSet'>>;

const SWR_OPTIONS = { revalidateOnFocus: false } as const;

/** The signed-in patient's own profile (name for the greeting, settings form). */
export function useProfile() {
	const { data, error, isLoading, mutate } = useSWR<CareProfile>(PROFILE_KEY, fetcher, SWR_OPTIONS);
	return { profile: data ?? null, error, isLoading, mutate };
}
