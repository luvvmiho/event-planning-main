import { EventCategoriesSwiper } from '@/components/home/event-categories-swiper';
import { catalogCategoryCoverUrl, getCatalogCategories } from '@/lib/catalog-categories';
import { serializeVenueSearchParams } from '@/lib/venue-search-params';

export async function EventCategories() {
	const categories = await getCatalogCategories();

	if (categories.length === 0) {
		return null;
	}

	const items = categories.map((c) => ({
		id: c.id,
		name: c.name,
		imageUrl: catalogCategoryCoverUrl(c.slug),
		href: `/venues${serializeVenueSearchParams({ categoryId: c.id, page: 1 })}`,
	}));

	return <EventCategoriesSwiper items={items} />;
}
