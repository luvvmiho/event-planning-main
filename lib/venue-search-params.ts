import {
	createLoader,
	createSerializer,
	parseAsInteger,
	parseAsString,
	parseAsStringLiteral,
} from 'nuqs/server';

export const VENUE_SORT_VALUES = ['rating', 'price_asc', 'price_desc', 'newest', 'name'] as const;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isCategoryIdParam(value: string | null | undefined): value is string {
	return value != null && UUID_RE.test(value);
}

export const VENUE_DB_CATEGORIES = [
	'venue',
	'restaurant',
	'hotel',
	'cafe',
	'hall',
	'outdoor',
] as const;

export type VenueDbCategory = (typeof VENUE_DB_CATEGORIES)[number];

export const venueSearchParamsParsers = {
	page: parseAsInteger.withDefault(1),
	sort: parseAsStringLiteral(VENUE_SORT_VALUES).withDefault('rating'),
	district: parseAsString,

	categoryId: parseAsString,
	event: parseAsString,
	minPrice: parseAsInteger,
	maxPrice: parseAsInteger,
	capacity: parseAsInteger,

	dateFrom: parseAsString,
	dateTo: parseAsString,
};

export const loadVenueSearchParams = createLoader(venueSearchParamsParsers);

export const serializeVenueSearchParams = createSerializer(venueSearchParamsParsers);

export function districtSlugToIlikePattern(slug: string): string | null {
	const patterns: Record<string, string> = {
		sukhbaatar: '%Сүхбаатар%',
		bayanzurkh: '%Баянзүрх%',
		chingeltei: '%Чингэлтэй%',
		'khan-uul': '%Хан-Уул%',
		bayangol: '%Баянгол%',
		songinokhairkhan: '%Сонгинохайрхан%',
		baganuur: '%Багануур%',
		nalaikh: '%Налайх%',
		bagakhangai: '%Багахангай%',
	};
	return patterns[slug] ?? null;
}

export const DISTRICT_SLUG_LABELS: Record<string, string> = {
	sukhbaatar: 'Сүхбаатар дүүрэг',
	bayanzurkh: 'Баянзүрх дүүрэг',
	chingeltei: 'Чингэлтэй дүүрэг',
	'khan-uul': 'Хан-Уул дүүрэг',
	bayangol: 'Баянгол дүүрэг',
	songinokhairkhan: 'Сонгинохайрхан дүүрэг',
	baganuur: 'Багануур дүүрэг',
	nalaikh: 'Налайх дүүрэг',
	bagakhangai: 'Багахангай дүүрэг',
};

export const EVENT_TYPE_DEFAULT_CATEGORY: Record<string, VenueDbCategory> = {
	wedding: 'hall',
	birthday: 'venue',
	anniversary: 'restaurant',
	corporate: 'hall',
};

export const EVENT_SLUG_LABELS: Record<string, string> = {
	wedding: 'Хурим найр',
	birthday: 'Төрсөн өдөр',
	anniversary: 'Хонхны баяр',
	corporate: 'Байгууллагын',
	graduation: 'Хонхны баяр',
	reunion: 'Ангийн уулзалт',
	'new-year': 'Шинэ жил',
};

export const EVENT_CARD_CATEGORY: Record<string, VenueDbCategory | undefined> = {
	wedding: 'hall',
	birthday: 'venue',
	graduation: 'hall',
	reunion: 'restaurant',
	'new-year': 'hotel',
};

export function isVenueDbCategory(value: string | null | undefined): value is VenueDbCategory {
	return value != null && (VENUE_DB_CATEGORIES as readonly string[]).includes(value);
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDateParam(value: string | null | undefined): value is string {
	return (
		value != null && ISO_DATE_RE.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00`))
	);
}

export function heroGuestsRangeToCapacity(range: string): number | null {
	const map: Record<string, number> = {
		'10-30': 30,
		'30-50': 50,
		'50-100': 100,
		'100-200': 200,
		'200+': 350,
	};
	return map[range] ?? null;
}

const CAPACITY_BY_GUEST_SLUG = {
	'10-30': 30,
	'30-50': 50,
	'50-100': 100,
	'100-200': 200,
	'200+': 350,
} as const satisfies Record<string, number>;

export function capacityToGuestSlug(
	capacity: number | null | undefined,
): keyof typeof CAPACITY_BY_GUEST_SLUG | null {
	if (capacity == null) return null;
	const entries = Object.entries(CAPACITY_BY_GUEST_SLUG) as [
		keyof typeof CAPACITY_BY_GUEST_SLUG,
		number,
	][];
	const match = entries.find(([, n]) => n === capacity);
	return match ? match[0] : null;
}

export type GuestSlug = keyof typeof CAPACITY_BY_GUEST_SLUG;

export const GUEST_SLUG_LABELS: Record<GuestSlug, string> = {
	'10-30': '10-30 хүн',
	'30-50': '30-50 хүн',
	'50-100': '50-100 хүн',
	'100-200': '100-200 хүн',
	'200+': '200+ хүн',
};

export const VENUE_BUDGET_OPTIONS = [
	{
		slug: '',
		label: 'Бүх түвшин',
		minPrice: null as number | null,
		maxPrice: null as number | null,
	},
	{
		slug: 'lte30k',
		label: '30k хүртэл',
		minPrice: null,
		maxPrice: 30_000,
	},
	{
		slug: '30k-100k',
		label: '30к-100к',
		minPrice: 30_000,
		maxPrice: 100_000,
	},
	{
		slug: '100k-200k',
		label: '100к-200к',
		minPrice: 100_000,
		maxPrice: 200_000,
	},
	{
		slug: 'gte200k',
		label: '200k дээш',
		minPrice: 200_000,
		maxPrice: null,
	},
] as const;

export type VenueBudgetSlug = (typeof VENUE_BUDGET_OPTIONS)[number]['slug'];

export function matchVenueBudgetSlug(
	minPrice: number | null | undefined,
	maxPrice: number | null | undefined,
): VenueBudgetSlug {
	const m = minPrice ?? null;
	const x = maxPrice ?? null;
	const row = VENUE_BUDGET_OPTIONS.find((o) => o.minPrice === m && o.maxPrice === x);
	return (row?.slug ?? '') as VenueBudgetSlug;
}
