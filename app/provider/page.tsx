import { getAuthenticatedProfile } from '@/lib/auth/session-context'
import { getProviderStats, listProviderOrders } from '@/lib/api'
import { ProviderOverview } from '@/components/provider/provider-overview'
import { redirect } from 'next/navigation'

export const metadata = {
	title: 'Хянах самбар - Nairly',
}

export default async function ProviderDashboardPage() {
	const ctx = await getAuthenticatedProfile()
	if (!ctx) redirect('/login?next=/provider')
	if (ctx.userType !== 'provider') redirect('/profile')

	const token = ctx.session.access_token
	const displayName =
		(ctx.session.user.user_metadata?.name as string | undefined) ??
		ctx.profile?.full_name ??
		ctx.session.user.email ??
		'Үйлчилгээ үзүүлэгч'

	let stats = {
		totalOrders: 0,
		totalRevenue: 0,
		activeServices: 0,
		ordersTrendPercent: null as number | null,
		revenueTrendPercent: null as number | null,
	}
	let recentOrders: Awaited<ReturnType<typeof listProviderOrders>>['data'] = []

	try {
		const [statsRes, ordersRes] = await Promise.all([
			getProviderStats(token),
			listProviderOrders(token, { page: 1, limit: 8 }),
		])
		stats = statsRes.data
		recentOrders = ordersRes.data
	} catch {
	}

	return <ProviderOverview displayName={displayName} stats={stats} recentOrders={recentOrders} />
}
