import { z } from 'zod'
import { SERVICE_KIND_OPTIONS } from '@/lib/service-labels'

const serviceKindSchema = z.enum(
	SERVICE_KIND_OPTIONS.map((o) => o.value) as [
		'car',
		'cake',
		'photoshoot',
		'entertainment',
		'decoration',
		'catering',
		'other',
	],
)

export const createServiceSchema = z.object({
	name: z.string().min(2, 'Нэр хамгийн багадаа 2 тэмдэгт байх ёстой'),
	kind: serviceKindSchema,
	price_flat: z.coerce.number().int().min(0, 'Үнэ оруулна уу'),
	short_description: z.string().max(500).optional(),
	description: z.string().optional(),
	location: z.string().optional(),
	image_url: z.preprocess(
		(v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
		z.string().url('Зургийн холбоос буруу байна').optional(),
	),
	images: z
		.array(z.string().url('Зургийн холбоос буруу байна'))
		.max(12, 'Хамгийн ихдээ 12 зураг')
		.optional(),
	sort_order: z.coerce.number().int().min(0).optional(),
})

export const editServiceFormSchema = createServiceSchema

export type CreateServiceFormValues = z.infer<typeof createServiceSchema>

export const mapUpdateServiceFormToApi = (
	values: CreateServiceFormValues,
): Record<string, unknown> => {
	const { image_url, images, ...rest } = values
	const payload: Record<string, unknown> = {}

	for (const [k, v] of Object.entries(rest)) {
		if (v !== undefined && v !== '') payload[k] = v
	}

	if (image_url !== undefined) payload.image_url = image_url
	if (images !== undefined) payload.images = images

	return payload
}

export const mapManageServiceToForm = (
	service: import('@/lib/types').ServiceManageDetail,
): CreateServiceFormValues => ({
	name: service.name,
	kind: service.kind,
	price_flat: service.price_flat,
	short_description: service.short_description ?? '',
	description: service.description ?? '',
	location: service.location ?? '',
	image_url: service.image_url ?? '',
	images: service.images ?? [],
	sort_order: service.sort_order,
})
