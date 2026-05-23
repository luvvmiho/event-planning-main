import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { VenueList } from '@/components/venues/venue-list';
import { listWishlist } from '@/lib/api';
import { getVerifiedSession } from '@/lib/auth/session-context';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata = { title: 'Хадгалсан - Nairly' };

export default async function ProfileWishlistPage() {
	const ctx = await getVerifiedSession();
	if (!ctx) redirect('/login?next=/profile/wishlist');

	let rows: Awaited<ReturnType<typeof listWishlist>>['data'] = [];
	let total = 0;
	try {
		const res = await listWishlist(ctx.session.access_token, { page: 1, limit: 48 });
		rows = res.data;
		total = res.meta.total;
	} catch (e) {
		console.error('listWishlist', e);
	}

	const venues = rows.map((r) => r.venue).filter((v): v is NonNullable<typeof v> => v != null);
	const missingVenueCount = total - venues.length;

	return (
		<div className='flex min-h-screen flex-col'>
			<Header />
			<main className='flex-1 bg-secondary/40 py-10'>
				<div className='container mx-auto max-w-5xl px-4'>
					<div className='mb-6'>
						<Button
							variant='ghost'
							size='sm'
							className='mb-4 -ml-2 gap-1 text-muted-foreground'
							asChild
						>
							<Link href='/profile'>
								<ChevronLeft className='h-4 w-4' aria-hidden />
								Профайл
							</Link>
						</Button>
						<h1 className='border-l-4 border-accent pl-4 text-3xl font-bold text-foreground italic'>
							Хадгалсан
						</h1>
					</div>
					<VenueList
						venues={venues}
						emptyHint={{
							title: total === 0 ? 'Хадгалсан байршил байхгүй' : 'Харуулах байршил алга',
							description:
								total === 0
									? 'Танхимын хуудсаас «Хадгалах» товчийг ашиглана уу.'
									: 'Хадгалсан мөрүүдийн байршил устгагдсан эсвэл олдохгүй байна.',
						}}
					/>
					{venues.length === 0 ? (
						<p className='mt-8 text-center'>
							<Button asChild variant='outline'>
								<Link href='/venues'>Танхимууд үзэх</Link>
							</Button>
						</p>
					) : null}
				</div>
			</main>
			<Footer />
		</div>
	);
}
