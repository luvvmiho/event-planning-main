import Link from 'next/link'
import type { OrderSummary } from '@/lib/types'
import { ChevronRight } from 'lucide-react'

const formatMnt = (n: number) => new Intl.NumberFormat('mn-MN').format(n) + '₮'

const formatOrderDate = (iso: string) =>
	new Date(iso).toLocaleDateString('mn-MN', { year: 'numeric', month: 'short', day: 'numeric' })

const PAYMENT_LABELS: Record<string, string> = {
	bank_transfer: 'Банкны шилжүүлэг',
	qpay: 'QPay',
}

const STATUS_LABELS: Record<string, string> = {
	pending: 'Хүлээгдэж буй',
	paid: 'Төлөгдсөн',
	cancelled: 'Цуцлагдсан',
}

export function OrdersList({ orders }: { orders: OrderSummary[] }) {
	if (orders.length === 0) {
		return (
			<div className='rounded-xl border border-dashed border-border bg-secondary/20 py-16 text-center'>
				<p className='text-muted-foreground'>Танд харагдах захиалга алга байна.</p>
				<Link href='/venues' className='mt-4 inline-block text-sm font-medium text-accent hover:underline'>
					Танхим үзэх
				</Link>
			</div>
		)
	}

	return (
		<ul className='space-y-3'>
			{orders.map((o) => (
				<li key={o.id}>
					<Link
						href={`/orders/${o.id}`}
						className='flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary/30'
					>
						<div className='min-w-0'>
							<p className='font-mono text-sm font-medium text-foreground'>{o.id.slice(0, 8)}…</p>
							<p className='mt-1 text-sm text-muted-foreground'>{formatOrderDate(o.created_at)}</p>
							<div className='mt-2 flex flex-wrap gap-2'>
								<span className='rounded-full bg-secondary px-2 py-0.5 text-xs'>
									{STATUS_LABELS[o.status] ?? o.status}
								</span>
								<span className='rounded-full bg-accent/10 px-2 py-0.5 text-xs text-foreground'>
									{PAYMENT_LABELS[o.payment_method] ?? o.payment_method}
								</span>
							</div>
						</div>
						<div className='flex shrink-0 items-center gap-2'>
							<span className='text-lg font-semibold text-foreground'>{formatMnt(o.total)}</span>
							<ChevronRight className='h-5 w-5 text-muted-foreground' aria-hidden />
						</div>
					</Link>
				</li>
			))}
		</ul>
	)
}
