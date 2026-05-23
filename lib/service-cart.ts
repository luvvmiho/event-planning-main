import type { AddServiceToCartInput, ServiceCatalogDetail } from '@/lib/types'
import { serviceKindLabelMn } from '@/lib/service-labels'

export const buildServiceCartInput = (
	service: Pick<
		ServiceCatalogDetail,
		'id' | 'name' | 'kind' | 'price_flat' | 'image_url'
	>,
	providerLabel: string,
	quantity: number,
	bookingDate: string,
): AddServiceToCartInput => ({
	serviceId: service.id,
	name: service.name,
	providerLabel,
	category: service.kind,
	categoryLabel: serviceKindLabelMn(service.kind),
	image: service.image_url ?? '',
	quantity,
	priceFlat: service.price_flat,
	bookingDate,
})

export const isVenueCartItem = (
	item: { itemType?: string },
): item is import('@/lib/types').VenueCartItem =>
	item.itemType === 'venue' || item.itemType === undefined

export const isServiceCartItem = (
	item: { itemType?: string },
): item is import('@/lib/types').ServiceCartItem => item.itemType === 'service'

export const isVenueOrderItem = (line: OrderItemLike): line is import('@/lib/types').OrderVenueItem =>
	line.itemType === 'service' ? false : 'venueId' in line && Boolean(line.venueId)

export const isServiceOrderItem = (
	line: OrderItemLike,
): line is import('@/lib/types').OrderServiceItem =>
	line.itemType === 'service' || ('serviceId' in line && Boolean(line.serviceId))

type OrderItemLike = {
	itemType?: string
	venueId?: string
	serviceId?: string
}
