import type { ServiceKind } from '@/lib/types'

const KIND_LABELS: Record<ServiceKind, string> = {
	car: 'Тээврийн үйлчилгээ',
	cake: 'Бялуу & амттан',
	photoshoot: 'Зураг авалт',
	entertainment: 'Хөгжим & тоглоом',
	decoration: 'Чимэглэл',
	catering: 'Хоол үйлчилгээ',
	other: 'Бусад',
}

export const serviceKindLabelMn = (kind: ServiceKind): string => KIND_LABELS[kind] ?? kind

export const SERVICE_KIND_OPTIONS: { value: ServiceKind; label: string }[] = (
	Object.entries(KIND_LABELS) as [ServiceKind, string][]
).map(([value, label]) => ({ value, label }))

/** Map legacy marketplace category slugs → API `kind` filter */
export const MARKETPLACE_SLUG_TO_KIND: Partial<Record<string, ServiceKind>> = {
	catering: 'catering',
	decoration: 'decoration',
	photography: 'photoshoot',
	transportation: 'car',
	bakery: 'cake',
	entertainment: 'entertainment',
	others: 'other',
}
