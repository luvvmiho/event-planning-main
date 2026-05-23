'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { serviceKindLabelMn } from '@/lib/service-labels'
import { ArrowUpRight, MapPin } from 'lucide-react'
import Link from 'next/link'
import type { ServiceKind, ServiceListItem } from '@/lib/types'

type ServiceCardProps = {
	service: ServiceListItem
	className?: string
}

export const ServiceCard = ({ service, className }: ServiceCardProps) => {
	const formatPrice = (price: number) => new Intl.NumberFormat('mn-MN').format(price)
	const src = service.image_url?.trim() || '/placeholder.svg'
	const href = `/services/${service.slug}`

	return (
		<Link
			href={href}
			className={cn(
				'group/card flex h-full flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm transition-all duration-300',
				'hover:-translate-y-0.5 hover:border-accent/35 hover:shadow-lg',
				'ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
				className,
			)}
		>
			<div className='relative aspect-4/3 overflow-hidden bg-muted'>
				<img
					src={src}
					alt={service.name}
					className='size-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-[1.04]'
				/>
				<div className='pointer-events-none absolute top-3 left-3 z-10'>
					<Badge className='border-0 bg-primary/95 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary-foreground shadow-sm backdrop-blur-sm'>
						{serviceKindLabelMn(service.kind as ServiceKind)}
					</Badge>
				</div>
			</div>

			<div className='relative z-10 flex flex-1 flex-col p-4 pt-3'>
				<div className='min-h-0 flex-1'>
					<h3 className='line-clamp-2 text-base leading-snug font-semibold text-foreground transition-colors group-hover/card:text-accent'>
						{service.name}
					</h3>
					{service.short_description ? (
						<p className='mt-1 line-clamp-2 text-sm text-muted-foreground'>
							{service.short_description}
						</p>
					) : null}
					{service.location ? (
						<div className='mt-1.5 flex items-start gap-1.5 text-sm text-muted-foreground'>
							<MapPin className='mt-0.5 h-3.5 w-3.5 shrink-0 text-accent/70' aria-hidden />
							<span className='line-clamp-1'>{service.location}</span>
						</div>
					) : null}
				</div>

				<div className='mt-4 flex items-end justify-between gap-3 border-t border-border/60 pt-3'>
					<div>
						<p className='text-[10px] font-medium tracking-wider text-muted-foreground uppercase'>
							нийт үнэ
						</p>
						<p className='text-lg font-bold text-foreground tabular-nums'>
							<span className='text-accent'>{formatPrice(service.price_flat)}</span>
							<span className='text-sm font-semibold text-muted-foreground'>₮</span>
						</p>
					</div>
					<div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-secondary/50 text-muted-foreground transition-colors group-hover/card:border-accent/30 group-hover/card:bg-accent/10 group-hover/card:text-accent'>
						<ArrowUpRight className='h-4 w-4' aria-hidden />
					</div>
				</div>
			</div>
		</Link>
	)
}
