import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AddServiceToCartInput, AddVenueToCartInput, CartItem, ServiceCartItem, VenueCartItem } from '@/lib/types'

export type { CartItem, AddVenueToCartInput, AddServiceToCartInput }

type CartState = {
	items: CartItem[]
	addVenueItem: (input: AddVenueToCartInput) => void
	addServiceItem: (input: AddServiceToCartInput) => void
	removeItem: (id: string) => void
	toggleItemSelected: (id: string) => void
	clearCart: () => void
}

function venueLineItem(input: AddVenueToCartInput): VenueCartItem {
	const isBundle = input.priceMode === 'bundle_flat' && Boolean(input.packageId)
	const details = isBundle
		? `${input.guestCount} зочин · ${input.packageName ?? 'Багц'}`
		: `${input.guestCount} хүн`

	return {
		itemType: 'venue',
		id: crypto.randomUUID(),
		venueId: input.venueId,
		name: input.name,
		providerLabel: input.providerLabel,
		category: input.category,
		categoryLabel: input.categoryLabel,
		image: input.image,
		details,
		detailType: isBundle ? 'package' : 'capacity',
		price: input.price,
		selected: true,
		bookingDate: input.bookingDate,
		guestCount: input.guestCount,
		packageId: input.packageId,
		packageName: input.packageName,
		packageSlug: input.packageSlug,
		priceFlat: input.priceFlat,
		guestsMin: input.guestsMin,
		guestsMax: input.guestsMax,
		packageServices: input.packageServices,
		priceMode: input.priceMode ?? 'per_person',
	}
}

function serviceLineItem(input: AddServiceToCartInput): ServiceCartItem {
	return {
		itemType: 'service',
		id: crypto.randomUUID(),
		serviceId: input.serviceId,
		name: input.name,
		providerLabel: input.providerLabel,
		category: input.category,
		categoryLabel: input.categoryLabel,
		image: input.image,
		details: `${input.quantity} ширхэг`,
		detailType: 'quantity',
		price: input.priceFlat * input.quantity,
		priceFlat: input.priceFlat,
		quantity: input.quantity,
		selected: true,
		bookingDate: input.bookingDate,
	}
}

/** Legacy persisted rows without itemType */
const normalizeCartItem = (raw: CartItem & { itemType?: string }): CartItem => {
	if (raw.itemType === 'service') return raw as ServiceCartItem
	if (raw.itemType === 'venue') return raw as VenueCartItem
	return { ...(raw as VenueCartItem), itemType: 'venue' }
}

export const useCartStore = create<CartState>()(
	persist(
		(set) => ({
			items: [],
			addVenueItem: (input) =>
				set((s) => ({ items: [...s.items, venueLineItem(input)] })),
			addServiceItem: (input) =>
				set((s) => ({ items: [...s.items, serviceLineItem(input)] })),
			removeItem: (id) =>
				set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
			toggleItemSelected: (id) =>
				set((s) => ({
					items: s.items.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i)),
				})),
			clearCart: () => set({ items: [] }),
		}),
		{
			name: 'nairly-cart',
			merge: (persisted, current) => {
				const p = persisted as Partial<CartState> | undefined
				const items = (p?.items ?? []).map((item) =>
					normalizeCartItem(item as CartItem & { itemType?: string }),
				)
				return { ...current, ...p, items }
			},
		},
	),
)
