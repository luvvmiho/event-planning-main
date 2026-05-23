import Link from 'next/link'
import { getAuthenticatedProfile } from '@/lib/auth/session-context'
import { listProviderOrders } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { redirect } from 'next/navigation'

export const metadata = {
	title: 'Захиалгууд - Nairly',
}

const formatOrderDate = (iso: string) => {
	const d = new Date(iso)
	const y = d.getFullYear()
	const m = String(d.getMonth() + 1).padStart(2, '0')
	const day = String(d.getDate()).padStart(2, '0')
	return `${y}.${m}.${day}`
}

const statusBadgeClass = (status: string) => {
	if (status === 'paid') return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
	if (status === 'pending') return 'bg-amber-100 text-amber-800 hover:bg-amber-100'
	if (status === 'cancelled') return 'bg-muted text-muted-foreground hover:bg-muted'
	return 'bg-secondary text-secondary-foreground'
}

const STATUS_LABELS: Record<string, string> = {
	pending: 'Хүлээгдэж буй',
	paid: 'Баталгаажсан',
	cancelled: 'Цуцлагдсан',
}

export default async function ProviderOrdersPage() {
	const ctx = await getAuthenticatedProfile()
	if (!ctx) redirect('/login?next=/provider/orders')
	if (ctx.userType !== 'provider') redirect('/profile')

	const token = ctx.session.access_token
	let rows: Awaited<ReturnType<typeof listProviderOrders>>['data'] = []
	try {
		const res = await listProviderOrders(token, { page: 1, limit: 100 })
		rows = res.data
	} catch {
		rows = []
	}

	return (
		<div className='bg-secondary/30 p-6 md:p-10'>
			<div className='mx-auto max-w-6xl space-y-6'>
				<div>
					<h1 className='text-2xl font-semibold text-foreground'>Захиалгууд</h1>
					<p className='mt-1 text-sm text-muted-foreground'>
						Таны танхимтай холбоотой бүх захиалга
					</p>
				</div>

				<Card className='border-border shadow-sm'>
					<CardHeader>
						<CardTitle className='text-base font-semibold'>Жагсаалт</CardTitle>
					</CardHeader>
					<CardContent className='px-0'>
						{rows.length === 0 ? (
							<p className='px-6 pb-6 text-sm text-muted-foreground'>Захиалга алга байна.</p>
						) : (
							<Table>
								<TableHeader>
									<TableRow className='hover:bg-transparent'>
										<TableHead className='text-xs font-semibold uppercase'>ID</TableHead>
										<TableHead className='text-xs font-semibold uppercase'>Үйлчлүүлэгч</TableHead>
										<TableHead className='text-xs font-semibold uppercase'>Төрөл</TableHead>
										<TableHead className='text-xs font-semibold uppercase'>Огноо</TableHead>
										<TableHead className='text-xs font-semibold uppercase'>Төлөв</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{rows.map((row) => (
										<TableRow key={row.id} className='border-border'>
											<TableCell className='font-mono text-sm font-medium'>
												<Link
													href={`/provider/orders/${row.id}`}
													className='text-primary hover:underline'
												>
													{row.display_ref}
												</Link>
											</TableCell>
											<TableCell className='text-sm'>{row.customer_name}</TableCell>
											<TableCell className='text-sm text-muted-foreground'>
												{row.event_type_label}
											</TableCell>
											<TableCell className='text-sm tabular-nums text-muted-foreground'>
												{formatOrderDate(row.created_at)}
											</TableCell>
											<TableCell>
												<Badge className={cn('font-medium', statusBadgeClass(row.status))}>
													{STATUS_LABELS[row.status] ?? row.status}
												</Badge>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
