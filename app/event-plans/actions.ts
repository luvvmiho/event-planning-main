'use server'

import {
	addEventPlanService,
	checkoutEventPlan,
	clearEventPlanVenue,
	createEventPlan,
	deleteEventPlan,
	patchEventPlan,
	patchEventPlanService,
	removeEventPlanService,
	setEventPlanVenue,
} from '@/lib/api'
import { getVerifiedSession } from '@/lib/auth/session-context'
import {
	addEventPlanServiceSchema,
	createEventPlanSchema,
	eventPlanCheckoutSchema,
	patchEventPlanSchema,
	patchEventPlanServiceSchema,
	setEventPlanVenueSchema,
} from '@/lib/validations/event-plan'
import { revalidatePath } from 'next/cache'

const requireSession = async () => {
	const ctx = await getVerifiedSession()
	if (!ctx) return null
	return ctx.session.access_token
}

export async function createEventPlanAction(payload: unknown) {
	const accessToken = await requireSession()
	if (!accessToken) return { ok: false as const, error: 'Нэвтэрнэ үү' }

	const parsed = createEventPlanSchema.safeParse(payload)
	if (!parsed.success) {
		return { ok: false as const, error: 'Мэдээлэл буруу байна' }
	}

	try {
		const { data } = await createEventPlan(parsed.data, accessToken)
		revalidatePath('/event-plans')
		return { ok: true as const, planId: data.id }
	} catch (err) {
		return {
			ok: false as const,
			error: err instanceof Error ? err.message : 'Төлөвлөгөө үүсгэгдсэнгүй',
		}
	}
}

export async function patchEventPlanAction(planId: string, payload: unknown) {
	const accessToken = await requireSession()
	if (!accessToken) return { ok: false as const, error: 'Нэвтэрнэ үү' }

	const parsed = patchEventPlanSchema.safeParse(payload)
	if (!parsed.success) {
		return { ok: false as const, error: 'Мэдээлэл буруу байна' }
	}

	try {
		await patchEventPlan(planId, parsed.data, accessToken)
		revalidatePath('/event-plans')
		revalidatePath(`/event-plans/${planId}`)
		return { ok: true as const }
	} catch (err) {
		return {
			ok: false as const,
			error: err instanceof Error ? err.message : 'Хадгалагдаагүй',
		}
	}
}

export async function deleteEventPlanAction(planId: string) {
	const accessToken = await requireSession()
	if (!accessToken) return { ok: false as const, error: 'Нэвтэрнэ үү' }

	try {
		await deleteEventPlan(planId, accessToken)
		revalidatePath('/event-plans')
		return { ok: true as const }
	} catch (err) {
		return {
			ok: false as const,
			error: err instanceof Error ? err.message : 'Устгагдаагүй',
		}
	}
}

export async function setEventPlanVenueAction(planId: string, payload: unknown) {
	const accessToken = await requireSession()
	if (!accessToken) return { ok: false as const, error: 'Нэвтэрнэ үү' }

	const parsed = setEventPlanVenueSchema.safeParse(payload)
	if (!parsed.success) {
		return { ok: false as const, error: 'Мэдээлэл буруу байна' }
	}

	try {
		await setEventPlanVenue(planId, parsed.data, accessToken)
		revalidatePath(`/event-plans/${planId}`)
		return { ok: true as const }
	} catch (err) {
		return {
			ok: false as const,
			error: err instanceof Error ? err.message : 'Танхим хадгалагдаагүй',
		}
	}
}

export async function clearEventPlanVenueAction(planId: string) {
	const accessToken = await requireSession()
	if (!accessToken) return { ok: false as const, error: 'Нэвтэрнэ үү' }

	try {
		await clearEventPlanVenue(planId, accessToken)
		revalidatePath(`/event-plans/${planId}`)
		return { ok: true as const }
	} catch (err) {
		return {
			ok: false as const,
			error: err instanceof Error ? err.message : 'Танхим цуцлагдаагүй',
		}
	}
}

export async function addEventPlanServiceAction(planId: string, payload: unknown) {
	const accessToken = await requireSession()
	if (!accessToken) return { ok: false as const, error: 'Нэвтэрнэ үү' }

	const parsed = addEventPlanServiceSchema.safeParse(payload)
	if (!parsed.success) {
		return { ok: false as const, error: 'Мэдээлэл буруу байна' }
	}

	try {
		await addEventPlanService(planId, parsed.data, accessToken)
		revalidatePath(`/event-plans/${planId}`)
		return { ok: true as const }
	} catch (err) {
		return {
			ok: false as const,
			error: err instanceof Error ? err.message : 'Үйлчилгээ нэмэгдээгүй',
		}
	}
}

export async function patchEventPlanServiceAction(
	planId: string,
	lineId: string,
	payload: unknown,
) {
	const accessToken = await requireSession()
	if (!accessToken) return { ok: false as const, error: 'Нэвтэрнэ үү' }

	const parsed = patchEventPlanServiceSchema.safeParse(payload)
	if (!parsed.success) {
		return { ok: false as const, error: 'Мэдээлэл буруу байна' }
	}

	try {
		await patchEventPlanService(planId, lineId, parsed.data, accessToken)
		revalidatePath(`/event-plans/${planId}`)
		return { ok: true as const }
	} catch (err) {
		return {
			ok: false as const,
			error: err instanceof Error ? err.message : 'Хадгалагдаагүй',
		}
	}
}

export async function removeEventPlanServiceAction(planId: string, lineId: string) {
	const accessToken = await requireSession()
	if (!accessToken) return { ok: false as const, error: 'Нэвтэрнэ үү' }

	try {
		await removeEventPlanService(planId, lineId, accessToken)
		revalidatePath(`/event-plans/${planId}`)
		return { ok: true as const }
	} catch (err) {
		return {
			ok: false as const,
			error: err instanceof Error ? err.message : 'Устгагдаагүй',
		}
	}
}

export async function checkoutEventPlanAction(planId: string, payload: unknown) {
	const accessToken = await requireSession()
	if (!accessToken) return { ok: false as const, error: 'Нэвтэрнэ үү' }

	const parsed = eventPlanCheckoutSchema.safeParse(payload)
	if (!parsed.success) {
		return { ok: false as const, error: 'Мэдээлэл буруу байна. Формоо шалгана уу.' }
	}

	try {
		const { data } = await checkoutEventPlan(planId, parsed.data, accessToken)
		revalidatePath('/event-plans')
		revalidatePath('/orders')
		return { ok: true as const, orderId: data.orderId }
	} catch (err) {
		return {
			ok: false as const,
			error: err instanceof Error ? err.message : 'Захиалга хадгалагдаагүй',
		}
	}
}
