import { Badge } from '@/components/ui/badge'
import type { OrderItem, StoredPackageSnapshot, VenueCartItem } from '@/lib/types'
import { venuePackageKindLabelMn } from '@/lib/venue-package-labels'
import { cn } from '@/lib/utils'
import { Gift, Users } from 'lucide-react'

const formatMnt = (n: number) => new Intl.NumberFormat('mn-MN').format(n) + '₮'

type PackageServicesListProps = {
	services: { kind: string; title: string; quantity: number }[]
	className?: string
	compact?: boolean
}

export const PackageServicesList = ({
	services,
	className,
	compact = false,
}: PackageServicesListProps) => {
	if (services.length === 0) return null

	return (
		<ul className={cn('space-y-1.5', className)}>
			{services.map((s, idx) => (
				<li
					key={`${s.kind}-${s.title}-${idx}`}
					className={cn(
						'flex items-start gap-2 text-muted-foreground',
						compact ? 'text-xs' : 'text-sm',
					)}
				>
					<Badge
						variant='outline'
						className={cn('shrink-0 font-normal', compact ? 'text-[10px]' : 'text-xs')}
					>
						{venuePackageKindLabelMn(s.kind as Parameters<typeof venuePackageKindLabelMn>[0])}
					</Badge>
					<span className='min-w-0 text-foreground'>
						{s.title}
						{s.quantity > 1 ? (
							<span className='tabular-nums text-muted-foreground'> ×{s.quantity}</span>
						) : null}
					</span>
				</li>
			))}
		</ul>
	)
}

type CartLinePackageInfoProps = {
	item: Pick<
		VenueCartItem,
		| 'detailType'
		| 'packageId'
		| 'packageName'
		| 'priceFlat'
		| 'price'
		| 'guestCount'
		| 'guestsMin'
		| 'guestsMax'
		| 'packageServices'
	>
	showPrice?: boolean
	className?: string
}

export const CartLinePackageInfo = ({
	item,
	showPrice = true,
	className,
}: CartLinePackageInfoProps) => {
	if (item.detailType !== 'package' || !item.packageId) return null

	const flatPrice = item.priceFlat ?? item.price
	const services = item.packageServices ?? []

	return (
		<div
			className={cn(
				'rounded-lg border border-accent/25 bg-accent/5 p-3',
				className,
			)}
		>
			<div className='flex items-start gap-2'>
				<Gift className='mt-0.5 h-4 w-4 shrink-0 text-accent' aria-hidden />
				<div className='min-w-0 flex-1 space-y-2'>
					<div>
						<p className='text-xs font-semibold tracking-wide text-accent uppercase'>
							Багц
						</p>
						<p className='font-medium text-foreground'>{item.packageName}</p>
					</div>

					<div className='flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground'>
						<span className='inline-flex items-center gap-1'>
							<Users className='h-3.5 w-3.5' aria-hidden />
							{item.guestCount} зочин
						</span>
						{item.guestsMin != null || item.guestsMax != null ? (
							<span>
								Зөвшөөрөгдсөн:{' '}
								{item.guestsMin != null ? `${item.guestsMin}` : '—'}
								{' – '}
								{item.guestsMax != null ? `${item.guestsMax}` : '—'} хүн
							</span>
						) : null}
					</div>

					{showPrice ? (
						<p className='text-sm font-semibold text-primary tabular-nums'>
							Багцын нийт үнэ: {formatMnt(flatPrice)}
						</p>
					) : null}

					{services.length > 0 ? (
						<div>
							<p className='mb-1.5 text-xs font-medium text-muted-foreground'>
								Багтсан үйлчилгээ
							</p>
							<PackageServicesList services={services} compact />
						</div>
					) : null}
				</div>
			</div>
		</div>
	)
}

type OrderLinePackageInfoProps = {
	line: OrderItem
	className?: string
}

export const OrderLinePackageInfo = ({ line, className }: OrderLinePackageInfoProps) => {
	if (line.itemType === 'service') return null
	const snapshot = line.package_snapshot
	if (!line.packageId && !snapshot) return null

	const name = snapshot?.package_name ?? line.package_slug ?? 'Багц'
	const flatPrice = snapshot?.price_flat ?? line.price
	const services = snapshot?.services_included ?? []

	return (
		<div className={cn('mt-3 rounded-lg border border-accent/25 bg-accent/5 p-3', className)}>
			<p className='text-xs font-semibold tracking-wide text-accent uppercase'>Багц</p>
			<p className='mt-0.5 font-medium text-foreground'>{name}</p>
			<p className='mt-1 text-sm tabular-nums text-primary'>
				Багцын нийт үнэ: {formatMnt(flatPrice)}
			</p>
			{services.length > 0 ? (
				<div className='mt-2'>
					<p className='mb-1 text-xs font-medium text-muted-foreground'>Багтсан үйлчилгээ</p>
					<PackageServicesList services={services} compact />
				</div>
			) : null}
		</div>
	)
}

export const packageSnapshotFromCartItem = (
	item: VenueCartItem,
): StoredPackageSnapshot | undefined => {
	if (!item.packageId || !item.packageName) return undefined
	return {
		package_name: item.packageName,
		package_slug: item.packageSlug ?? '',
		price_flat: item.priceFlat ?? item.price,
		services_included: (item.packageServices ?? []).map((s) => ({
			kind: s.kind,
			title: s.title,
			quantity: s.quantity,
		})),
	}
}
