import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { Skeleton } from '@/components/ui/skeleton';
import { VenueFilters } from '@/components/venues/venue-filters';
import { VenueList } from '@/components/venues/venue-list';
import { VenuePagination } from '@/components/venues/venue-pagination';
import { getVenues as fetchVenues, getCategoryBySlug } from '@/lib/api';
import { getCatalogCategories } from '@/lib/catalog-categories';
import {
	EVENT_CARD_CATEGORY,
	EVENT_TYPE_DEFAULT_CATEGORY,
	isCategoryIdParam,
	isIsoDateParam,
	isVenueDbCategory,
	loadVenueSearchParams,
	type VenueDbCategory,
} from '@/lib/venue-search-params';
import type { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';

const ITEMS_PER_PAGE = 9;

async function getVenues(p: Awaited<ReturnType<typeof loadVenueSearchParams>>) {
	const page = p.page;

	let categoryId: string | undefined;
	let categorySlug: string | undefined;

	if (isCategoryIdParam(p.categoryId)) {
		categoryId = p.categoryId;
	} else if (p.event) {
		const fromEvent =
			EVENT_TYPE_DEFAULT_CATEGORY[p.event as keyof typeof EVENT_TYPE_DEFAULT_CATEGORY] ??
			EVENT_CARD_CATEGORY[p.event as keyof typeof EVENT_CARD_CATEGORY];
		if (isVenueDbCategory(fromEvent)) {
			categorySlug = fromEvent as VenueDbCategory;
			try {
				const { data } = await getCategoryBySlug(categorySlug);
				categoryId = data.id;
				categorySlug = undefined;
			} catch {
			}
		}
	}

	try {
		const { data: venues, meta } = await fetchVenues({
			categoryId,
			category: categorySlug,
			district: p.district ?? undefined,
			capacity: p.capacity ?? undefined,
			minPrice: p.minPrice ?? undefined,
			maxPrice: p.maxPrice ?? undefined,
			sort: (p.sort as 'rating' | 'newest' | 'price_asc' | 'price_desc' | 'name') ?? 'rating',
			page,
			limit: ITEMS_PER_PAGE,
		});

		return {
			venues,
			totalCount: meta.total,
			totalPages: meta.totalPages,
			currentPage: page,
		};
	} catch (err) {
		console.error('Error fetching venues:', err);
		return { venues: [], totalCount: 0, totalPages: 0, currentPage: page };
	}
}

function VenueListSkeleton() {
	return (
		<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
			{Array.from({ length: 6 }).map((_, i) => (
				<div key={i} className='flex flex-col gap-4'>
					<Skeleton className='aspect-4/3 rounded-lg' />
					<Skeleton className='h-6 w-3/4' />
					<Skeleton className='h-4 w-1/2' />
					<Skeleton className='h-10 w-full' />
				</div>
			))}
		</div>
	);
}

export default async function VenuesPage({
	searchParams,
}: {
	searchParams: Promise<SearchParams>;
}) {
	const p = await loadVenueSearchParams(searchParams);
	const [{ venues, totalCount, totalPages, currentPage }, categoryCatalog] = await Promise.all([
		getVenues(p),
		getCatalogCategories(),
	]);
	const hasNarrowingFilter = Boolean(
		p.district ||
		isCategoryIdParam(p.categoryId) ||
		p.event ||
		p.minPrice != null ||
		p.maxPrice != null ||
		p.capacity != null ||
		isIsoDateParam(p.dateFrom) ||
		isIsoDateParam(p.dateTo),
	);

	return (
		<div className='flex min-h-screen flex-col'>
			<Header />

			<main className='flex-1'>
				<div className='container mx-auto px-4 py-8'>
					<VenueFilters totalCount={totalCount} categoryCatalog={categoryCatalog} />

					<div className='mt-8'>
						<Suspense fallback={<VenueListSkeleton />}>
							<VenueList
								venues={venues}
								emptyHint={
									hasNarrowingFilter
										? {
												title: 'Шүүлтүүрт тохирох танхим олдсонгүй',
												description: 'Өөр ангилал эсвэл байршил сонгон дахин хайна уу.',
											}
										: undefined
								}
							/>
						</Suspense>
					</div>

					<VenuePagination currentPage={currentPage || 1} totalPages={totalPages} />
				</div>
			</main>

			<Footer />
		</div>
	);
}
