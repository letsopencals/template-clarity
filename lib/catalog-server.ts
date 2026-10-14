import { cache } from 'react';
import { getCollections, getDepartmentIndex, getProducts, getStoreSettings } from '@/lib/server-data';
import { toDepartments, toVisits, type Department, type Visit } from '@/lib/catalog';

export interface Catalog {
	visits: Visit[];
	departments: Department[];
	currency: string;
}

/**
 * Server-only: the discovery catalogue for RSC pages (home, Care Finder,
 * departments, visits & fees, video visits). Request-deduped. Never import
 * from a 'use client' file.
 */
export const getCatalog = cache(async (): Promise<Catalog> => {
	const [products, collections, index, settings] = await Promise.all([getProducts(), getCollections(), getDepartmentIndex(), getStoreSettings()]);
	const visits = toVisits(products, index);
	return { visits, departments: toDepartments(collections, visits), currency: settings?.currency ?? 'USD' };
});
