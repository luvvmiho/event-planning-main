import { ServiceBookingSidebar } from '@/components/services/service-booking-sidebar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { VenueSectionHeading } from '@/components/venues/venue-section-heading'
import { serviceKindLabelMn } from '@/lib/service-labels'
import type { ServiceCatalogDetail } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ChevronLeft, MapPin, Tag } from 'lucide-react'
import { Playfair_Display } from 'next/font/google'
import Link from 'next/link'

const displaySerif = Playfair_Display({ subsets: ['latin'] })

const placeholderImage = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80'

const formatMnt = (n: number) => new Intl.NumberFormat('mn-MN').format(n) + '₮'

type ServiceDetailExperienceProps = {
	service: ServiceCatalogDetail
}

export const ServiceDetailExperience = ({ service }: ServiceDetailExperienceProps) => {
	const images =
		service.images.length > 0
			? service.images
			: service.image_url
				? [service.image_url]
				: [placeholderImage]

	const displayImages = images.filter(Boolean)
	const main = displayImages[0] ?? placeholderImage
	const side = displayImages.slice(1, 3)
	const kindLabel = serviceKindLabelMn(service.kind)

	return (
		<>
			<div className='border-b border-border bg-secondary/30'>
				<div className='container mx-auto px-4 py-3'>
					<Button variant='ghost' size='sm' className='gap-1 text-muted-foreground hover:text-foreground' asChild>
						<Link href='/services'>
							<ChevronLeft className='size-4' aria-hidden />
							Бүх үйлчилгээ
						</Link>
					</Button>
				</div>
			</div>

			<div className='container mx-auto px-4 py-8'>
				<div className='grid gap-10 lg:grid-cols-3'>
					<div className='min-w-0 space-y-8 lg:col-span-2'>
						<div>
							<div className='mb-3 flex flex-wrap items-center gap-2'>
								<Badge variant='secondary' className='rounded-full text-xs'>
									{kindLabel}
								</Badge>
								<Badge variant='outline' className='rounded-full border-accent/30 text-xs text-accent'>
									{formatMnt(service.price_flat)}
								</Badge>
							</div>
							<h1
								className={cn(
									'text-3xl font-medium tracking-tight text-foreground md:text-4xl lg:text-5xl',
									displaySerif.className,
								)}
							>
								{service.name}
							</h1>
							{service.short_description ? (
								<p className='mt-3 max-w-2xl text-lg text-muted-foreground'>
									{service.short_description}
								</p>
							) : null}
							{service.location ? (
								<p className='mt-3 flex items-center gap-2 text-sm text-muted-foreground'>
									<MapPin className='size-4 shrink-0 text-accent' aria-hidden />
									{service.location}
								</p>
							) : null}
						</div>

						{displayImages.length === 1 ? (
							<div className='relative aspect-[21/9] min-h-[220px] overflow-hidden rounded-2xl bg-muted md:min-h-[320px]'>
								<img src={main} alt='' className='size-full object-cover' />
							</div>
						) : displayImages.length === 2 ? (
							<div className='grid gap-2 sm:gap-3 md:grid-cols-2'>
								{displayImages.map((src, i) => (
									<div
										key={i}
										className='relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted md:min-h-[240px]'
									>
										<img src={src} alt='' className='size-full object-cover' />
									</div>
								))}
							</div>
						) : (
							<div className='grid gap-2 sm:gap-3 md:grid-cols-3 md:grid-rows-2'>
								<div className='relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted md:col-span-2 md:row-span-2 md:aspect-auto md:min-h-[280px]'>
									<img src={main} alt='' className='size-full object-cover' />
								</div>
								{side.map((src, i) => (
									<div
										key={i}
										className='relative aspect-video overflow-hidden rounded-2xl bg-muted md:min-h-[136px]'
									>
										<img src={src} alt='' className='size-full object-cover' />
									</div>
								))}
							</div>
						)}

						<div className='rounded-2xl bg-secondary/60 px-5 py-6 md:px-8'>
							<VenueSectionHeading title='Үйлчилгээний мэдээлэл' withAccent={false} className='mb-5' />
							<div className='grid gap-6 sm:grid-cols-2'>
								<div className='flex gap-3'>
									<Tag className='mt-0.5 size-5 shrink-0 text-accent' aria-hidden />
									<div>
										<p className='text-sm font-semibold text-foreground'>Төрөл</p>
										<p className='mt-0.5 text-sm text-muted-foreground'>{kindLabel}</p>
									</div>
								</div>
								<div className='flex gap-3'>
									<span className='mt-0.5 text-lg font-semibold text-accent tabular-nums' aria-hidden>
										₮
									</span>
									<div>
										<p className='text-sm font-semibold text-foreground'>Үнэ</p>
										<p className='mt-0.5 text-sm text-muted-foreground'>
											{formatMnt(service.price_flat)} / ширхэг · нийт үнэ
										</p>
									</div>
								</div>
								{service.location ? (
									<div className='flex gap-3 sm:col-span-2'>
										<MapPin className='mt-0.5 size-5 shrink-0 text-accent' aria-hidden />
										<div>
											<p className='text-sm font-semibold text-foreground'>Байршил</p>
											<p className='mt-0.5 text-sm text-muted-foreground'>{service.location}</p>
										</div>
									</div>
								) : null}
							</div>
						</div>

						{service.description ? (
							<section aria-labelledby='service-description-heading'>
								<VenueSectionHeading id='service-description-heading' title='Дэлгэрэнгүй мэдээлэл' />
								<p className='whitespace-pre-wrap leading-relaxed text-muted-foreground'>
									{service.description}
								</p>
							</section>
						) : null}

						<div className='border-t border-border pt-6'>
							<Button variant='outline' size='sm' asChild>
								<Link href={`/services?kind=${service.kind}`}>
									Ижил төрлийн үйлчилгээ үзэх
								</Link>
							</Button>
						</div>
					</div>

					<div className='lg:col-span-1'>
						<ServiceBookingSidebar service={service} />
					</div>
				</div>
			</div>
		</>
	)
}
