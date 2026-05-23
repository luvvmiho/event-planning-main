import type {
	CreateVenueEventPackageInput,
	EventPackagePatchInput,
	VenueEventPackageManage,
} from '@/lib/types';
import { z } from 'zod';

const packageKindSchema = z.enum(['food', 'cake', 'entertainment', 'decoration', 'staff', 'other']);

const catalogPackageServiceFormSchema = z.object({
	source: z.literal('catalog'),
	provider_service_id: z.string().uuid('Үйлчилгээ сонгоно уу'),
	catalogName: z.string().optional(),
	catalogPriceFlat: z.coerce.number().optional(),
	description: z.string().optional(),
	quantity: z.coerce.number().int().min(1, 'Хамгийн багадаа 1').default(1),
	is_included: z.boolean().default(true),
});

const customPackageServiceFormSchema = z.object({
	source: z.literal('custom'),
	kind: packageKindSchema,
	title: z.string().min(1, 'Үйлчилгээний нэр оруулна уу'),
	description: z.string().optional(),
	quantity: z.coerce.number().int().min(1, 'Хамгийн багадаа 1').default(1),
	is_included: z.boolean().default(true),
});

export const venuePackageServiceFormSchema = z.discriminatedUnion('source', [
	catalogPackageServiceFormSchema,
	customPackageServiceFormSchema,
]);

export const venueEventPackageFormSchema = z.object({
	id: z.string().uuid().optional(),
	name: z.string().min(2, 'Багцын нэр хамгийн багадаа 2 тэмдэгт'),
	price_flat: z.coerce.number().int().min(0, 'Багцын үнэ оруулна уу'),
	short_description: z.string().max(1000, 'Хамгийн ихдээ 1000 тэмдэгт').optional(),
	guests_min: z.preprocess(
		(v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
		z.number().int().min(1).optional().nullable(),
	),
	guests_max: z.preprocess(
		(v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
		z.number().int().min(1).optional().nullable(),
	),
	is_active: z.boolean().default(true),
	services: z.array(venuePackageServiceFormSchema).default([]),
});

export const createVenueSchema = z
	.object({
		name: z.string().min(2, 'Нэр хамгийн багадаа 2 тэмдэгт байх ёстой'),
		short_description: z.string().optional(),
		description: z.string().optional(),
		category_id: z.string().min(1, 'Ангилал сонгоно уу'),
		location: z.string().min(2, 'Байршил оруулна уу'),
		district: z.preprocess(
			(v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
			z.string().optional(),
		),
		address: z.string().optional(),
		lat: z.number().min(-90, 'Өргөрөг -90 … 90').max(90, 'Өргөрөг -90 … 90').optional(),
		long: z.number().min(-180, 'Уртраг -180 … 180').max(180, 'Уртраг -180 … 180').optional(),
		capacity_min: z.coerce.number().min(1, 'Хамгийн бага хүн тоо оруулна уу'),
		capacity_max: z.coerce.number().min(1, 'Хамгийн их хүн тоо оруулна уу'),
		price_per_person: z.coerce.number().min(0, 'Үнэ оруулна уу'),
		contact_phone: z.string().optional(),
		contact_email: z.string().email('Зөв и-мэйл хаяг оруулна уу').optional().or(z.literal('')),
		website: z.string().optional(),
		amenities: z.string().optional(),
		image_url: z.preprocess(
			(v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
			z.string().url('Зургийн холбоос буруу байна').optional(),
		),
		images: z
			.array(z.string().url('Зургийн холбоос буруу байна'))
			.max(20, 'Хамгийн ихдээ 20 зураг')
			.optional(),
		event_packages: z
			.array(venueEventPackageFormSchema)
			.max(30, 'Нэг танхимд хамгийн ихдээ 30 багц')
			.optional()
			.default([]),
	})
	.refine((data) => data.capacity_max >= data.capacity_min, {
		message: 'Хамгийн их хүн тоо хамгийн бага тоотой тэнцүү буюу их байх ёстой',
		path: ['capacity_max'],
	})
	.superRefine((data, ctx) => {
		const hasLat = data.lat != null && Number.isFinite(data.lat);
		const hasLong = data.long != null && Number.isFinite(data.long);
		if (hasLat !== hasLong) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Өргөрөг, уртрагыг газрын зураг дээр хамтад нь сонгоно уу',
				path: ['lat'],
			});
			return;
		}
		if (!hasLat || !hasLong) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Газрын зураг дээр дарж байршлаа сонгоно уу',
				path: ['lat'],
			});
		}

		const packages = data.event_packages ?? [];
		for (const [i, pkg] of packages.entries()) {
			if (pkg.guests_min != null && pkg.guests_max != null && pkg.guests_max < pkg.guests_min) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Хамгийн их зочид хамгийн бага тоотой тэнцүү буюу их байх ёстой',
					path: ['event_packages', i, 'guests_max'],
				});
			}
		}
	});

