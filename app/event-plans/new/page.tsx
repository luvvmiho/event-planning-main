import { EventPlanNewForm } from '@/components/event-plans/event-plan-new-form';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { getVerifiedSession } from '@/lib/auth/session-context';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata = {
	title: 'Шинэ төлөвлөгөө - Nairly',
};

export default async function NewEventPlanPage() {
	const ctx = await getVerifiedSession();
	if (!ctx) redirect('/login?next=/event-plans/new');

	return (
		<div className='flex min-h-screen flex-col'>
			<Header />
			<main className='flex-1 bg-background py-10'>
				<div className='container mx-auto max-w-2xl px-4'>
					<Button
						variant='ghost'
						size='sm'
						className='mb-6 -ml-2 text-muted-foreground'
						asChild
					>
						<Link href='/event-plans'>
							<ArrowLeft className='h-4 w-4' aria-hidden /> Буцах
						</Link>
					</Button>
					<h1 className='mb-6 border-l-4 border-accent pl-4 text-3xl font-bold text-foreground italic'>
						Шинэ төлөвлөгөө
					</h1>
					<EventPlanNewForm />
				</div>
			</main>
			<Footer />
		</div>
	);
}
