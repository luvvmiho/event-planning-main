'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { DISTRICT_SLUG_LABELS } from '@/lib/venue-search-params'
import { ArrowUpRight, MapPin, Star } from 'lucide-react'
import Link from 'next/link'
import type { KeyboardEvent, ReactNode } from 'react'

export const fitPlanGuestCount = (
	planGuestCount: number | null | undefined,
	capacityMin: number,
	capacityMax: number,
) => {
	const base = Math.max(1, planGuestCount ?? capacityMin)
	return Math.min(Math.max(base, capacityMin), capacityMax)
}

export const venueFitsPlanCapacity = (
	planGuestCount: number | null | undefined,
	capacityMin: number,
	capacityMax: number,
) => {
	if (planGuestCount == null || planGuestCount < 1) return false
	return planGuestCount >= capacityMin && planGuestCount <= capacityMax
}

export const planVenueEstimate = (planGuestCount: number, pricePerPerson: number) =>
	planGuestCount * pricePerPerson

export const venueFitsPlanBudget = (
	planGuestCount: number | null | undefined,
	pricePerPerson: number,
	planBudget: number,
) => {
	if (planGuestCount == null || planGuestCount < 1 || planBudget < 1) return false
	return planVenueEstimate(planGuestCount, pricePerPerson) <= planBudget
}

export const venueFitsEventPlan = (
	planGuestCount: number | null | undefined,
	planBudget: number,
	capacityMin: number,
	capacityMax: number,
	pricePerPerson: number,
) =>
	venueFitsPlanCapacity(planGuestCount, capacityMin, capacityMax) &&
	venueFitsPlanBudget(planGuestCount, pricePerPerson, planBudget)

export type VenueCardProps = {
	name: string
	slug: string
	imageUrl: string | null | undefined

	locationLine: string
	district: string
	pricePerPerson: number
	rating: number
	isFeatured?: boolean
	isNew?: boolean

	metaBadge?: ReactNode

	createdAt?: string

	showCta?: boolean
	className?: string

	planGuestCount?: number
	onSelect?: () => void
	selectLabel?: string
}

const cardClassName =
	'group/card flex h-full flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/35 hover:shadow-lg ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2'

export const VenueCard = ({
	name,
	slug,
	imageUrl,
	locationLine,
	district,
	pricePerPerson,
	rating,
	isFeatured = false,
	isNew = false,
	metaBadge,
	createdAt,
	showCta = true,
	className,
	planGuestCount,
	onSelect,
	selectLabel,
}: VenueCardProps) => {
	const formatPrice = (price: number) => new Intl.NumberFormat('mn-MN').format(price)

	const safeRating = Number.isFinite(rating) ? rating : 0
	const src = imageUrl?.trim() || '/placeholder.svg'
	const href = `/venues/${slug}`
	const isSelectable = Boolean(onSelect)
	const showPlanEstimate = planGuestCount != null && planGuestCount > 0
	const estimatedTotal = showPlanEstimate ? planGuestCount * pricePerPerson : null
	const ctaLabel = selectLabel ?? (isSelectable ? 'Сонгох' : 'Дэлгэрэнгүй')

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (!onSelect) return
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			onSelect()
		}
	}

	const content = (
		<>
			<div className='relative aspect-4/3 overflow-hidden bg-muted'>
				<img
					src={src}
					alt={name}
					className='size-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-[1.04]'
				/>

				<div
					className='pointer-events-none absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-black/15 opacity-80 transition-opacity duration-300 group-hover/card:opacity-100'
					aria-hidden
				/>

				<div className='pointer-events-none absolute top-3 left-3 z-10 flex max-w-[calc(100%-5rem)] flex-col items-start gap-1.5'>
					<div className='flex flex-wrap gap-1.5'>
						{isFeatured ? (
							<Badge className='border-0 bg-primary/95 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary-foreground shadow-sm backdrop-blur-sm'>
								ОНЦЛОХ
							</Badge>
						) : null}
						{isNew ? (
							<Badge className='border-0 bg-accent/95 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-accent-foreground shadow-sm backdrop-blur-sm'>
								ШИНЭ
							</Badge>
						) : null}
					</div>
					{metaBadge ? (
						<div className='[&_.inline-flex]:pointer-events-none'>{metaBadge}</div>
					) : null}
				</div>

				<div className='pointer-events-none absolute top-3 right-3 z-10 flex items-center gap-1 rounded-md border border-white/20 bg-white/90 px-2 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur-md'>
					<Star className='h-3.5 w-3.5 fill-accent text-accent' aria-hidden />
					<span>{safeRating.toFixed(1)}</span>
				</div>
			</div>

			<div className='relative z-10 flex flex-1 flex-col p-4 pt-3'>
				<div className='min-h-0 flex-1'>
					<h3 className='line-clamp-2 text-base leading-snug font-semibold text-foreground transition-colors group-hover/card:text-accent'>
						{name}
					</h3>
					<div className='mt-1.5 flex items-start gap-1.5 text-sm text-muted-foreground'>
						<MapPin className='mt-0.5 h-3.5 w-3.5 shrink-0 text-accent/70' aria-hidden />
						<span className='line-clamp-2 leading-snug'>
							{DISTRICT_SLUG_LABELS[district] ?? locationLine}
						</span>
					</div>
				</div>

				<div className='mt-4 flex items-end justify-between gap-3 border-t border-border/60 pt-3'>
					<div>
						{showPlanEstimate ? (
							<>
								<p className='text-[10px] font-medium tracking-wider text-muted-foreground uppercase'>
									{planGuestCount} зочин
								</p>
								<p className='text-lg font-bold text-foreground tabular-nums'>
									<span className='text-accent'>{formatPrice(estimatedTotal!)}</span>
									<span className='text-sm font-semibold text-muted-foreground'>₮</span>
								</p>
							</>
						) : (
							<>
								<p className='text-[10px] font-medium tracking-wider text-muted-foreground uppercase'>
									хүн тутамд
								</p>
								<p className='text-lg font-bold text-foreground tabular-nums'>
									<span className='text-accent'>{formatPrice(pricePerPerson)}</span>
									<span className='text-sm font-semibold text-muted-foreground'>₮</span>
								</p>
							</>
						)}
					</div>
					{!isSelectable ? (
						<div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-secondary/50 text-muted-foreground transition-colors group-hover/card:border-accent/30 group-hover/card:bg-accent/10 group-hover/card:text-accent'>
							<ArrowUpRight className='h-4 w-4' aria-hidden />
						</div>
					) : null}
				</div>

				{showCta ? (
					<div className='mt-3'>
						<span className='flex w-full items-center justify-center rounded-lg border border-border bg-secondary/30 px-3 py-2.5 text-xs font-semibold tracking-wide text-foreground uppercase transition-colors group-hover/card:border-accent/40 group-hover/card:bg-accent/10 group-hover/card:text-accent'>
							{ctaLabel}
						</span>
					</div>
				) : null}
			</div>
		</>
	)

	if (onSelect) {
		return (
			<div
				role='button'
				tabIndex={0}
				onClick={onSelect}
				onKeyDown={handleKeyDown}
				className={cn(cardClassName, 'cursor-pointer', className)}
			>
				{content}
			</div>
		)
	}

	return (
		<Link href={href} className={cn(cardClassName, className)}>
			{content}
		</Link>
	)
}
