import { OrderLinePackageInfo } from '@/components/cart/cart-line-package-info'
import { Badge } from '@/components/ui/badge'
import { isServiceOrderItem, isVenueOrderItem } from '@/lib/service-cart'
import type { OrderItem } from '@/lib/types'
import { CalendarDays, Hash, MapPin, Users } from 'lucide-react'

const formatMnt = (n: number) => new Intl.NumberFormat('mn-MN').format(n) + '₮'

const formatBookingDate = (iso: string) => {
	const d = new Date(`${iso}T12:00:00`)
	return d.toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric' })
}

const normalizeItems = (raw: unknown): OrderItem[] => {
	if (!Array.isArray(raw)) return []
	return raw.filter((x): x is OrderItem => x != null && typeof x === 'object' && 'name' in x)
}

type ProviderOrderItemsPanelProps = {
	items: unknown
	providerSubtotal?: number
	orderTotal?: number
}

export const ProviderOrderItemsPanel = ({
	items: rawItems,
	providerSubtotal,
	orderTotal,
}: ProviderOrderItemsPanelProps) => {
	const items = normalizeItems(rawItems)

	if (items.length === 0) {
		return (
			<p className='px-6 text-sm text-muted-foreground'>Захиалгын мөр олдсонгүй.</p>
		)
	}

	return (
		<div className='space-y-4 px-6 pb-6'>
			<ul className='space-y-4'>
				{items.map((line, idx) => {
					const isPackage =
						isVenueOrderItem(line) && Boolean(line.packageId || line.package_snapshot)
					const isService = isServiceOrderItem(line)
					const lineKey = isService
						? `${line.serviceId}-${line.bookingDate}-${idx}`
						: isVenueOrderItem(line)
							? `${line.venueId}-${line.bookingDate}-${idx}`
							: `line-${idx}`

					return (
						<li
							key={lineKey}
							className='overflow-hidden rounded-xl border border-border bg-card'
						>
							<div className='flex gap-4 p-4'>
								<div className='relative h-24 w-28 shrink-0 overflow-hidden rounded-lg bg-muted'>
									{line.image ? (
										<img
											src={line.image}
											alt=''
											className='size-full object-cover'
										/>
									) : null}
								</div>

								<div className='min-w-0 flex-1 space-y-2'>
									<div className='flex flex-wrap items-start justify-between gap-2'>
										<div>
											<div className='mb-1 flex flex-wrap items-center gap-2'>
												{line.categoryLabel ? (
													<Badge
														variant='outline'
														className='border-accent/30 text-xs text-accent'
													>
														{line.categoryLabel}
													</Badge>
												) : null}
												{isPackage ? (
													<Badge className='bg-accent/15 text-xs text-accent-foreground hover:bg-accent/15'>
														Багц
													</Badge>
												) : isService ? (
													<Badge variant='secondary' className='text-xs'>
														Үйлчилгээ
													</Badge>
												) : (
													<Badge variant='secondary' className='text-xs'>
														Хүн тутамд
													</Badge>
												)}
											</div>
											<p className='text-base font-semibold text-foreground'>
												{line.name}
											</p>
											{line.providerLabel ? (
												<p className='mt-0.5 flex items-center gap-1 text-sm text-muted-foreground'>
													<MapPin className='h-3.5 w-3.5 shrink-0' aria-hidden />
													{line.providerLabel}
												</p>
											) : null}
										</div>
										<p className='shrink-0 text-right text-base font-semibold tabular-nums text-foreground'>
											{formatMnt(line.price)}
										</p>
									</div>

									<div className='flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground'>
										<span className='inline-flex items-center gap-1'>
											<CalendarDays className='h-3.5 w-3.5' aria-hidden />
											{formatBookingDate(line.bookingDate)}
										</span>
										{isService ? (
											<span className='inline-flex items-center gap-1'>
												<Hash className='h-3.5 w-3.5' aria-hidden />
												{line.quantity} ширхэг
											</span>
										) : isVenueOrderItem(line) ? (
											<span className='inline-flex items-center gap-1'>
												<Users className='h-3.5 w-3.5' aria-hidden />
												{line.guestCount} зочин
											</span>
										) : null}
									</div>

									{isService ? (
										<p className='text-xs text-muted-foreground'>
											Үйлчилгээ · price_flat × тоо
										</p>
									) : !isPackage ? (
										<p className='text-xs text-muted-foreground'>
											Танхимын захиалга · хүн тутамд тооцсон мөр
										</p>
									) : null}
								</div>
							</div>

							{isPackage ? (
								<div className='border-t border-border bg-secondary/20 px-4 py-3'>
									<OrderLinePackageInfo line={line} className='mt-0' />
								</div>
							) : null}
						</li>
					)
				})}
			</ul>

			<div className='flex flex-col items-end gap-1 border-t border-border pt-4 text-sm'>
				{providerSubtotal != null && providerSubtotal !== orderTotal ? (
					<p className='text-muted-foreground'>
						Танхимын дүн:{' '}
						<span className='font-medium tabular-nums text-foreground'>
							{formatMnt(providerSubtotal)}
						</span>
					</p>
				) : null}
				{orderTotal != null ? (
					<p className='text-base font-semibold text-foreground'>
						Захиалгын нийт:{' '}
						<span className='tabular-nums'>{formatMnt(orderTotal)}</span>
					</p>
				) : null}
			</div>
		</div>
	)
}
