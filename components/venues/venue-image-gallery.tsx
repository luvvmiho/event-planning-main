'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface VenueImageGalleryProps {
	images: string[];
	name: string;
}

export function VenueImageGallery({ images, name }: VenueImageGalleryProps) {
	const [currentIndex, setCurrentIndex] = useState(0);

	const displayImages =
		images.length > 0
			? images
			: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800'];

	const goToPrevious = () => {
		setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
	};

	const goToNext = () => {
		setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
	};

	return (
		<div className='space-y-4'>
			<div className='relative aspect-video overflow-hidden rounded-xl lg:aspect-21/9'>
				<img
					src={displayImages[currentIndex]}
					alt={`${name} - Image ${currentIndex + 1}`}
					className='size-full object-cover'
				/>

				{displayImages.length > 1 && (
					<>
						<Button
							variant='outline'
							size='icon'
							className='absolute top-1/2 left-4 h-10 w-10 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white'
							onClick={goToPrevious}
						>
							<ChevronLeft className='h-5 w-5' />
							<span className='sr-only'>Previous image</span>
						</Button>

						<Button
							variant='outline'
							size='icon'
							className='absolute top-1/2 right-4 h-10 w-10 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white'
							onClick={goToNext}
						>
							<ChevronRight className='h-5 w-5' />
							<span className='sr-only'>Next image</span>
						</Button>

						<div className='absolute right-4 bottom-4 rounded-full bg-black/60 px-3 py-1 text-sm text-white'>
							{currentIndex + 1} / {displayImages.length}
						</div>
					</>
				)}
			</div>

			{displayImages.length > 1 && (
				<div className='flex gap-2 overflow-x-auto p-1 pb-2'>
					{displayImages.map((image, index) => (
						<button
							key={index}
							onClick={() => setCurrentIndex(index)}
							className={cn(
								'relative h-20 w-28 shrink-0 overflow-hidden rounded-lg transition-all',
								currentIndex === index
									? 'ring-2 ring-accent ring-offset-2'
									: 'opacity-70 hover:opacity-100',
							)}
						>
							<img
								src={image}
								alt={`${name} thumbnail ${index + 1}`}
								className='size-full object-cover'
							/>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
