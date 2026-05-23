'use client';

import { VenueListItem } from '@/lib/types';
import { VenueCard } from './venue-card';

interface VenueListProps {
	venues: VenueListItem[];
	emptyHint?: { title: string; description?: string };
}

export function VenueList({ venues, emptyHint }: VenueListProps) {
	if (venues.length === 0) {
		const title = emptyHint?.title ?? 'Хайлтын үр дүн олдсонгүй';
		const description = emptyHint?.description ?? 'Өөр шүүлтүүр ашиглан дахин хайна уу';

		return (
			<div className='flex flex-col items-center justify-center py-16 text-center'>
				<p className='text-lg text-muted-foreground'>{title}</p>
				<p className='mt-2 text-sm text-muted-foreground'>{description}</p>
			</div>
		);
	}

	return (
		<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
			{venues.map((venue) => (
				<VenueCard
					key={venue.id}
					name={venue.name}
					slug={venue.slug}
					locationLine={venue.location}
					district={venue.district ?? ''}
					imageUrl={venue.image_url}
					pricePerPerson={venue.price_per_person}
					rating={Number(venue.rating)}
					isFeatured={venue.is_featured}
					isNew={venue.is_new}
				/>
			))}
		</div>
	);
}
