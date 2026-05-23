import { OrdersList } from '@/components/orders/orders-list'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { getVerifiedSession } from '@/lib/auth/session-context'
import { listMyOrders } from '@/lib/api'
import { redirect } from 'next/navigation'

export const metadata = {
	title: 'Миний захиалга - Nairly',
}

export default async function OrdersPage() {
	const ctx = await getVerifiedSession()
	if (!ctx) redirect('/login?next=/orders')

	let orders: Awaited<ReturnType<typeof listMyOrders>>['data'] = []
	try {
		const res = await listMyOrders(ctx.session.access_token)
		orders = res.data
	} catch (e) {
		console.error('listMyOrders', e)
	}

	return (
		<div className='flex min-h-screen flex-col'>
			<Header />
			<main className='flex-1 bg-background py-10'>
				<div className='container mx-auto max-w-3xl px-4'>
					<h1 className='border-l-4 border-accent pl-4 text-3xl font-bold italic text-foreground'>
						Миний захиалга
					</h1>
					<p className='mt-2 pl-5 text-sm text-muted-foreground'>
						Таны нэвтэрсэн бүртгэлээр хийсэн захиалгууд
					</p>
					<div className='mt-8'>
						<OrdersList orders={orders} />
					</div>
				</div>
			</main>
			<Footer />
		</div>
	)
}
