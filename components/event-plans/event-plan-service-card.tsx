'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { serviceKindLabelMn } from '@/lib/service-labels'
import type { ServiceKind, ServiceListItem } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Check, MapPin, Plus } from 'lucide-react'

type EventPlanServiceCardProps = {
	service: ServiceListItem
	isAdded: boolean
	busy: boolean
	onAdd: () => void
}

export const EventPlanServiceCard = ({
	service,
	isAdded,
	busy,
	onAdd,
}: EventPlanServiceCardProps) => {
	const formatPrice = (price: number) => new Intl.NumberFormat('mn-MN').format(price)
	const src = service.image_url?.trim() || '/placeholder.svg'

	return (
		<article
			className={cn(
				'flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300',
				isAdded ? 'border-accent/50 ring-2 ring-accent/15' : 'border-border/80 hover:border-accent/35 hover:shadow-md',
			)}
		>
			<div className='relative aspect-4/3 overflow-hidden bg-muted'>
				<img
					src={src}
					alt={service.name}
					className='size-full object-cover transition-transform duration-500 hover:scale-[1.03]'
				/>
				<div
					className='pointer-events-none absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-black/10'
					aria-hidden
				/>
				<div className='absolute top-3 left-3 z-10'>
					<Badge className='border-0 bg-primary/95 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary-foreground shadow-sm backdrop-blur-sm'>
						{serviceKindLabelMn(service.kind as ServiceKind)}
					</Badge>
				</div>
				{isAdded ? (
					<div className='absolute top-3 right-3 z-10'>
						<Badge className='gap-1 border-0 bg-accent text-accent-foreground shadow-sm'>
							<Check className='size-3' aria-hidden />
							Сонгогдсон
						</Badge>
					</div>
				) : null}
			</div>

			<div className='flex flex-1 flex-col p-4 pt-3'>
				<div className='min-h-0 flex-1'>
					<h3 className='line-clamp-2 text-base font-semibold leading-snug text-foreground'>
						{service.name}
					</h3>
					{service.short_description ? (
						<p className='mt-1.5 line-clamp-2 text-sm text-muted-foreground'>
							{service.short_description}
						</p>
					) : null}
					{service.location ? (
						<div className='mt-2 flex items-start gap-1.5 text-sm text-muted-foreground'>
							<MapPin className='mt-0.5 size-3.5 shrink-0 text-accent/70' aria-hidden />
							<span className='line-clamp-1'>{service.location}</span>
						</div>
					) : null}
				</div>

				<div className='mt-4 flex items-end justify-between gap-3 border-t border-border/60 pt-3'>
					<div>
						<p className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground'>
							нийт үнэ
						</p>
						<p className='text-lg font-bold tabular-nums text-foreground'>
							<span className='text-accent'>{formatPrice(service.price_flat)}</span>
							<span className='text-sm font-semibold text-muted-foreground'>₮</span>
						</p>
					</div>
				</div>

				<Button
					type='button'
					size='sm'
					className='mt-3 w-full gap-1.5'
					variant={isAdded ? 'secondary' : 'default'}
					onClick={onAdd}
					disabled={busy || isAdded}
				>
					{isAdded ? (
						<>
							<Check className='size-4' aria-hidden />
							Нэмэгдсэн
						</>
					) : (
						<>
							<Plus className='size-4' aria-hidden />
							Сонгох
						</>
					)}
				</Button>
			</div>
		</article>
	)
}
