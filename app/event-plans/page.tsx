import { EventPlanList } from '@/components/event-plans/event-plan-list';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { listMyEventPlans } from '@/lib/api';
import { getVerifiedSession } from '@/lib/auth/session-context';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata = {
	title: 'Миний төлөвлөгөө - Nairly',
};

export default async function EventPlansPage() {
	const ctx = await getVerifiedSession();
	if (!ctx) redirect('/login?next=/event-plans');

	let plans: Awaited<ReturnType<typeof listMyEventPlans>>['data'] = [];
	try {
		const res = await listMyEventPlans(ctx.session.access_token);
		plans = res.data;
	} catch (e) {
		console.error('listMyEventPlans', e);
	}

	return (
		<div className='flex min-h-screen flex-col'>
			<Header />
			<main className='flex-1 bg-background py-10'>
				<div className='container mx-auto max-w-4xl px-4'>
					<div className='flex flex-wrap items-end justify-between gap-4'>
						<div>
							<h1 className='border-l-4 border-accent pl-4 text-3xl font-bold text-foreground italic'>
								Миний төлөвлөгөө
							</h1>
							<p className='mt-2 pl-5 text-sm text-muted-foreground'>
								Төсвөө тодорхойлж, танхим болон үйлчилгээ сонгон захиалга өгнө
							</p>
						</div>
						<Button asChild>
							<Link href='/event-plans/new'>Шинэ төлөвлөгөө</Link>
						</Button>
					</div>
					<div className='mt-8'>
						<EventPlanList plans={plans} />
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}
