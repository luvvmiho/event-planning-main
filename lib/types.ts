export type UserType = 'user' | 'provider'

export type AuthActionState = { error: string } | null

export type LoginFormValues = {
	email: string
	password: string
}

export type RegisterFormValues = {
	name: string
	email: string
	phone: string
	password: string
	confirmPassword: string
	userType: 'user' | 'provider'
	serviceCategory?: string
	registrationNumber?: string
	acceptTerms: boolean
}

export type CreateVenueFormValues = {
	name: string
	short_description?: string
	description?: string
	category_id: string
	location: string
	district?: string
	address?: string
	lat?: number
	long?: number
	capacity_min: number
	capacity_max: number
	price_per_person: number
	contact_phone?: string
	contact_email?: string
	website?: string
	amenities?: string
	image_url?: string
	images?: string[]
	event_packages: VenueEventPackageFormValues[]
}

export type VenueEventPackageFormServiceValues =
	| {
			source: 'catalog'
			provider_service_id: string
			catalogName?: string
			catalogPriceFlat?: number
			description?: string
			quantity: number
			is_included: boolean
	  }
	| {
			source: 'custom'
			kind: VenuePackageServiceKind
			title: string
			description?: string
			quantity: number
			is_included: boolean
	  }

export type VenueEventPackageFormValues = {
	id?: string
	name: string
	price_flat: number
	short_description?: string
	guests_min?: number | null
	guests_max?: number | null
	is_active: boolean
	services: VenueEventPackageFormServiceValues[]
}

export type ApiMeta = {
	total: number
	page: number
	limit: number
	totalPages: number
}

export type Category = {
	id: string
	slug: string
	name: string
	sort_order: number
}

export type CatalogCategory = Category

export type VenueListItem = {
	id: string
	slug: string
	name: string
	short_description: string | null
	location: string
	district: string | null
	capacity_min: number
	capacity_max: number
	price_per_person: number
	rating: number | null
	review_count: number
	image_url: string | null
	images: string[] | null
	is_featured: boolean
	is_new: boolean
	created_at: string
	categories: { id: string; slug: string; name: string } | null
	/** Present on provider manage / some list responses */
	status?: VenueStatus
}

export type VenueStatus = 'draft' | 'published' | 'archived'

export type WishlistRow = {
	id: string
	saved_at: string
	venue: VenueListItem | null
}

export type VenueDetail = VenueListItem & {
	description: string | null
	address: string | null
	lat: number | null
	long: number | null
	amenities: string[] | null
	operating_hours: Record<string, unknown>
	contact_phone: string | null
	contact_email: string | null
	website: string | null
	category: string
}

/** Provider GET /venues/:id/manage — includes all statuses + packages */
export type VenueManageDetail = VenueDetail & {
	status: VenueStatus
	event_packages: VenueEventPackageManage[]
	provider_services?: ServiceManageDetail[]
}

export type PatchVenuePayload = Partial<{
	name: string
	short_description: string
	description: string
	location: string
	district: string
	address: string
	lat: number
	long: number
	capacity_min: number
	capacity_max: number
	price_per_person: number
	contact_phone: string
	contact_email: string
	website: string
	amenities: string[]
	image_url: string
	images: string[]
	operating_hours: Record<string, unknown>
	event_packages?: EventPackagePatchInput[]
}>

export type VenueListParams = {
	category?: string
	categoryId?: string
	district?: string
	capacity?: number
	minPrice?: number
	maxPrice?: number
	search?: string
	featured?: boolean
	sort?: 'rating' | 'newest' | 'price_asc' | 'price_desc' | 'name'
	page?: number
	limit?: number
}

export type VenueReview = {
	id: string
	rating: number
	comment: string | null
	created_at: string
	updated_at?: string
	user_id: string
	profiles: { full_name: string | null } | null
}

export type VenuePackageServiceKind =
	| 'food'
	| 'cake'
	| 'entertainment'
	| 'decoration'
	| 'staff'
	| 'other'

export type VenuePackageServiceLinked = {
	id: string
	slug: string
	name: string
	kind: string
	price_flat: number
	image_url?: string | null
}

export type VenuePackageService = {
	id?: string
	provider_service_id?: string | null
	kind: VenuePackageServiceKind | string
	title: string
	description?: string | null
	quantity?: number | null
	is_included: boolean
	sort_order: number
	provider_services?: VenuePackageServiceLinked | null
}

/** Active bundles returned from GET /venues/:id/event-packages */
export type VenueEventPackagePublic = {
	id: string
	venue_id: string
	slug: string
	name: string
	short_description: string | null
	price_flat: number
	guests_min: number | null
	guests_max: number | null
	sort_order: number
	venue_package_services?: VenuePackageService[]
}

/** Manage list/create — includes inactive rows */
export type VenueEventPackageManage = VenueEventPackagePublic & {
	is_active: boolean
	created_at: string
	updated_at: string
}

