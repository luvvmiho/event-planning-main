'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

const submitSchema = z.object({
	venueId: z.string().uuid(),
	slug: z.string().min(1),
	rating: z.number().int().min(1).max(5),
	comment: z.string().max(2000).optional(),
})

export const submitVenueReview = async (
	payload: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> => {
	const parsed = submitSchema.safeParse(payload)
	if (!parsed.success) {
		return { ok: false, error: 'Мэдээлэл буруу байна' }
	}

	const supabase = await createClient()
	const {
		data: { session },
	} = await supabase.auth.getSession()

	if (!session?.access_token) {
		return { ok: false, error: 'Сэтгэгдэл үлдээхийн тулд нэвтэрнэ үү' }
	}

	const { venueId, slug, rating, comment } = parsed.data
	const res = await fetch(`${API_URL}/venues/${venueId}/reviews`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${session.access_token}`,
		},
		body: JSON.stringify({
			rating,
			comment: comment?.trim() || undefined,
		}),
	})

	const body = (await res.json().catch(() => ({}))) as { error?: string }

	if (!res.ok) {
		return { ok: false, error: body.error ?? 'Сэтгэгдэл хадгалагдаагүй байна' }
	}

	revalidatePath(`/venues/${slug}`)
	return { ok: true }
}

const wishlistVenueSchema = z.object({
	venueId: z.string().uuid(),
	slug: z.string().min(1),
})

export const addVenueToWishlistAction = async (
	payload: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> => {
	const parsed = wishlistVenueSchema.safeParse(payload)
	if (!parsed.success) {
		return { ok: false, error: 'Мэдээлэл буруу байна' }
	}

	const supabase = await createClient()
	const {
		data: { session },
	} = await supabase.auth.getSession()

	if (!session?.access_token) {
		return { ok: false, error: 'Нэвтэрсний дараа хадгална уу' }
	}

	const { venueId, slug } = parsed.data
	const res = await fetch(`${API_URL}/wishlist`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${session.access_token}`,
		},
		body: JSON.stringify({ venue_id: venueId }),
	})

	const body = (await res.json().catch(() => ({}))) as { error?: string }

	if (!res.ok) {
		return { ok: false, error: body.error ?? 'Хадгалахад алдаа гарлаа' }
	}

	revalidatePath(`/venues/${slug}`)
	revalidatePath('/profile/wishlist')
	return { ok: true }
}

export const removeVenueFromWishlistAction = async (
	payload: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> => {
	const parsed = wishlistVenueSchema.safeParse(payload)
	if (!parsed.success) {
		return { ok: false, error: 'Мэдээлэл буруу байна' }
	}

	const supabase = await createClient()
	const {
		data: { session },
	} = await supabase.auth.getSession()

	if (!session?.access_token) {
		return { ok: false, error: 'Нэвтэрсний дараа үйлдэл хийнэ үү' }
	}

	const { venueId, slug } = parsed.data
	const res = await fetch(`${API_URL}/wishlist/${venueId}`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${session.access_token}`,
		},
	})

	const body = (await res.json().catch(() => ({}))) as { error?: string }

	if (!res.ok) {
		return { ok: false, error: body.error ?? 'Хадгалснаас хасахад алдаа гарлаа' }
	}

	revalidatePath(`/venues/${slug}`)
	revalidatePath('/profile/wishlist')
	return { ok: true }
}

