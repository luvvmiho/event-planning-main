import { z } from 'zod'
import type { CheckoutFormValues, CheckoutLineItemInput, CheckoutPayload } from '@/lib/types'

export type { CheckoutFormValues, CheckoutLineItemInput, CheckoutPayload }

export const paymentMethodSchema = z.enum(['qpay', 'bank_transfer'])

export const checkoutFormSchema = z.object({
	fullName: z.string().min(2, 'Хамгийн багадаа 2 тэмдэгт'),
	email: z.string().email('Зөв и-мэйл оруулна уу'),
	phone: z
		.string()
		.min(8, 'Утасны дугаар оруулна уу')
		.regex(/^[\d+\s-]+$/, 'Зөв утасны дугаар оруулна уу'),
	notes: z.string().max(500).optional(),
	paymentMethod: paymentMethodSchema,
})

const checkoutVenueLineSchema = z.object({
	itemType: z.literal('venue'),
	id: z.string(),
	venueId: z.string(),
	name: z.string(),
	providerLabel: z.string(),
	category: z.string(),
	categoryLabel: z.string(),
	image: z.string().optional().default(''),
	price: z.number().int().nonnegative(),
	bookingDate: z.string(),
	guestCount: z.number().int().positive(),
	packageId: z.string().uuid().optional(),
})

const checkoutServiceLineSchema = z.object({
	itemType: z.literal('service'),
	id: z.string(),
	serviceId: z.string(),
	name: z.string(),
	providerLabel: z.string(),
	category: z.string(),
	categoryLabel: z.string(),
	image: z.string().optional().default(''),
	price: z.number().int().nonnegative(),
	bookingDate: z.string(),
	quantity: z.number().int().positive(),
})

export const checkoutLineItemSchema = z.discriminatedUnion('itemType', [
	checkoutVenueLineSchema,
	checkoutServiceLineSchema,
])

export const checkoutPayloadSchema = z.object({
	form: checkoutFormSchema,
	items: z.array(checkoutLineItemSchema).min(1),
	subtotal: z.number().int().nonnegative(),
	total: z.number().int().nonnegative(),
})
