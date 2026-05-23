import type {
	AddEventPlanServicePayload,
	ApiMeta,
	Category,
	CreateEventPlanPayload,
	CreateOrderPayload,
	CreateVenueEventPackageInput,
	CreateVenueFormValues,
	EventPlanCheckoutPayload,
	EventPlanDetail,
	EventPlanSummary,
	OrderRecord,
	OrderSummary,
	OrderItem,
	PatchEventPlanPayload,
	PatchEventPlanServicePayload,
	PatchServicePayload,
	PatchVenuePayload,
	ProviderOrderDetail,
	ProviderOrderListItem,
	ProviderStats,
	ServiceCatalogDetail,
	ServiceListItem,
	ServiceListParams,
	ServiceManageDetail,
	ServiceStatus,
	SetEventPlanVenuePayload,
	VenueAvailability,
	VenueDetail,
	VenueEventPackageManage,
	VenueEventPackagePublic,
	VenueListItem,
	VenueListParams,
	VenueManageDetail,
	VenueReview,
	VenueStatus,
	WishlistRow,
} from '@/lib/types';

export type {
	AddEventPlanServicePayload,
	ApiMeta,
	Category,
	CreateEventPlanPayload,
	CreateOrderPayload,
	CreateVenueEventPackageInput,
	CreateVenueFormValues,
	EventPlanCheckoutPayload,
	EventPlanDetail,
	EventPlanSummary,
	OrderRecord,
	OrderSummary,
	OrderItem,
	PatchEventPlanPayload,
	PatchEventPlanServicePayload,
	PatchServicePayload,
	PatchVenuePayload,
	ProviderOrderDetail,
	ProviderOrderListItem,
	ProviderStats,
	ServiceCatalogDetail,
	ServiceListItem,
	ServiceListParams,
	ServiceManageDetail,
	ServiceStatus,
	SetEventPlanVenuePayload,
	VenueAvailability,
	VenueDetail,
	VenueEventPackageManage,
	VenueEventPackagePublic,
	VenueListItem,
	VenueListParams,
	VenueManageDetail,
	VenueReview,
	VenueStatus,
	WishlistRow,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
	const res = await fetch(`${API_URL}${path}`, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...options?.headers,
		},
	});

	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error((body as { error?: string }).error ?? `API ${res.status}`);
	}

	return res.json() as Promise<T>;
}

export async function getVenues(params: VenueListParams = {}): Promise<{
	data: VenueListItem[];
	meta: ApiMeta;
}> {
	const qs = new URLSearchParams();
	for (const [k, v] of Object.entries(params)) {
		if (v != null) qs.set(k, String(v));
	}
	return apiFetch(`/venues?${qs}`);
}

export async function getVenueBySlug(slug: string): Promise<{ data: VenueDetail }> {
	return apiFetch(`/venues/${slug}`);
}

