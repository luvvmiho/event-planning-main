'use client';

import { VenueCard } from '@/components/venues/venue-card';
import type { VenueListItem } from '@/lib/types';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Autoplay, Grid, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

type Props = {
	venues: VenueListItem[];
	totalCount: number;
};

export const LatestVenuesSwiper = ({ venues, totalCount }: Props) => {
	return (
		<section className='bg-secondary/30 py-12'>
			<div className='container mx-auto px-4'>
				<div className='mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
					<div>
						<div className='flex items-center gap-3'>
							<h2 className='text-xl font-semibold text-foreground'>Шинээр нэмэгдсэн</h2>
						</div>
						<p className='mt-1 text-sm text-muted-foreground'>
							Сүүлд нэмэгдсэн үйлчилгээнүүд
						</p>
					</div>
					<Link
						href='/venues?sort=newest'
						className='flex items-center gap-1 text-sm font-medium text-accent hover:underline'
					>
						Бүгдийг үзэх
						<ArrowRight className='h-4 w-4' />
					</Link>
				</div>

				<Swiper
					modules={[Navigation, Autoplay, Grid]}
					direction='horizontal'
					spaceBetween={16}
					slidesPerView={1.08}
					autoplay={{
						delay: 5000,
						disableOnInteraction: false,
						pauseOnMouseEnter: true,
					}}
					loop={false}
					breakpoints={{
						480: { slidesPerView: 1.35, spaceBetween: 16 },
						640: { slidesPerView: 2, spaceBetween: 16 },
						1024: { slidesPerView: 3, spaceBetween: 20 },
						1280: { slidesPerView: 4, spaceBetween: 20 },
					}}
					navigation={{
						prevEl: `.swiper-button-prev`,
						nextEl: `.swiper-button-next`,
					}}
					initialSlide={0}
					className='latest-venues-swiper pb-10!'
				>
					{venues.map((venue) => (
						<SwiperSlide key={venue.id} className='h-auto!'>
							<VenueCard
								name={venue.name}
								slug={venue.slug}
								imageUrl={venue.image_url}
								locationLine={venue.location}
								district={venue.district ?? ''}
								pricePerPerson={venue.price_per_person}
								rating={Number(venue.rating)}
								isFeatured={venue.is_featured}
								isNew={venue.is_new}
								showCta={false}
								className='h-full'
								createdAt={venue.created_at}
							/>
						</SwiperSlide>
					))}
				</Swiper>
			</div>
		</section>
	);
};
