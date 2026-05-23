import { getVenues } from '@/lib/api'
import { LatestVenuesSwiper } from '@/components/home/latest-venues-swiper'

export async function LatestVenues() {
	let venues: Awaited<ReturnType<typeof getVenues>>['data'] = []
	let totalCount = 0

	try {
		const { data, meta } = await getVenues({ sort: 'newest', limit: 12 })
		venues = data
		totalCount = meta.total
	} catch (err) {
		console.error('Error fetching latest venues:', err)
	}

	if (venues.length === 0) {
		return null
	}

	return <LatestVenuesSwiper venues={venues} totalCount={totalCount} />
}
