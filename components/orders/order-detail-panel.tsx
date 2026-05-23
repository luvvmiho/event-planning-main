import { OrderLinePackageInfo } from '@/components/cart/cart-line-package-info'
import { BANK_TRANSFER_INFO, QPAY_CHECKOUT_HINT } from '@/lib/payment-display'
import { isServiceOrderItem, isVenueOrderItem } from '@/lib/service-cart'
import type { OrderItem, OrderRecord } from '@/lib/types'
import { Building2, CalendarDays, CreditCard, Hash, Package, Smartphone, Users } from 'lucide-react'
import Link from 'next/link';

const formatMnt = (n: number) => new Intl.NumberFormat('mn-MN').format(n) + '₮';

const formatOrderDate = (iso: string) =>
	new Date(iso).toLocaleString('mn-MN', { dateStyle: 'medium', timeStyle: 'short' });

const formatBookingDate = (iso: string) => {
	const d = new Date(`${iso}T12:00:00`);
	return d.toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric' });
};

const PAYMENT_LABELS: Record<string, string> = {
	bank_transfer: 'Банкны шилжүүлэг',
	qpay: 'QPay',
};

const STATUS_LABELS: Record<string, string> = {
	pending: 'Хүлээгдэж буй',
	paid: 'Төлөгдсөн',
	cancelled: 'Цуцлагдсан',
};

function normalizeItems(raw: unknown): OrderItem[] {
	if (!Array.isArray(raw)) return [];
	return raw.filter((x): x is OrderItem => x != null && typeof x === 'object' && 'name' in x);
}