/** Provider edit — any status, includes event_packages */
export async function getVenueForManage(
	venueId: string,
	accessToken: string,
): Promise<{ data: VenueManageDetail }> {
	return apiFetch(`/venues/${venueId}/manage`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
}

export async function updateVenue(
	venueId: string,
	body: PatchVenuePayload,
	accessToken: string,
): Promise<{ data: VenueDetail }> {
	return apiFetch(`/venues/${venueId}`, {
		method: 'PATCH',
		body: JSON.stringify(body),
		headers: { Authorization: `Bearer ${accessToken}` },
	});
}

export async function updateVenueStatus(
	venueId: string,
	status: VenueStatus,
	accessToken: string,
): Promise<{ data: VenueDetail & { status: VenueStatus } }> {
	return apiFetch(`/venues/${venueId}/status`, {
		method: 'PATCH',
		body: JSON.stringify({ status }),
		headers: { Authorization: `Bearer ${accessToken}` },
	});
}

export async function deleteVenue(
	venueId: string,
	accessToken: string,
): Promise<{ data: { deleted: boolean; id: string; slug: string; name: string } }> {
	const res = await fetch(`${API_URL}/venues/${venueId}`, {
		method: 'DELETE',
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	const body = await res.json().catch(() => ({}));
	if (!res.ok) {
		throw new Error((body as { error?: string }).error ?? `API ${res.status}`);
	}
	return body as { data: { deleted: boolean; id: string; slug: string; name: string } };
}

/** Active bundles for venue detail / booking (UUID venue id). */
export async function getVenueEventPackages(
	venueId: string,
): Promise<{ data: VenueEventPackagePublic[] }> {
	return apiFetch(`/venues/${venueId}/event-packages`);
}

/** Provider: all bundles including inactive */
export async function listVenueEventPackagesManage(
	venueId: string,
	accessToken: string,
): Promise<{ data: VenueEventPackageManage[] }> {
	return apiFetch(`/venues/${venueId}/event-packages/manage`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
}

export async function createVenueEventPackage(
	venueId: string,
	body: CreateVenueEventPackageInput,
	accessToken: string,
): Promise<{ data: VenueEventPackageManage }> {
	return apiFetch(`/venues/${venueId}/event-packages`, {
		method: 'POST',
		body: JSON.stringify(body),
		headers: { Authorization: `Bearer ${accessToken}` },
	});
}

export async function patchVenueEventPackage(
	packageId: string,
	body: Partial<CreateVenueEventPackageInput>,
	accessToken: string,
): Promise<{ data: VenueEventPackageManage }> {
	return apiFetch(`/venues/event-packages/${packageId}`, {
		method: 'PATCH',
		body: JSON.stringify(body),
		headers: { Authorization: `Bearer ${accessToken}` },
	});
}

export async function deleteVenueEventPackage(
	packageId: string,
	accessToken: string,
): Promise<void> {
	const res = await fetch(`${API_URL}/venues/event-packages/${packageId}`, {
		method: 'DELETE',
		headers: { Authorization: `Bearer ${accessToken}` },
	});

	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error((body as { error?: string }).error ?? `API ${res.status}`);
	}
}

export async function listVenueReviews(
	venueId: string,
	params: { page?: number; limit?: number } = {},
): Promise<{ data: VenueReview[]; meta: ApiMeta }> {
	const qs = new URLSearchParams();
	if (params.page != null) qs.set('page', String(params.page));
	if (params.limit != null) qs.set('limit', String(params.limit));
	const q = qs.toString();
	return apiFetch(`/venues/${venueId}/reviews${q ? `?${q}` : ''}`);
}

export async function getVenueAvailability(
	venueId: string,
	month?: string,
): Promise<{ data: VenueAvailability }> {
	const qs = month ? `?month=${month}` : '';
	const raw = await apiFetch<{
		data: {
			slots: VenueAvailability['slots'];
			startDate: string;
			endDate: string;
			bookedDates?: string[];
			bookings?: VenueAvailability['bookings'];
		};
	}>(`/venues/${venueId}/availability${qs}`);

	const d = raw.data;
	const bookings =
		d.bookings ??
		(Array.isArray(d.bookedDates)
			? d.bookedDates.map((booking_date, i) => ({
					id: `bd-${i}-${booking_date}`,
					booking_date: booking_date.length >= 10 ? booking_date.slice(0, 10) : booking_date,
					status: 'booked',
				}))
			: []);

	return {
		data: {
			slots: d.slots ?? [],
			bookings,
			startDate: d.startDate,
			endDate: d.endDate,
		},
	};
}

export async function getCategories(): Promise<{ data: Category[] }> {
	return apiFetch('/categories');
}

export async function getCategoryBySlug(slug: string): Promise<{ data: Category }> {
	return apiFetch(`/categories/${slug}`);
}

export async function createOrder(
	payload: CreateOrderPayload,
	accessToken?: string,
): Promise<{ data: { orderId: string; order?: OrderRecord } }> {
	return apiFetch('/orders/make-order', {
		method: 'POST',
		body: JSON.stringify(payload),
		headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
	});
}

export async function listMyOrders(accessToken: string): Promise<{ data: OrderSummary[] }> {
	return apiFetch('/orders', {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
}

export async function listWishlist(
	accessToken: string,
	params: { page?: number; limit?: number } = {},
): Promise<{ data: WishlistRow[]; meta: ApiMeta }> {
	const qs = new URLSearchParams();
	if (params.page != null) qs.set('page', String(params.page));
	if (params.limit != null) qs.set('limit', String(params.limit));
	const q = qs.toString();
	return apiFetch(`/wishlist${q ? `?${q}` : ''}`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
}

export async function addVenueToWishlist(
	venueId: string,
	accessToken: string,
): Promise<{ data: { id?: string; venue_id: string; saved: boolean } }> {
	return apiFetch('/wishlist', {
		method: 'POST',
		body: JSON.stringify({ venue_id: venueId }),
		headers: { Authorization: `Bearer ${accessToken}` },
	});
}

export async function removeVenueFromWishlist(
	venueId: string,
	accessToken: string,
): Promise<{ data: { removed: boolean; venue_id: string } }> {
	return apiFetch(`/wishlist/${venueId}`, {
		method: 'DELETE',
		headers: { Authorization: `Bearer ${accessToken}` },
	});
}

export async function getOrderById(
	orderId: string,
	opts: { accessToken?: string; guestEmail?: string } = {},
): Promise<{ data: OrderRecord } | null> {
	const qs =
		opts.guestEmail != null && opts.guestEmail !== ''
			? `?guestEmail=${encodeURIComponent(opts.guestEmail)}`
			: '';
	const headers: Record<string, string> = { 'Content-Type': 'application/json' };
	if (opts.accessToken) headers.Authorization = `Bearer ${opts.accessToken}`;

	const res = await fetch(`${API_URL}/orders/${orderId}${qs}`, { headers });

	if (res.status === 403 || res.status === 404) return null;
	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error((body as { error?: string }).error ?? `API ${res.status}`);
	}

	return res.json() as Promise<{ data: OrderRecord }>;
}

export async function getProviderStats(accessToken: string): Promise<{ data: ProviderStats }> {
	return apiFetch('/provider/stats', {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
}

export async function listProviderOrders(
	accessToken: string,
	params: { page?: number; limit?: number; status?: string } = {},
): Promise<{ data: ProviderOrderListItem[]; meta: ApiMeta }> {
	const qs = new URLSearchParams();
	if (params.page != null) qs.set('page', String(params.page));
	if (params.limit != null) qs.set('limit', String(params.limit));
	if (params.status) qs.set('status', params.status);
	const q = qs.toString();
	return apiFetch(`/provider/orders${q ? `?${q}` : ''}`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
}

export async function getProviderOrderById(
	orderId: string,
	accessToken: string,
): Promise<{ data: ProviderOrderDetail }> {
	return apiFetch(`/provider/orders/${orderId}`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
}

export type CreateVenuePayload = Omit<CreateVenueFormValues, 'amenities' | 'event_packages'> & {
	amenities?: string[];
	/** Optional — max 30 per venue on POST /venues */
	event_packages?: CreateVenueEventPackageInput[];
};

export async function createVenue(
	payload: CreateVenuePayload,
	accessToken?: string,
): Promise<{ data: VenueDetail }> {
	return apiFetch('/venues', {
		method: 'POST',
		body: JSON.stringify(payload),
		headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
	});
}

export async function getProviderVenues(
	providerId: string,
	accessToken?: string,
): Promise<{ data: VenueListItem[]; meta: ApiMeta }> {
	return apiFetch(`/venues?provider_id=${providerId}`, {
		headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
	});
}

export async function uploadVenueImage(
	file: File,
	accessToken: string,
	onProgress?: (percent: number) => void,
): Promise<{ url: string }> {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		const formData = new FormData();
		formData.append('file', file);

		xhr.open('POST', `${API_URL}/uploads/venue-image`);
		xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);

		xhr.upload.onprogress = (ev) => {
			if (ev.lengthComputable && onProgress) {
				onProgress(Math.round((ev.loaded / ev.total) * 100));
			}
		};

		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				try {
					const body = JSON.parse(xhr.responseText) as { url?: string };
					if (body.url) resolve({ url: body.url });
					else reject(new Error('Сервер буруу хариу өгсөн'));
				} catch {
					reject(new Error('Сервер буруу хариу өгсөн'));
				}
			} else {
				try {
					const body = JSON.parse(xhr.responseText) as { error?: string };
					reject(new Error(body.error ?? `Ачаалахад алдаа (${xhr.status})`));
				} catch {
					reject(new Error(`Ачаалахад алдаа (${xhr.status})`));
				}
			}
		};

		xhr.onerror = () => reject(new Error('Сүлжээний алдаа'));
		xhr.send(formData);
	});
}

export async function getServices(
	params: ServiceListParams = {},
): Promise<{ data: ServiceListItem[]; meta: ApiMeta }> {
	const qs = new URLSearchParams();
	if (params.kind) qs.set('kind', params.kind);
	if (params.search) qs.set('search', params.search);
	if (params.page != null) qs.set('page', String(params.page));
	if (params.limit != null) qs.set('limit', String(params.limit));
	if (params.provider_id) qs.set('provider_id', params.provider_id);
	const q = qs.toString();
	return apiFetch(`/services${q ? `?${q}` : ''}`);
}

export async function getServiceBySlug(slug: string): Promise<{ data: ServiceCatalogDetail }> {
	return apiFetch(`/services/${slug}`);
}

export async function listMyServices(
	accessToken: string,
): Promise<{ data: ServiceManageDetail[] }> {
	return apiFetch('/services/manage', {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
}

export async function getServiceForManage(
	serviceId: string,
	accessToken: string,
): Promise<{ data: ServiceManageDetail }> {
	return apiFetch(`/services/${serviceId}/manage`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
}

export async function createService(
	body: PatchServicePayload & { name: string; kind: string; price_flat: number },
	accessToken: string,
): Promise<{ data: ServiceManageDetail }> {
	return apiFetch('/services', {
		method: 'POST',
		body: JSON.stringify(body),
		headers: { Authorization: `Bearer ${accessToken}` },
	});
}

export async function updateService(
	serviceId: string,
	body: PatchServicePayload,
	accessToken: string,
): Promise<{ data: ServiceManageDetail }> {
	return apiFetch(`/services/${serviceId}`, {
		method: 'PATCH',
		body: JSON.stringify(body),
		headers: { Authorization: `Bearer ${accessToken}` },
	});
}

export async function updateServiceStatus(
	serviceId: string,
	status: ServiceStatus,
	accessToken: string,
): Promise<{ data: ServiceManageDetail }> {
	return apiFetch(`/services/${serviceId}/status`, {
		method: 'PATCH',
		body: JSON.stringify({ status }),
		headers: { Authorization: `Bearer ${accessToken}` },
	});
}

export async function deleteService(
	serviceId: string,
	accessToken: string,
): Promise<{ data: { deleted: boolean; id: string; slug: string; name: string } }> {
	const res = await fetch(`${API_URL}/services/${serviceId}`, {
		method: 'DELETE',
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	const body = await res.json().catch(() => ({}));
	if (!res.ok) {
		throw new Error((body as { error?: string }).error ?? `API ${res.status}`);
	}
	return body as { data: { deleted: boolean; id: string; slug: string; name: string } };
}

export async function listMyEventPlans(
	accessToken: string,
): Promise<{ data: EventPlanSummary[] }> {
	return apiFetch('/event-plans', {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
}

export async function getEventPlanById(
	planId: string,
	accessToken: string,
): Promise<{ data: EventPlanDetail }> {
	return apiFetch(`/event-plans/${planId}`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
}

export async function createEventPlan(
	body: CreateEventPlanPayload,
	accessToken: string,
): Promise<{ data: EventPlanDetail }> {
	return apiFetch('/event-plans', {
		method: 'POST',
		body: JSON.stringify(body),
		headers: { Authorization: `Bearer ${accessToken}` },
	});
}

export async function patchEventPlan(
	planId: string,
	body: PatchEventPlanPayload,
	accessToken: string,
): Promise<{ data: EventPlanDetail }> {
	return apiFetch(`/event-plans/${planId}`, {
		method: 'PATCH',
		body: JSON.stringify(body),
		headers: { Authorization: `Bearer ${accessToken}` },
	});
}

export async function deleteEventPlan(
	planId: string,
	accessToken: string,
): Promise<{ data: { deleted: boolean; id: string } }> {
	const res = await fetch(`${API_URL}/event-plans/${planId}`, {
		method: 'DELETE',
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	const body = await res.json().catch(() => ({}));
	if (!res.ok) {
		throw new Error((body as { error?: string }).error ?? `API ${res.status}`);
	}
	return body as { data: { deleted: boolean; id: string } };
}

export async function setEventPlanVenue(
	planId: string,
	body: SetEventPlanVenuePayload,
	accessToken: string,
): Promise<{ data: EventPlanDetail }> {
	return apiFetch(`/event-plans/${planId}/venue`, {
		method: 'PUT',
		body: JSON.stringify(body),
		headers: { Authorization: `Bearer ${accessToken}` },
	});
}

export async function clearEventPlanVenue(
	planId: string,
	accessToken: string,
): Promise<{ data: EventPlanDetail }> {
	return apiFetch(`/event-plans/${planId}/venue`, {
		method: 'DELETE',
		headers: { Authorization: `Bearer ${accessToken}` },
	});
}

export async function addEventPlanService(
	planId: string,
	body: AddEventPlanServicePayload,
	accessToken: string,
): Promise<{ data: EventPlanDetail }> {
	return apiFetch(`/event-plans/${planId}/services`, {
		method: 'POST',
		body: JSON.stringify(body),
		headers: { Authorization: `Bearer ${accessToken}` },
	});
}

export async function patchEventPlanService(
	planId: string,
	lineId: string,
	body: PatchEventPlanServicePayload,
	accessToken: string,
): Promise<{ data: EventPlanDetail }> {
	return apiFetch(`/event-plans/${planId}/services/${lineId}`, {
		method: 'PATCH',
		body: JSON.stringify(body),
		headers: { Authorization: `Bearer ${accessToken}` },
	});
}

export async function removeEventPlanService(
	planId: string,
	lineId: string,
	accessToken: string,
): Promise<{ data: EventPlanDetail }> {
	return apiFetch(`/event-plans/${planId}/services/${lineId}`, {
		method: 'DELETE',
		headers: { Authorization: `Bearer ${accessToken}` },
	});
}

export async function checkoutEventPlan(
	planId: string,
	body: EventPlanCheckoutPayload,
	accessToken: string,
): Promise<{ data: { orderId: string } }> {
	return apiFetch(`/event-plans/${planId}/checkout`, {
		method: 'POST',
		body: JSON.stringify(body),
		headers: { Authorization: `Bearer ${accessToken}` },
	});
}
