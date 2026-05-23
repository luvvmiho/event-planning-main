import type {
	AddVenueToCartInput,
	CartPackageServiceSnapshot,
	VenueEventPackagePublic,
	VenuePackageServiceKind,
} from '@/lib/types'

const toPackageServiceKind = (kind: string): VenuePackageServiceKind => {
	const allowed: VenuePackageServiceKind[] = [
		'food',
		'cake',
		'entertainment',
		'decoration',
		'staff',
		'other',
	]
	return allowed.includes(kind as VenuePackageServiceKind)
		? (kind as VenuePackageServiceKind)
		: 'other'
}

export const validatePackageGuests = (
	pkg: Pick<VenueEventPackagePublic, 'guests_min' | 'guests_max'>,
	guestCount: number,
): string | null => {
	if (pkg.guests_min != null && guestCount < pkg.guests_min) {
		return `Зочдын тоо дор хаяж ${pkg.guests_min} байх ёстой.`
	}
	if (pkg.guests_max != null && guestCount > pkg.guests_max) {
		return `Зочдын тоо ихдээ ${pkg.guests_max} байх ёстой.`
	}
	return null
}

export const packageIncludedServices = (
	pkg: VenueEventPackagePublic,
): CartPackageServiceSnapshot[] => {
	return [...(pkg.venue_package_services ?? [])]
		.filter((s) => s.is_included !== false)
		.sort((a, b) => a.sort_order - b.sort_order)
		.map((s) => ({
			kind: toPackageServiceKind(s.kind),
			title: s.provider_services?.name ?? s.title,
			quantity: s.quantity ?? 1,
		}))
}

export const defaultPackageGuestCount = (
	pkg: Pick<VenueEventPackagePublic, 'guests_min'>,
): number => pkg.guests_min ?? 1

type BuildPackageCartInput = {
	venue: {
		id: string
		name: string
		category: string
		image_url?: string | null
		images?: string[] | null
		district?: string | null
		location: string
	}
	pkg: VenueEventPackagePublic
	guestCount: number
	bookingDate: string
	providerLabel: string
	categoryLabel: string
}

export const buildPackageCartItem = (
	input: BuildPackageCartInput,
): { item: AddVenueToCartInput } | { error: string } => {
	const err = validatePackageGuests(input.pkg, input.guestCount)
	if (err) return { error: err }

	const image =
		input.venue.image_url?.trim() ||
		(Array.isArray(input.venue.images) && input.venue.images[0]) ||
		''

	return {
		item: {
			venueId: input.venue.id,
			packageId: input.pkg.id,
			packageName: input.pkg.name,
			packageSlug: input.pkg.slug,
			name: input.venue.name,
			providerLabel: input.providerLabel,
			category: input.venue.category,
			categoryLabel: input.categoryLabel,
			image,
			guestCount: input.guestCount,
			price: input.pkg.price_flat,
			priceFlat: input.pkg.price_flat,
			guestsMin: input.pkg.guests_min,
			guestsMax: input.pkg.guests_max,
			packageServices: packageIncludedServices(input.pkg),
			bookingDate: input.bookingDate,
			priceMode: 'bundle_flat',
		},
	}
}
