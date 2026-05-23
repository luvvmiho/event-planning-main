import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { VenueDetailExperience } from '@/components/venues/venue-detail-experience'
import { getVenueBySlug, getVenueEventPackages, listVenueReviews, listWishlist } from '@/lib/api'
import { getAuthenticatedProfile } from '@/lib/auth/session-context'
import type { VenueEventPackagePublic, VenueReview } from '@/lib/types'
import { notFound } from 'next/navigation'

interface PageProps {
	params: Promise<{ slug: string }>
}

async function getVenue(slug: string) {
	try {
		const { data } = await getVenueBySlug(slug)
		return {
			...data,
			category: data.categories?.slug ?? 'venue',
		}
	} catch {
		return null
	}
}

export async function generateMetadata({ params }: PageProps) {
	const { slug } = await params
	const venue = await getVenue(slug)

	if (!venue) {
		return {
			title: 'Venue Not Found - Nairly',
		}
	}

	return {
		title: `${venue.name} - Nairly`,
		description: venue.short_description || venue.description,
	}
}

export default async function VenueDetailPage({ params }: PageProps) {
	const { slug } = await params
	const venue = await getVenue(slug)

	if (!venue) {
		notFound()
	}

	const images = Array.isArray(venue.images)
		? venue.images
		: venue.image_url
			? [venue.image_url]
			: []

	let initialReviews: VenueReview[] = []
	try {
		const res = await listVenueReviews(venue.id, { limit: 50 })
		initialReviews = res.data
	} catch {
		initialReviews = []
	}

	let eventPackages: VenueEventPackagePublic[] = []
	try {
		const pkgRes = await getVenueEventPackages(venue.id)
		eventPackages = pkgRes.data ?? []
	} catch {
		eventPackages = []
	}

	const authCtx = await getAuthenticatedProfile()

	let initialInWishlist = false
	if (authCtx?.session?.access_token) {
		try {
			const { data } = await listWishlist(authCtx.session.access_token, { limit: 100 })
			initialInWishlist = data.some((row) => row.venue?.id === venue.id)
		} catch {
			initialInWishlist = false
		}
	}

	return (
		<div className='flex min-h-screen flex-col'>
			<Header />

			<main className='flex-1'>
				<VenueDetailExperience
					venue={venue}
					images={images}
					initialReviews={initialReviews}
					eventPackages={eventPackages}
					isAuthenticated={!!authCtx}
					initialInWishlist={initialInWishlist}
				/>
			</main>

			<Footer />
		</div>
	)
}
