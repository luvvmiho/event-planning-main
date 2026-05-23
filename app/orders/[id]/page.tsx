import { OrderDetailPanel } from '@/components/orders/order-detail-panel'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { getVerifiedSession } from '@/lib/auth/session-context'
import { getOrderById } from '@/lib/api'
import { notFound } from 'next/navigation'

export const metadata = {
	title: 'Захиалгын дэлгэрэнгүй - Nairly',
}

type SearchParams = { guestEmail?: string | string[] }

function firstString(v: string | string[] | undefined): string | undefined {
	if (v == null) return undefined
	return typeof v === 'string' ? v : v[0]
}

export default async function OrderDetailPage({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>
	searchParams: Promise<SearchParams>
}) {
	const { id } = await params
	const sp = await searchParams
	const guestEmail = firstString(sp.guestEmail)?.trim().toLowerCase()

	const ctx = await getVerifiedSession()
	const accessToken = ctx?.session.access_token

	let result: Awaited<ReturnType<typeof getOrderById>> = null
	try {
		result = await getOrderById(id, {
			accessToken,
			guestEmail: guestEmail ?? undefined,
		})
	} catch {
		notFound()
	}

	if (!result?.data) notFound()

	return (
		<div className='flex min-h-screen flex-col'>
			<Header />
			<main className='flex-1 bg-background py-10'>
				<div className='container mx-auto max-w-3xl px-4'>
					<h1 className='border-l-4 border-accent pl-4 text-2xl font-bold text-foreground'>
						Захиалгын дэлгэрэнгүй
					</h1>
					<div className='mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm'>
						<OrderDetailPanel order={result.data} />
					</div>
				</div>
			</main>
			<Footer />
		</div>
	)
}