export function OrderDetailPanel({ order }: { order: OrderRecord }) {
	const items = normalizeItems(order.items as unknown);
	const paymentLabel = PAYMENT_LABELS[order.payment_method] ?? order.payment_method;
	const statusLabel = STATUS_LABELS[order.status] ?? order.status;

	return (
		<div className='space-y-8'>
			<div className='flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between'>
				<div>
					<p className='text-sm text-muted-foreground'>Захиалгын дугаар</p>
					<p className='font-mono text-lg font-semibold text-foreground'>{order.id}</p>
					<p className='mt-2 text-sm text-muted-foreground'>
						{formatOrderDate(order.created_at)}
					</p>
				</div>
				<div className='flex flex-wrap gap-2'>
					<span className='rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground'>
						{statusLabel}
					</span>
					<span className='rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-foreground'>
						{paymentLabel}
					</span>
				</div>
			</div>

			<section>
				<h2 className='mb-3 flex items-center gap-2 text-sm font-semibold tracking-wide text-muted-foreground uppercase'>
					<Package className='h-4 w-4 text-accent' aria-hidden />
					Захиалгын бараа
				</h2>
				<ul className='space-y-4'>
					{items.map((line, idx) => {
						const isService = isServiceOrderItem(line)
						const lineKey = isService
							? `${line.serviceId}-${idx}`
							: isVenueOrderItem(line)
								? `${line.venueId}-${idx}`
								: `line-${idx}`

						return (
						<li
							key={lineKey}
							className='flex gap-4 rounded-xl border border-border bg-card p-4'
						>
							<div className='relative h-24 w-28 shrink-0 overflow-hidden rounded-lg bg-muted'>
								{line.image ? (
									<img src={line.image} alt='' className='size-full object-cover' />
								) : null}
							</div>
							<div className='min-w-0 flex-1'>
								<p className='font-semibold text-foreground'>{line.name}</p>
								<p className='text-sm text-muted-foreground'>{line.providerLabel}</p>
								<p className='mt-1 text-xs text-accent'>{line.categoryLabel}</p>
								<div className='mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground'>
									<span className='inline-flex items-center gap-1'>
										<CalendarDays className='h-3.5 w-3.5' aria-hidden />
										{formatBookingDate(line.bookingDate)}
									</span>
									{isService ? (
										<span className='inline-flex items-center gap-1'>
											<Hash className='h-3.5 w-3.5' aria-hidden />
											{line.quantity} ширхэг
										</span>
									) : isVenueOrderItem(line) ? (
										<span className='inline-flex items-center gap-1'>
											<Users className='h-3.5 w-3.5' aria-hidden />
											{line.guestCount} зочин
										</span>
									) : null}
								</div>
								<p className='mt-2 text-sm font-semibold text-foreground'>
									{formatMnt(line.price)}
									{isVenueOrderItem(line) && (line.packageId || line.package_snapshot) ? (
										<span className='ml-1 text-xs font-normal text-muted-foreground'>
											(багцын нийт)
										</span>
									) : null}
								</p>
								{isVenueOrderItem(line) ? <OrderLinePackageInfo line={line} /> : null}
							</div>
						</li>
						)
					})}
				</ul>
			</section>

			<section className='grid gap-6 sm:grid-cols-2'>
				<div className='rounded-xl border border-border bg-secondary/20 p-4'>
					<h2 className='mb-3 flex items-center gap-2 text-sm font-semibold tracking-wide text-muted-foreground uppercase'>
						<CreditCard className='h-4 w-4 text-accent' aria-hidden />
						Төлбөрийн арга
					</h2>
					<p className='text-base font-medium text-foreground'>{paymentLabel}</p>
					{order.payment_method === 'bank_transfer' ? (
						<div className='mt-4 text-sm'>
							<ul className='mt-3 space-y-2 text-muted-foreground'>
								<li>
									<span className='text-foreground'>Банк: </span>
									{BANK_TRANSFER_INFO.bankName}
								</li>
								<li>
									<span className='text-foreground'>Данс эзэмшигч: </span>
									{BANK_TRANSFER_INFO.accountHolder}
								</li>
								<li>
									<span className='text-foreground'>Дансны дугаар: </span>
									<span className='font-mono text-foreground'>
										{BANK_TRANSFER_INFO.accountNumber}
									</span>
								</li>
								<li>
									<span className='text-foreground'>Валют: </span>
									{BANK_TRANSFER_INFO.currency}
								</li>
							</ul>
							<p className='mt-3 flex items-start gap-2 text-xs text-muted-foreground'>
								<Building2 className='mt-0.5 h-3.5 w-3.5 shrink-0' aria-hidden />
								Гүйлгээний утга дээр заавал захиалгын дугаараа бичнэ үү. Төлбөр орсны дараа
								баталгаажина.
							</p>
						</div>
					) : order.payment_method === 'qpay' ? (
						<div className='mt-4 rounded-lg border border-dashed border-accent/40 bg-background p-4 text-sm text-muted-foreground'>
							<p className='flex items-center gap-2 font-medium text-foreground'>
								<Smartphone className='h-4 w-4 text-accent' aria-hidden />
								QPay
							</p>
							<p className='mt-2'>{QPAY_CHECKOUT_HINT}</p>
						</div>
					) : null}
				</div>

				<div className='rounded-xl border border-border bg-card p-4'>
					<h2 className='mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase'>
						Холбоо барих
					</h2>
					<dl className='space-y-2 text-sm'>
						<div>
							<dt className='text-muted-foreground'>Нэр</dt>
							<dd className='font-medium text-foreground'>{order.customer_name}</dd>
						</div>
						<div>
							<dt className='text-muted-foreground'>И-мэйл</dt>
							<dd className='font-medium text-foreground'>{order.customer_email}</dd>
						</div>
						<div>
							<dt className='text-muted-foreground'>Утас</dt>
							<dd className='font-medium text-foreground'>{order.customer_phone}</dd>
						</div>
						{order.notes ? (
							<div>
								<dt className='text-muted-foreground'>Тэмдэглэл</dt>
								<dd className='text-foreground'>{order.notes}</dd>
							</div>
						) : null}
					</dl>
					<div className='mt-6 border-t border-border pt-4'>
						<div className='mt-2 flex justify-between text-base font-semibold text-foreground'>
							<span>Нийт дүн</span>
							<span>{formatMnt(order.total)}</span>
						</div>
					</div>
				</div>
			</section>

			<p className='text-center text-sm text-muted-foreground'>
				<Link href='/orders' className='text-accent hover:underline'>
					Бүх захиалга руу буцах
				</Link>
				{' · '}
				<Link href='/venues' className='text-accent hover:underline'>
					Танхим үргэлжлүүлэн үзэх
				</Link>
			</p>
		</div>
	);
}