export type CreateVenueEventPackageServiceInput = {
	provider_service_id?: string
	kind?: VenuePackageServiceKind | string
	title?: string
	description?: string
	quantity?: number
	is_included?: boolean
	sort_order?: number
}

export type CreateVenueEventPackageInput = {
	name: string
	price_flat: number
	slug?: string
	short_description?: string
	guests_min?: number | null
	guests_max?: number | null
	is_active?: boolean
	sort_order?: number
	services?: CreateVenueEventPackageServiceInput[]
}

/** PATCH /venues/:id — include id on existing bundle rows */
export type EventPackagePatchInput = CreateVenueEventPackageInput & {
	id?: string
}

export type VenueCartPriceMode = 'per_person' | 'bundle_flat'

export type CartPackageServiceSnapshot = {
	kind: VenuePackageServiceKind
	title: string
	quantity: number
}

export type StoredPackageSnapshot = {
	package_name: string
	package_slug: string
	price_flat: number
	services_included: { kind: string; title: string; quantity: number }[]
}

export type VenueTimeSlot = {
	id: string
	venue_id: string
	day_of_week: number
	regular_price: number
	sale_price: number | null
	is_on_sale: boolean
}

export type VenueBookingEntry = {
	id: string
	booking_date: string
	status: string
}

export type VenueAvailability = {
	slots: VenueTimeSlot[]
	bookings: VenueBookingEntry[]
	startDate: string
	endDate: string
}

export type DayAvailability = {
	date: string
	isBooked: boolean
	price: number
	isOnSale: boolean
	salePrice: number | null
}

export type VenueInfo = {
	id: string
	name: string
	capacity_min: number
	capacity_max: number
	location: string
	district: string
	category: string
	image_url?: string | null
	images?: string[] | null
}

export interface VenueAvailabilityCalendarProps {
	venueId: string
	venue: VenueInfo
}

export interface BookingPopoverProps {
	date: Date
	info: DayAvailability
	effectivePrice: number
	guests: string
	guestOptions: number[]
	venue: VenueInfo
	onGuestsChange: (v: string) => void
	onAddToCart: () => void
	onClose: () => void
}

export type ServiceKind =
	| 'car'
	| 'cake'
	| 'photoshoot'
	| 'entertainment'
	| 'decoration'
	| 'catering'
	| 'other'

export type ServiceStatus = 'draft' | 'published' | 'archived'

export type ServiceListItem = {
	id: string
	provider_id: string
	slug: string
	name: string
	kind: ServiceKind
	short_description: string | null
	price_flat: number
	location: string | null
	image_url: string | null
	images: string[]
	sort_order: number
	created_at: string
	status?: ServiceStatus
}

export type ServiceCatalogDetail = ServiceListItem & {
	description: string | null
}

export type ServiceManageDetail = ServiceCatalogDetail & {
	status: ServiceStatus
	updated_at?: string
}

export type ServiceListParams = {
	kind?: ServiceKind
	search?: string
	page?: number
	limit?: number
	provider_id?: string
}

export type CreateServiceFormValues = {
	name: string
	kind: ServiceKind
	price_flat: number
	short_description?: string
	description?: string
	location?: string
	image_url?: string
	images?: string[]
	sort_order?: number
	slug?: string
}

export type PatchServicePayload = Partial<{
	name: string
	kind: ServiceKind
	price_flat: number
	short_description: string
	description: string
	location: string
	image_url: string
	images: string[]
	sort_order: number
	slug: string
}>

export type OrderVenueItem = {
	itemType?: 'venue'
	venueId: string
	name: string
	providerLabel: string
	category: string
	categoryLabel: string
	image?: string
	guestCount: number
	price: number
	bookingDate: string
	packageId?: string
	package_slug?: string
	package_snapshot?: StoredPackageSnapshot
}

export type OrderServiceItem = {
	itemType: 'service'
	serviceId: string
	name: string
	providerLabel: string
	category: string
	categoryLabel: string
	image?: string
	quantity: number
	price: number
	bookingDate: string
	service_snapshot?: {
		service_name: string
		service_slug: string
		kind: ServiceKind
		price_flat: number
		quantity: number
	}
}

export type OrderItem = OrderVenueItem | OrderServiceItem

export type CreateOrderPayload = {
	form: {
		fullName: string
		email: string
		phone: string
		paymentMethod: string
		notes?: string
	}
	items: CheckoutLineItemInput[]
	subtotal: number
	total: number
}

export type SubmitCheckoutResult = { ok: true; orderId: string } | { ok: false; error: string }

export type OrderRecord = {
	id: string
	user_id: string | null
	customer_name: string
	customer_email: string
	customer_phone: string
	payment_method: string
	notes: string | null
	items: OrderItem[]
	subtotal: number
	total: number
	status: string
	created_at: string
}

export type OrderSummary = Pick<
	OrderRecord,
	'id' | 'status' | 'total' | 'subtotal' | 'created_at' | 'customer_name' | 'payment_method'
>

export type ProviderStats = {
	totalOrders: number
	totalRevenue: number
	activeServices: number
	ordersTrendPercent: number | null
	revenueTrendPercent: number | null
}

