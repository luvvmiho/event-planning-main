'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createVenue, deleteVenue, updateVenue, updateVenueStatus } from '@/lib/api'
import { getAuthenticatedProfile } from '@/lib/auth/session-context'
import type { CreateVenueFormValues, PatchVenuePayload, VenueStatus } from '@/lib/types'
import type { UpdateVenueFormValues } from '@/lib/validations/venue'
import {
	createVenueSchema,
	editVenueFormSchema,
	mapEventPackagesToApi,
	mapUpdateVenueFormToApi,
} from '@/lib/validations/venue'

export type VenueActionState = { error: string } | null

const requireProviderSession = async () => {
	const ctx = await getAuthenticatedProfile()
	if (!ctx?.session) return { error: 'Нэвтрэх шаардлагатай' as const, session: null }
	if (ctx.userType !== 'provider') {
		return { error: 'Зөвхөн үйлчилгээ үзүүлэгч энэ үйлдлийг хийх боломжтой' as const, session: null }
	}
	return { error: null, session: ctx.session }
}

export async function submitCreateVenue(
	values: CreateVenueFormValues,
): Promise<VenueActionState> {
	const parsed = createVenueSchema.safeParse(values)
	if (!parsed.success) {
		const first = parsed.error.errors[0]
		return { error: first?.message ?? 'Формын мэдээлэл буруу байна' }
	}

	const auth = await requireProviderSession()
	if (auth.error || !auth.session) return { error: auth.error ?? 'Нэвтрэх шаардлагатай' }

	const { amenities, image_url, images = [], event_packages = [], ...rest } = parsed.data
	const amenitiesList = amenities
		? amenities
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean)
		: []

	const primary = (image_url && image_url.trim()) || images[0]
	const gallery = primary ? images.filter((u) => u !== primary) : [...images]
	const mappedPackages = mapEventPackagesToApi(event_packages)

	let venueId: string
	try {
		const { data } = await createVenue(
			{
				...rest,
				image_url: primary,
				images: gallery,
				amenities: amenitiesList,
				...(mappedPackages.length > 0 ? { event_packages: mappedPackages } : {}),
			},
			auth.session.access_token,
		)
		venueId = data.id
	} catch (err) {
		return { error: err instanceof Error ? err.message : 'Байршил үүсгэхэд алдаа гарлаа' }
	}

	revalidatePath('/provider/venues')
	redirect(`/provider/venues/${venueId}/edit`)
}

export async function submitUpdateVenue(
	venueId: string,
	values: UpdateVenueFormValues,
): Promise<VenueActionState> {
	const parsed = editVenueFormSchema.safeParse(values)
	if (!parsed.success) {
		const first = parsed.error.errors[0]
		return { error: first?.message ?? 'Формын мэдээлэл буруу байна' }
	}

	const auth = await requireProviderSession()
	if (auth.error || !auth.session) return { error: auth.error ?? 'Нэвтрэх шаардлагатай' }

	const payload = mapUpdateVenueFormToApi(parsed.data)
	if (Object.keys(payload).length === 0) {
		return { error: 'Шинэчлэх талбар алга байна' }
	}

	try {
		await updateVenue(venueId, payload as PatchVenuePayload, auth.session.access_token)
	} catch (err) {
		return { error: err instanceof Error ? err.message : 'Байршил шинэчлэгдсэнгүй' }
	}

	revalidatePath('/provider/venues')
	revalidatePath(`/provider/venues/${venueId}/edit`)
	revalidatePath('/venues')
	return null
}

export async function submitUpdateVenueStatus(
	venueId: string,
	status: VenueStatus,
): Promise<{ ok: true } | { ok: false; error: string }> {
	const auth = await requireProviderSession()
	if (auth.error || !auth.session) return { ok: false, error: auth.error ?? 'Нэвтрэх шаардлагатай' }

	try {
		await updateVenueStatus(venueId, status, auth.session.access_token)
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : 'Төлөв шинэчлэгдсэнгүй',
		}
	}

	revalidatePath('/provider/venues')
	revalidatePath(`/provider/venues/${venueId}/edit`)
	revalidatePath('/venues')
	return { ok: true }
}

export async function submitDeleteVenue(
	venueId: string,
): Promise<{ ok: false; error: string } | void> {
	const auth = await requireProviderSession()
	if (auth.error || !auth.session) return { ok: false, error: auth.error ?? 'Нэвтрэх шаардлагатай' }

	try {
		await deleteVenue(venueId, auth.session.access_token)
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : 'Байршил устгагдаагүй',
		}
	}

	revalidatePath('/provider/venues')
	redirect('/provider/venues')
}
