'use client';

import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { fetcher } from '@/lib/fetcher';
import { forPerson, peopleOf, type CarePerson } from '@/components/account/care-utils';
import type { CareRecord, CareVisit } from '@/components/account/care-types';

export const CARE_RECORD_KEY = '/api/account/care-record';
export const PERSON_PARAM = 'for';

const SWR_OPTIONS = { revalidateOnFocus: false, keepPreviousData: true } as const;

/** The whole care record (shared SWR cache across the shell, overview and visits). */
export function useCareRecord() {
	const { data, error, isLoading, mutate } = useSWR<CareRecord>(CARE_RECORD_KEY, fetcher, SWR_OPTIONS);
	return { record: data ?? null, visits: data?.visits ?? [], error, isLoading, mutate };
}

/** `?for=<person>` filters the whole portal (family chips). Null = everyone. */
export function usePersonFilter() {
	const params = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();
	const person = params.get(PERSON_PARAM);

	const setPerson = useCallback(
		(key: string | null) => {
			const next = new URLSearchParams(params.toString());
			if (key) next.set(PERSON_PARAM, key);
			else next.delete(PERSON_PARAM);
			const qs = next.toString();
			router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
		},
		[params, router, pathname],
	);

	/** Keep the family filter when moving between portal pages. */
	const hrefWith = useCallback((href: string) => (person ? `${href}${href.includes('?') ? '&' : '?'}${PERSON_PARAM}=${encodeURIComponent(person)}` : href), [person]);

	return { person, setPerson, hrefWith };
}

/** Visits narrowed to the chosen person, plus the family list for chips. */
export function useFilteredCare(): {
	visits: CareVisit[];
	all: CareVisit[];
	people: CarePerson[];
	person: string | null;
	isLoading: boolean;
	error: unknown;
	truncated: boolean;
} {
	const { visits, record, isLoading, error } = useCareRecord();
	const { person } = usePersonFilter();
	const people = useMemo(() => peopleOf(visits), [visits]);
	const known = person && people.some((p) => p.key === person) ? person : null;
	const filtered = useMemo(() => forPerson(visits, known), [visits, known]);
	return { visits: filtered, all: visits, people, person: known, isLoading: isLoading && !record, error, truncated: !!record?.truncated };
}
