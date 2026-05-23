'use client'

import { Badge } from '@/components/ui/badge'
import { VenueSectionHeading } from '@/components/venues/venue-section-heading'
import {
	formatCapacityAmenity,
	parseAmenityDisplay,
	type AmenityDisplay,
} from '@/lib/venue-amenity-display'
import { venueCategoryShortLabel } from '@/lib/venue-labels'
import { EVENT_CARD_CATEGORY, EVENT_SLUG_LABELS } from '@/lib/venue-search-params'
import { cn } from '@/lib/utils'
import { Globe, Mail, Phone } from 'lucide-react'

export type VenueDetailInfoPart = 'description' | 'advantages' | 'contact'

type VenueDetailInfoProps = {
	venue: {
		id: string
		name: string
		description: string | null
		short_description: string | null
		category: string
		location: string
		address: string | null
		capacity_min: number
		capacity_max: number
		amenities: string[] | null
		contact_phone: string | null
		contact_email: string | null
		website: string | null
		categories?: { id: string; slug: string; name: string } | null
	}
	part?: VenueDetailInfoPart
}

const DEFAULT_SUITABLE_EVENTS = [
	'Хурим',
	'Ойн баяр',
	'Үсний найр',
	'Төрсөн өдөр',
	'Буяны ажил',
]

const getSuitableEventLabels = (venueCategory: string, categoryName?: string | null): string[] => {
	const fromCategory = Object.entries(EVENT_CARD_CATEGORY)
		.filter(([, cat]) => cat === venueCategory)
		.map(([slug]) => EVENT_SLUG_LABELS[slug]?.replace(/\sнайр$/, '') ?? slug)
		.filter(Boolean)

	const labels = [...new Set([...(categoryName ? [categoryName] : []), ...fromCategory])]

	if (labels.length >= 2) return labels.slice(0, 6)
	return DEFAULT_SUITABLE_EVENTS
}

const AmenityCard = ({ item }: { item: AmenityDisplay }) => {
	const Icon = item.icon
	return (
		<div className='flex flex-col items-start gap-2'>
			<Icon className='size-6 text-accent' aria-hidden />
			<div>
				<p className='text-sm font-semibold text-foreground'>{item.title}</p>
				<p className='mt-0.5 text-xs leading-relaxed text-muted-foreground'>
					{item.description}
				</p>
			</div>
		</div>
	)
}

export const VenueDetailInfo = ({ venue, part = 'description' }: VenueDetailInfoProps) => {
	const suitableEvents = getSuitableEventLabels(
		venue.category,
		venue.categories?.name ?? venueCategoryShortLabel(venue.category),
	)

	const amenityItems: AmenityDisplay[] = [
		formatCapacityAmenity(venue.capacity_min, venue.capacity_max),
		...(venue.amenities ?? []).map(parseAmenityDisplay),
	]

	const hasContact =
		Boolean(venue.contact_phone) ||
		Boolean(venue.contact_email) ||
		Boolean(venue.website)

	if (part === 'description') {
		return (
			<div>
				<VenueSectionHeading title='Дэлгэрэнгүй мэдээлэл' />
				<p className='leading-relaxed text-muted-foreground'>
					{venue.description || venue.short_description || 'Тайлбар бүртгэгдээгүй байна.'}
				</p>
			</div>
		)
	}

	if (part === 'advantages') {
		return (
			<div className='flex flex-col gap-10'>
				<div>
					<VenueSectionHeading title='Зохион байгуулах боломжтой' withAccent={false} />
					<div className='flex flex-wrap gap-2'>
						{suitableEvents.map((label) => (
							<Badge
								key={label}
								variant='outline'
								className='rounded-md border-border bg-background px-3 py-1.5 text-xs font-normal text-foreground'
							>
								{label}
							</Badge>
						))}
					</div>
				</div>

				<div className='rounded-2xl bg-secondary/60 px-5 py-6 md:px-8 md:py-8'>
					<VenueSectionHeading title='Боломжит давуу талууд' withAccent={false} className='mb-6' />
					<div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
						{amenityItems.map((item, idx) => (
							<AmenityCard key={`${item.title}-${idx}`} item={item} />
						))}
					</div>
				</div>
			</div>
		)
	}

	if (!hasContact) return null

	return (
		<div className={cn('border-t border-border pt-6')}>
			<p className='mb-3 text-sm font-medium text-foreground'>Холбоо барих</p>
			<div className='flex flex-col gap-3'>
				{venue.contact_phone ? (
					<div className='flex items-center gap-3 text-sm'>
						<Phone className='size-4 shrink-0 text-muted-foreground' aria-hidden />
						<a href={`tel:${venue.contact_phone}`} className='text-accent hover:underline'>
							{venue.contact_phone}
						</a>
					</div>
				) : null}
				{venue.contact_email ? (
					<div className='flex items-center gap-3 text-sm'>
						<Mail className='size-4 shrink-0 text-muted-foreground' aria-hidden />
						<a href={`mailto:${venue.contact_email}`} className='text-accent hover:underline'>
							{venue.contact_email}
						</a>
					</div>
				) : null}
				{venue.website ? (
					<div className='flex items-center gap-3 text-sm'>
						<Globe className='size-4 shrink-0 text-muted-foreground' aria-hidden />
						<a
							href={venue.website}
							target='_blank'
							rel='noopener noreferrer'
							className='text-accent hover:underline'
						>
							{venue.website}
						</a>
					</div>
				) : null}
			</div>
		</div>
	)
}
