'use client';

import Link from 'next/link';
import { FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';

export type EventCategorySlide = {
	id: string;
	name: string;
	href: string;
	imageUrl: string;
};

type Props = {
	items: EventCategorySlide[];
};

export const EventCategoriesSwiper = ({ items }: Props) => {
	return (
		<section className='py-12'>
			<div className='container mx-auto px-4'>
				<h2 className='mb-8 text-xl font-semibold text-foreground'>
					Боломжит үйлчилгээний ангилал
				</h2>

				<Swiper
					modules={[FreeMode]}
					spaceBetween={24}
					slidesPerView={2.15}
					watchOverflow
					breakpoints={{
						480: { slidesPerView: 2.8, spaceBetween: 24 },
						640: { slidesPerView: 3.5, spaceBetween: 24 },
						768: { slidesPerView: 4.2, spaceBetween: 24 },
						1024: { slidesPerView: 5.5, spaceBetween: 28 },
						1280: { slidesPerView: 6.5, spaceBetween: 28 },
					}}
					className='event-categories-swiper pb-10!'
				>
					{items.map(({ id, name, href, imageUrl }) => (
						<SwiperSlide key={id} className='h-auto!'>
							<Link
								href={href}
								aria-label={name}
								className='group flex flex-col items-center gap-3'
							>
								<div className='relative mx-auto h-40 w-40 overflow-hidden rounded-full border-2 border-transparent transition-all group-hover:border-accent md:h-46 md:w-46'>
									<img
										src={imageUrl}
										alt=''
										className='size-full object-cover transition-transform group-hover:scale-105'
									/>
								</div>
								<span className='line-clamp-2 text-center text-sm font-medium text-foreground'>
									{name}
								</span>
							</Link>
						</SwiperSlide>
					))}
				</Swiper>
			</div>
		</section>
	);
};