export type ProviderOrderListItem = {
	id: string
	display_ref: string
	customer_name: string
	event_type_label: string
	created_at: string
	status: string
	total: number
	provider_subtotal: number
}

export type ProviderOrderDetail = OrderRecord & {
	display_ref: string
	event_type_label: string
	provider_subtotal: number
}

export type CartDetailType = 'capacity' | 'package' | 'time' | 'quantity'

export type VenueCartItem = {
	itemType: 'venue'
	id: string
	venueId: string
	name: string
	providerLabel: string
	category: string
	categoryLabel: string
	image: string
	details: string
	detailType: Exclude<CartDetailType, 'quantity'>
	price: number
	selected: boolean
	bookingDate: string
	guestCount: number
	packageId?: string
	packageName?: string
	packageSlug?: string
	priceFlat?: number
	guestsMin?: number | null
	guestsMax?: number | null
	packageServices?: CartPackageServiceSnapshot[]
	priceMode?: VenueCartPriceMode
}

export type ServiceCartItem = {
	itemType: 'service'
	id: string
	serviceId: string
	name: string
	providerLabel: string
	category: string
	categoryLabel: string
	image: string
	details: string
	detailType: 'quantity'
	price: number
	priceFlat: number
	quantity: number
	selected: boolean
	bookingDate: string
}

export type CartItem = VenueCartItem | ServiceCartItem

export type AddVenueToCartInput = {
	venueId: string
	name: string
	providerLabel: string
	category: string
	categoryLabel: string
	image: string
	guestCount: number
	price: number
	bookingDate: string
	packageId?: string
	packageName?: string
	packageSlug?: string
	priceFlat?: number
	guestsMin?: number | null
	guestsMax?: number | null
	packageServices?: CartPackageServiceSnapshot[]
	priceMode?: VenueCartPriceMode
}

export type AddServiceToCartInput = {
	serviceId: string
	name: string
	providerLabel: string
	category: string
	categoryLabel: string
	image: string
	quantity: number
	priceFlat: number
	bookingDate: string
}

export type CheckoutVenueLineItem = {
	itemType: 'venue'
	id: string
	venueId: string
	name: string
	providerLabel: string
	category: string
	categoryLabel: string
	image?: string
	price: number
	bookingDate: string
	guestCount: number
	packageId?: string
}

export type CheckoutServiceLineItem = {
	itemType: 'service'
	id: string
	serviceId: string
	name: string
	providerLabel: string
	category: string
	categoryLabel: string
	image?: string
	price: number
	bookingDate: string
	quantity: number
}

export type CheckoutLineItemInput = CheckoutVenueLineItem | CheckoutServiceLineItem

export type CheckoutFormValues = {
	fullName: string
	email: string
	phone: string
	notes?: string
	paymentMethod: 'qpay' | 'bank_transfer'
}

export type CheckoutPayload = {
	form: CheckoutFormValues
	items: CheckoutLineItemInput[]
	subtotal: number
	total: number
}

export type MarketplaceServiceSlug =
	| 'venues'
	| 'catering'
	| 'decoration'
	| 'photography'
	| 'transportation'
	| 'bakery'
	| 'entertainment'
	| 'others'
	| 'flowers'
	| 'cake'

export type ServiceDetail = {
	title: string
	lede: string
	body: string
}

export type EventPlanSummary = {
	id: string
	name: string | null
	budget: number
	event_date: string | null
	guest_count: number | null
	notes: string | null
	estimated_total: number
	remaining_budget: number
	over_budget: boolean
	mixed_providers: boolean
	created_at: string
	updated_at: string
}

export type EventPlanVenueBreakdown = {
	venue_id: string
	venue_name: string
	venue_slug: string | null
	venue_package_id: string | null
	venue_package_name: string | null
	venue_guest_count: number
	venue_booking_date: string
	estimated_price: number
	provider_id: string | null
	provider_label: string | null
}

export type EventPlanServiceLine = {
	id: string
	provider_service_id: string
	service_name: string
	service_slug: string | null
	kind: ServiceKind
	quantity: number
	estimated_price: number
	provider_id: string | null
	provider_label: string | null
	name?: string | null
	image_url?: string | null
	images?: string[] | null
	short_description?: string | null
}

export type EventPlanDetail = EventPlanSummary & {
	venue: EventPlanVenueBreakdown | null
	services: EventPlanServiceLine[]
}

export type CreateEventPlanPayload = {
	budget: number
	name?: string
	event_date?: string
	guest_count?: number
	notes?: string
}

export type PatchEventPlanPayload = Partial<CreateEventPlanPayload>

export type SetEventPlanVenuePayload = {
	venue_id: string
	venue_package_id?: string
	venue_guest_count: number
	venue_booking_date: string
}

export type AddEventPlanServicePayload = {
	provider_service_id: string
	quantity: number
}

export type PatchEventPlanServicePayload = {
	quantity: number
}

export type EventPlanCheckoutPayload = CheckoutFormValues
