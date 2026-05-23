import type { CheckoutAutofillContact } from '@/components/cart/checkout-section';
import { EventPlanBuilder } from '@/components/event-plans/event-plan-builder';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { getEventPlanById, getVenues } from '@/lib/api';
import { getAuthenticatedProfile, getVerifiedSession } from '@/lib/auth/session-context';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
	const { id } = await params;
	return { title: `Төлөвлөгөө - Nairly` };
}

export default async function EventPlanDetailPage({ params }: PageProps) {
	const { id } = await params;
	const ctx = await getVerifiedSession();
	if (!ctx) redirect(`/login?next=/event-plans/${id}`);

	let plan: Awaited<ReturnType<typeof getEventPlanById>>['data'];
	try {
		const res = await getEventPlanById(id, ctx.session.access_token);
		plan = res.data;
	} catch {
		notFound();
	}

	let venues: Awaited<ReturnType<typeof getVenues>>['data'] = [];

	try {
		const maxPricePerPerson =
			plan.guest_count && plan.budget
				? Math.floor(plan.budget / plan.guest_count)
				: undefined;

		const venuesRes = await getVenues({
			limit: 24,
			...(plan.guest_count ? { capacity: plan.guest_count } : {}),
			...(maxPricePerPerson ? { maxPrice: maxPricePerPerson } : {}),
		});
		venues = venuesRes.data;
	} catch (e) {
		console.error('event plan catalog fetch', e);
	}

	const profileCtx = await getAuthenticatedProfile();
	const autofillContact: CheckoutAutofillContact | null = profileCtx
		? {
				fullName: String(
					profileCtx.profile?.full_name ?? profileCtx.session.user.user_metadata?.name ?? '',
				),
				email: profileCtx.session.user.email ?? '',
				phone: String(
					profileCtx.profile?.phone ?? profileCtx.session.user.user_metadata?.phone ?? '',
				),
			}
		: null;

	return (
		<div className='flex min-h-screen flex-col'>
			<Header />
			<main className='flex-1 bg-background py-10'>
				<div className='container mx-auto max-w-5xl px-4'>
					<Button
						variant='ghost'
						size='sm'
						className='mb-6 -ml-2 text-muted-foreground'
						asChild
					>
						<Link href='/event-plans' aria-label='Миний төлөвлөгөө'>
							<ArrowLeft className='h-4 w-4' aria-hidden />
						</Link>
					</Button>
					<EventPlanBuilder
						plan={plan}
						venues={venues}
						autofillContact={autofillContact}
					/>
				</div>
			</main>
			<Footer />
		</div>
	);
}
