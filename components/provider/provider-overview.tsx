import Link from 'next/link'
import { Playfair_Display } from 'next/font/google'
import { Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import type { ProviderOrderListItem, ProviderStats } from '@/lib/types'
import { cn } from '@/lib/utils'

const displaySerif = Playfair_Display({ subsets: ['latin'] })

const formatOrderDate = (iso: string) => {
	const d = new Date(iso)
	const y = d.getFullYear()
	const m = String(d.getMonth() + 1).padStart(2, '0')
	const day = String(d.getDate()).padStart(2, '0')
	return `${y}.${m}.${day}`
}

const formatMntFull = (n: number) => new Intl.NumberFormat('mn-MN').format(n) + '₮'

const formatRevenueDisplay = (n: number) => {
	if (n >= 1_000_000) return `₮${(n / 1_000_000).toFixed(1)}M`
	if (n >= 1_000) return `₮${(n / 1_000).toFixed(1)}K`
	return formatMntFull(n)
}

const formatTrend = (p: number | null) => {
	if (p === null) return '—'
	const sign = p > 0 ? '+' : ''
	return `${sign}${p}%`
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

export type ProviderOverviewProps = {
	displayName: string
	stats: ProviderStats
	recentOrders: ProviderOrderListItem[]
}

export const ProviderOverview = ({ displayName, stats, recentOrders }: ProviderOverviewProps) => {
	return (
		<div className='bg-secondary/30 p-6 md:p-10'>
			<div className='mx-auto max-w-6xl space-y-8'>
				<div className='flex flex-col gap-6 md:flex-row md:items-start md:justify-between'>
					<div className='space-y-2'>
						<p className='text-xs font-semibold tracking-wide text-accent uppercase'>Dashboard overview</p>
						<h1
							className={cn(
								'text-3xl font-medium tracking-tight text-foreground md:text-4xl',
								displaySerif.className,
							)}
						>
							Сайн байна уу, {displayName}
						</h1>
					</div>
					<Button asChild className='shrink-0 gap-2 bg-primary text-primary-foreground'>
						<Link href='/provider/venues/new'>
							<Plus className='h-4 w-4' aria-hidden />
							Шинэ үйлчилгээ нэмэх
						</Link>
					</Button>
				</div>

				<div className='grid gap-4 md:grid-cols-3'>
					<Card className='relative overflow-hidden border-border shadow-sm'>
						<div className='absolute top-0 right-0 h-full w-1 bg-accent' aria-hidden />
						<CardHeader className='pb-2'>
							<CardTitle className='text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
								Нийт захиалга
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='flex flex-wrap items-end gap-2'>
								<p className='text-3xl font-semibold tabular-nums text-foreground'>
									{new Intl.NumberFormat('mn-MN').format(stats.totalOrders)}
								</p>
								{stats.ordersTrendPercent != null && (
									<Badge
										className={cn(
											'mb-1 border-0',
											stats.ordersTrendPercent >= 0
												? 'bg-emerald-100 text-emerald-800'
												: 'bg-red-100 text-red-800',
										)}
									>
										{formatTrend(stats.ordersTrendPercent)}
									</Badge>
								)}
							</div>
						</CardContent>
					</Card>

					<Card className='relative overflow-hidden border-border shadow-sm'>
						<div className='absolute top-0 right-0 h-full w-1 bg-accent' aria-hidden />
						<CardHeader className='pb-2'>
							<CardTitle className='text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
								Нийт орлого (танхим)
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='flex flex-wrap items-end gap-2'>
								<p className='text-3xl font-semibold tabular-nums text-foreground'>
									{formatRevenueDisplay(stats.totalRevenue)}
								</p>
								{stats.revenueTrendPercent != null && (
									<Badge
										className={cn(
											'mb-1 border-0',
											stats.revenueTrendPercent >= 0
												? 'bg-emerald-100 text-emerald-800'
												: 'bg-red-100 text-red-800',
										)}
									>
										{formatTrend(stats.revenueTrendPercent)}
									</Badge>
								)}
							</div>
						</CardContent>
					</Card>

					<Card className='relative overflow-hidden border-border shadow-sm'>
						<div className='absolute top-0 right-0 h-full w-1 bg-accent' aria-hidden />
						<CardHeader className='pb-2'>
							<CardTitle className='text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
								Идэвхтэй үйлчилгээ
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='text-3xl font-semibold tabular-nums text-foreground'>
								{new Intl.NumberFormat('mn-MN').format(stats.activeServices)}
							</p>
						</CardContent>
					</Card>
				</div>

				<Card className='border-border shadow-sm'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
						<CardTitle className='text-lg font-semibold text-foreground'>Сүүлийн захиалгууд</CardTitle>
						<Link
							href='/provider/orders'
							className='text-xs font-semibold tracking-wide text-accent underline-offset-4 hover:underline'
						>
							Бүгдийг харах
						</Link>
					</CardHeader>
					<CardContent className='px-0 pt-0'>
						{recentOrders.length === 0 ? (
							<p className='px-6 pb-6 text-sm text-muted-foreground'>Танд харагдах захиалга алга байна.</p>
						) : (
							<Table>
								<TableHeader>
									<TableRow className='hover:bg-transparent'>
										<TableHead className='w-[100px] text-xs font-semibold uppercase'>ID</TableHead>
										<TableHead className='text-xs font-semibold uppercase'>Үйлчлүүлэгч</TableHead>
										<TableHead className='text-xs font-semibold uppercase'>Төрөл</TableHead>
										<TableHead className='text-xs font-semibold uppercase'>Огноо</TableHead>
										<TableHead className='text-xs font-semibold uppercase'>Төлөв</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{recentOrders.map((row) => (
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
