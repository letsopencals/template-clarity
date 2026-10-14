/** ISO 3166-1 alpha-2 country options built from Intl.DisplayNames (no static list to keep in sync). */
export interface CountryOption {
	code: string;
	name: string;
}

// Region codes DisplayNames knows that aren't countries a patient lives in.
const NOT_COUNTRIES = new Set(['EU', 'EZ', 'UN', 'QO', 'ZZ', 'XA', 'XB']);
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

let cached: CountryOption[] | null = null;

export function countryOptions(): CountryOption[] {
	if (cached) return cached;
	let names: Intl.DisplayNames | null = null;
	try {
		names = new Intl.DisplayNames(['en'], { type: 'region' });
	} catch {
		names = null;
	}
	if (!names) {
		cached = [{ code: 'US', name: 'United States' }];
		return cached;
	}
	const out: CountryOption[] = [];
	for (const a of LETTERS) {
		for (const b of LETTERS) {
			const code = a + b;
			if (NOT_COUNTRIES.has(code)) continue;
			const name = names.of(code);
			if (name && name !== code) out.push({ code, name });
		}
	}
	out.sort((x, y) => x.name.localeCompare(y.name));
	cached = out;
	return cached;
}
