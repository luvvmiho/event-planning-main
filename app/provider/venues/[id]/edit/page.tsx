import { VenueForm } from '@/app/provider/venues/new/_components/venue-form';
import { VenueDeleteDialog } from '@/components/provider/venue-delete-dialog';
import { VenueStatusControls } from '@/components/provider/venue-status-controls';
import { Button } from '@/components/ui/button';
import { getCategories, getVenueForManage, listMyServices } from '@/lib/api';
import { getVerifiedSession } from '@/lib/auth/session-context';
import type { CreateVenueFormValues, VenueManageDetail } from '@/lib/types';
import { mapManagePackagesToForm } from '@/lib/validations/venue';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

export const metadata = { title: 'Байршил засах - Nairly' };

type PageProps = { params: Promise<{ id: string }> };

const mapVenueToFormValues = (venue: VenueManageDetail): Partial<CreateVenueFormValues> => ({
	name: venue.name,
	short_description: venue.short_description ?? '',
	description: venue.description ?? '',
	category_id: venue.categories?.id ?? '',
	location: venue.location,
	district: venue.district ?? '',
	address: venue.address ?? '',
	lat: venue.lat ?? undefined,
	long: venue.long ?? undefined,
	capacity_min: venue.capacity_min,
	capacity_max: venue.capacity_max,
	price_per_person: venue.price_per_person,
	contact_phone: venue.contact_phone ?? '',
	contact_email: venue.contact_email ?? '',
	website: venue.website ?? '',
	amenities: Array.isArray(venue.amenities) ? venue.amenities.join(', ') : '',
	image_url: venue.image_url ?? '',
	images: venue.images ?? [],
	event_packages: mapManagePackagesToForm(venue.event_packages ?? []),
});

export default async function EditVenuePage({ params }: PageProps) {
	const { id } = await params;
	const verified = await getVerifiedSession();
	if (!verified) redirect(`/login?next=/provider/venues/${id}/edit`);

	const token = verified.session.access_token;

	let venue: VenueManageDetail;
	try {
		const res = await getVenueForManage(id, token);
		venue = res.data;
	} catch {
		notFound();
	}

	let categories: Awaited<ReturnType<typeof getCategories>>['data'] = [];
	try {
		const res = await getCategories();
		categories = res.data;
	} catch {
		categories = [];
	}

	const categoryLabel = venue.categories?.name ?? venue.category;
	const initialPackageIds = (venue.event_packages ?? []).map((pkg) => pkg.id);

	let providerServices = venue.provider_services ?? [];
	if (providerServices.length === 0) {
		try {
			const res = await listMyServices(token);
			providerServices = res.data;
		} catch {
			providerServices = [];
		}
	}

	return (
		<div className='p-8'>
			<div className='mb-6'>
				<Button variant='ghost' size='sm' className='mb-4 gap-1' asChild>
					<Link href='/provider/venues'>
						<ArrowLeft className='h-4 w-4' aria-hidden />
						Миний байршлууд
					</Link>
				</Button>
				<div className='flex flex-wrap items-start justify-between gap-4'>
					<h1 className='text-2xl font-semibold text-foreground'>{venue.name}</h1>
					<VenueDeleteDialog venueId={venue.id} venueName={venue.name} />
				</div>
			</div>

			<div className='mb-6 space-y-4'>
				<VenueStatusControls venueId={venue.id} initialStatus={venue.status} />
			</div>

			<div className='rounded-2xl border border-border bg-[#f5f3ef]/40 p-8'>
				<VenueForm
					key={`${venue.id}-${initialPackageIds.join(',')}`}
					mode='edit'
					venueId={venue.id}
					categories={categories}
					accessToken={token}
					categoryLabel={categoryLabel}
					initialValues={mapVenueToFormValues(venue)}
					initialPackageIds={initialPackageIds}
					providerServices={providerServices}
				/>
			</div>
		</div>
	);
}
