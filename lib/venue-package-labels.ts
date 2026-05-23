import type { VenuePackageServiceKind } from '@/lib/types';

const KIND_LABELS: Record<VenuePackageServiceKind, string> = {
	food: 'Хоол',
	cake: 'Бялуу',
	entertainment: 'Энтертэйнмент',
	decoration: 'Чимэглэл',
	staff: 'Ажилтан',
	other: 'Бусад',
};

export const venuePackageKindLabelMn = (kind: VenuePackageServiceKind): string =>
	KIND_LABELS[kind] ?? kind;

export const VENUE_PACKAGE_KIND_OPTIONS: { value: VenuePackageServiceKind; label: string }[] = (
	Object.entries(KIND_LABELS) as [VenuePackageServiceKind, string][]
).map(([value, label]) => ({ value, label }));
