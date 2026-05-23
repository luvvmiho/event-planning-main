'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
	createService,
	deleteService,
	updateService,
	updateServiceStatus,
} from '@/lib/api'
import { getAuthenticatedProfile } from '@/lib/auth/session-context'
import type { PatchServicePayload, ServiceStatus } from '@/lib/types'
import type { CreateServiceFormValues } from '@/lib/validations/service'
import {
	createServiceSchema,
	editServiceFormSchema,
	mapUpdateServiceFormToApi,
} from '@/lib/validations/service'

export type ServiceActionState = { error: string } | null

const requireProviderSession = async () => {
	const ctx = await getAuthenticatedProfile()
	if (!ctx?.session) return { error: 'Нэвтрэх шаардлагатай' as const, session: null }
	if (ctx.userType !== 'provider') {
		return { error: 'Зөвхөн үйлчилгээ үзүүлэгч энэ үйлдлийг хийх боломжтой' as const, session: null }
	}
	return { error: null, session: ctx.session }
}

export async function submitCreateService(
	values: CreateServiceFormValues,
): Promise<ServiceActionState> {
	const parsed = createServiceSchema.safeParse(values)
	if (!parsed.success) {
		const first = parsed.error.errors[0]
		return { error: first?.message ?? 'Формын мэдээлэл буруу байна' }
	}

	const auth = await requireProviderSession()
	if (auth.error || !auth.session) return { error: auth.error ?? 'Нэвтрэх шаардлагатай' }

	const { image_url, images = [], ...rest } = parsed.data
	const primary = (image_url && image_url.trim()) || images[0]
	const gallery = primary ? images.filter((u) => u !== primary) : [...images]

	let serviceId: string
	try {
		const { data } = await createService(
			{
				...rest,
				image_url: primary,
				images: gallery,
			},
			auth.session.access_token,
		)
		serviceId = data.id
	} catch (err) {
		return { error: err instanceof Error ? err.message : 'Үйлчилгээ үүсгэхэд алдаа гарлаа' }
	}

	revalidatePath('/provider/services')
	redirect(`/provider/services/${serviceId}/edit`)
}

export async function submitUpdateService(
	serviceId: string,
	values: CreateServiceFormValues,
): Promise<ServiceActionState> {
	const parsed = editServiceFormSchema.safeParse(values)
	if (!parsed.success) {
		const first = parsed.error.errors[0]
		return { error: first?.message ?? 'Формын мэдээлэл буруу байна' }
	}

	const auth = await requireProviderSession()
	if (auth.error || !auth.session) return { error: auth.error ?? 'Нэвтрэх шаардлагатай' }

	const payload = mapUpdateServiceFormToApi(parsed.data) as PatchServicePayload
	if (Object.keys(payload).length === 0) {
		return { error: 'Шинэчлэх талбар алга байна' }
	}

	try {
		await updateService(serviceId, payload, auth.session.access_token)
	} catch (err) {
		return { error: err instanceof Error ? err.message : 'Үйлчилгээ шинэчлэгдсэнгүй' }
	}

	revalidatePath('/provider/services')
	revalidatePath(`/provider/services/${serviceId}/edit`)
	revalidatePath('/services')
	return null
}

export async function submitUpdateServiceStatus(
	serviceId: string,
	status: ServiceStatus,
): Promise<{ ok: true } | { ok: false; error: string }> {
	const auth = await requireProviderSession()
	if (auth.error || !auth.session) return { ok: false, error: auth.error ?? 'Нэвтрэх шаардлагатай' }

	try {
		await updateServiceStatus(serviceId, status, auth.session.access_token)
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : 'Төлөв шинэчлэгдсэнгүй',
		}
	}

	revalidatePath('/provider/services')
	revalidatePath(`/provider/services/${serviceId}/edit`)
	revalidatePath('/services')
	return { ok: true }
}

export async function submitDeleteService(
	serviceId: string,
): Promise<{ ok: false; error: string } | void> {
	const auth = await requireProviderSession()
	if (auth.error || !auth.session) return { ok: false, error: auth.error ?? 'Нэвтрэх шаардлагатай' }

	try {
		await deleteService(serviceId, auth.session.access_token)
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : 'Үйлчилгээ устгагдаагүй',
		}
	}

	revalidatePath('/provider/services')
	revalidatePath('/services')
	redirect('/provider/services')
}
