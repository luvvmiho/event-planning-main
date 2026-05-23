export const VENUE_CATEGORY_LABELS: Record<string, string> = {
	venue: 'БАЙРШИЛ & ТАНХИМ',
	restaurant: 'Ресторан',
	hotel: 'Зочид буудал',
	cafe: 'Кафе',
	hall: 'Их танхим',
	outdoor: 'Гадаа талбай',
};

export const VENUE_CATEGORY_SHORT: Record<string, string> = {
	venue: 'Танхим',
	restaurant: 'Ресторан',
	hotel: 'Зочид буудал',
	cafe: 'Кафе',
	hall: 'Их танхим',
	outdoor: 'Гадаа талбай',
};

export function venueCategoryCartLabel(category: string): string {
	return VENUE_CATEGORY_LABELS[category] ?? category;
}

export function venueCategoryShortLabel(category: string): string {
	return VENUE_CATEGORY_SHORT[category] ?? category;
}
