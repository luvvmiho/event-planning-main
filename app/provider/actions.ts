'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export type ProviderOrderStatus = 'pending' | 'paid' | 'cancelled'

export const updateProviderOrderStatus = async (
	orderId: string,
	status: ProviderOrderStatus,
): Promise<{ ok: true } | { ok: false; error: string }> => {
	const supabase = await createClient()
	const {
		data: { session },
	} = await supabase.auth.getSession()

	if (!session?.access_token) {
		return { ok: false, error: 'Нэвтрэх шаардлагатай' }
	}

	const res = await fetch(`${API_URL}/provider/orders/${orderId}/status`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${session.access_token}`,
		},
		body: JSON.stringify({ status }),
	})

	const body = (await res.json().catch(() => ({}))) as { error?: string }

	if (!res.ok) {
		return { ok: false, error: body.error ?? 'Төлөв шинэчлэгдсэнгүй' }
	}

	revalidatePath('/provider')
	revalidatePath('/provider/orders')
	revalidatePath(`/provider/orders/${orderId}`)
	return { ok: true }
}
