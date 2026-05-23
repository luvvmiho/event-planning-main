import { AdditionalServices } from '@/components/home/additional-services';
import { EventCategories } from '@/components/home/event-categories';
import { HeroSection } from '@/components/home/hero-section';
import { LatestVenues } from '@/components/home/latest-venues';
import { RecommendedListings } from '@/components/home/recommended-listings';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { Skeleton } from '@/components/ui/skeleton';
import { getCatalogCategories } from '@/lib/catalog-categories';
import { Suspense } from 'react';

function VenuesSkeleton() {
	return (
		<div className='container mx-auto px-4 py-12'>
			<Skeleton className='mb-8 h-8 w-48' />
			<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
				{Array.from({ length: 3 }).map((_, i) => (
					<div key={i} className='flex flex-col gap-4'>
						<Skeleton className='aspect-4/3 rounded-lg' />
						<Skeleton className='h-5 w-3/4' />
						<Skeleton className='h-4 w-1/2' />
					</div>
				))}
			</div>
		</div>
	);
}

function EventCategoriesSkeleton() {
	return (
		<div className='container mx-auto px-4 py-12'>
			<Skeleton className='mb-8 h-7 w-64' />
			<div className='flex gap-6 overflow-hidden pb-4'>
				{Array.from({ length: 5 }).map((_, i) => (
					<div key={i} className='flex shrink-0 flex-col items-center gap-3'>
						<Skeleton className='size-32 rounded-full md:size-40' />
						<Skeleton className='h-4 w-20' />
					</div>
				))}
			</div>
		</div>
	);
}

export default async function HomePage() {
	const categoryOptions = await getCatalogCategories();

	return (
		<div className='flex min-h-screen flex-col'>
			<Header />
			<main className='flex flex-1 flex-col'>
				<HeroSection categoryOptions={categoryOptions} />
				<Suspense fallback={<EventCategoriesSkeleton />}>
					<EventCategories />
				</Suspense>
				<AdditionalServices />
				<Suspense fallback={<VenuesSkeleton />}>
					<LatestVenues />
				</Suspense>
				<Suspense fallback={<VenuesSkeleton />}>
					<RecommendedListings />
				</Suspense>
			</main>
			<Footer />
		</div>
	);
}