export const mapEventPackagesToApi = (
	packages: z.infer<typeof venueEventPackageFormSchema>[],
): EventPackagePatchInput[] =>
	packages.map((pkg, sort_order) => ({
		...(pkg.id ? { id: pkg.id } : {}),
		name: pkg.name.trim(),
		price_flat: pkg.price_flat,
		...(pkg.short_description?.trim() ? { short_description: pkg.short_description.trim() } : {}),
		guests_min: pkg.guests_min ?? null,
		guests_max: pkg.guests_max ?? null,
		is_active: pkg.is_active,
		sort_order,
		services: (pkg.services ?? []).map((s, serviceOrder) => {
			const base = {
				quantity: s.quantity,
				is_included: s.is_included,
				sort_order: serviceOrder,
				...(s.description?.trim() ? { description: s.description.trim() } : {}),
			};
			if (s.source === 'catalog') {
				return { provider_service_id: s.provider_service_id, ...base };
			}
			return { kind: s.kind, title: s.title.trim(), ...base };
		}),
	}));

export const mapManagePackagesToForm = (
	packages: VenueEventPackageManage[],
): z.infer<typeof venueEventPackageFormSchema>[] =>
	[...packages]
		.sort((a, b) => a.sort_order - b.sort_order)
		.map((pkg) => ({
			id: pkg.id,
			name: pkg.name,
			price_flat: pkg.price_flat,
			short_description: pkg.short_description ?? '',
			guests_min: pkg.guests_min,
			guests_max: pkg.guests_max,
			is_active: pkg.is_active,
			services: (pkg.venue_package_services ?? [])
				.sort((a, b) => a.sort_order - b.sort_order)
				.map((s) => {
					if (s.provider_service_id) {
						return {
							source: 'catalog' as const,
							provider_service_id: s.provider_service_id,
							catalogName: s.provider_services?.name ?? s.title,
							catalogPriceFlat: s.provider_services?.price_flat,
							description: s.description ?? undefined,
							quantity: s.quantity ?? 1,
							is_included: s.is_included,
						};
					}
					return {
						source: 'custom' as const,
						kind: s.kind as z.infer<typeof customPackageServiceFormSchema>['kind'],
						title: s.title,
						description: s.description ?? undefined,
						quantity: s.quantity ?? 1,
						is_included: s.is_included,
					};
				}),
		}));

export const editVenueFormSchema = createVenueSchema;

const venueCoreFieldsSchema = z.object({
	name: z.string().min(2, 'Нэр хамгийн багадаа 2 тэмдэгт байх ёстой'),
	short_description: z.string().optional(),
	description: z.string().optional(),
	location: z.string().min(2, 'Байршил оруулна уу'),
	district: z.preprocess(
		(v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
		z.string().optional(),
	),
	address: z.string().optional(),
	lat: z.number().min(-90, 'Өргөрөг -90 … 90').max(90, 'Өргөрөг -90 … 90').optional(),
	long: z.number().min(-180, 'Уртраг -180 … 180').max(180, 'Уртраг -180 … 180').optional(),
	capacity_min: z.coerce.number().min(1, 'Хамгийн бага хүн тоо оруулна уу'),
	capacity_max: z.coerce.number().min(1, 'Хамгийн их хүн тоо оруулна уу'),
	price_per_person: z.coerce.number().min(0, 'Үнэ оруулна уу'),
	contact_phone: z.string().optional(),
	contact_email: z.string().email('Зөв и-мэйл хаяг оруулна уу').optional().or(z.literal('')),
	website: z.string().optional(),
	amenities: z.string().optional(),
	image_url: z.preprocess(
		(v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
		z.string().url('Зургийн холбоос буруу байна').optional(),
	),
	images: z
		.array(z.string().url('Зургийн холбоос буруу байна'))
		.max(20, 'Хамгийн ихдээ 20 зураг')
		.optional(),
});

const applyVenueLatLongRules = (
	data: { lat?: number; long?: number; capacity_min?: number; capacity_max?: number },
	ctx: z.RefinementCtx,
) => {
	if (
		data.capacity_min != null &&
		data.capacity_max != null &&
		data.capacity_max < data.capacity_min
	) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: 'Хамгийн их хүн тоо хамгийн бага тоотой тэнцүү буюу их байх ёстой',
			path: ['capacity_max'],
		});
	}

	const hasLat = data.lat != null && Number.isFinite(data.lat);
	const hasLong = data.long != null && Number.isFinite(data.long);
	if (hasLat !== hasLong) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: 'Өргөрөг, уртрагыг газрын зураг дээр хамтад нь сонгоно уу',
			path: ['lat'],
		});
	}
};

export const updateVenueSchema = venueCoreFieldsSchema
	.partial()
	.superRefine((data, ctx) => applyVenueLatLongRules(data, ctx));

export type UpdateVenueFormValues = z.infer<typeof editVenueFormSchema>;

export const mapUpdateVenueFormToApi = (values: UpdateVenueFormValues): Record<string, unknown> => {
	const { amenities, image_url, images, category_id: _c, event_packages = [], ...rest } = values;
	const payload: Record<string, unknown> = {};

	for (const [k, v] of Object.entries(rest)) {
		if (v !== undefined && v !== '') payload[k] = v;
	}

	if (amenities !== undefined) {
		payload.amenities = amenities
			? amenities
					.split(',')
					.map((s) => s.trim())
					.filter(Boolean)
			: [];
	}

	const primary = (image_url && image_url.trim()) || images?.[0];
	if (image_url !== undefined || images !== undefined) {
		payload.image_url = primary;
		payload.images = primary ? (images ?? []).filter((u) => u !== primary) : (images ?? []);
	}

	payload.event_packages = mapEventPackagesToApi(event_packages);

	return payload;
};
