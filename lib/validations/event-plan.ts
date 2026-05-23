import { z } from 'zod'
import { checkoutFormSchema } from '@/lib/validations/checkout'

export const createEventPlanSchema = z.object({
	budget: z.number().int().positive('Төсөв 0-ээс их байх ёстой'),
	name: z.string().max(120).optional(),
	event_date: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, 'Зөв огноо оруулна уу')
		.optional(),
	guest_count: z.number().int().positive('Зочдын тоо 1-ээс их байх ёстой').optional(),
	notes: z.string().max(500).optional(),
})

export const patchEventPlanSchema = createEventPlanSchema.partial()

export const setEventPlanVenueSchema = z.object({
	venue_id: z.string().uuid('Танхим сонгоно уу'),
	venue_package_id: z.string().uuid().optional(),
	venue_guest_count: z.number().int().positive('Зочдын тоо 1-ээс их байх ёстой'),
	venue_booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Зөв огноо оруулна уу'),
})

export const addEventPlanServiceSchema = z.object({
	provider_service_id: z.string().uuid('Үйлчилгээ сонгоно уу'),
	quantity: z.number().int().positive('Тоо ширхэг 1-ээс их байх ёстой'),
})

export const patchEventPlanServiceSchema = z.object({
	quantity: z.number().int().positive('Тоо ширхэг 1-ээс их байх ёстой'),
})

export const eventPlanCheckoutSchema = checkoutFormSchema
