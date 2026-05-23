import { VenueCard } from '@/components/venues/venue-card';
import { getVenues } from '@/lib/api';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

async function getRecommendedVenues() {
	try {
		const { data } = await getVenues({ sort: 'rating', limit: 6 });
		return data;
	} catch (err) {
		console.error('Error fetching recommended venues:', err);
		return [];
	}
}

export async function RecommendedListings() {
	const venues = await getRecommendedVenues();

	if (venues.length === 0) {
		return null;
	}

	return (
		<section className='py-12'>
			<div className='container mx-auto px-4'>
				<div className='mb-8 flex items-center justify-between'>
					<h2 className='text-xl font-semibold text-foreground'>Санал болгох үйлчилгээ</h2>
					<Link
						href='/venues'
						className='flex items-center gap-1 text-sm font-medium text-accent hover:underline'
					>
						Бүгдийг үзэх
						<ArrowRight className='h-4 w-4' />
					</Link>
				</div>

				<div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
					{venues.map((venue) => (
						<VenueCard
							key={venue.id}
							name={venue.name}
							slug={venue.slug}
							imageUrl={venue.image_url}
							locationLine={venue.location}
							district={venue.district ?? ''}
							pricePerPerson={venue.price_per_person}
							rating={Number(venue.rating)}
							isFeatured={venue.is_featured}
							isNew={venue.is_new}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
