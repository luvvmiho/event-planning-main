import { ProviderOrderItemsPanel } from '@/components/provider/provider-order-items-panel';
import { ProviderOrderStatusForm } from '@/components/provider/provider-order-status-form';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getProviderOrderById } from '@/lib/api';
import { getAuthenticatedProfile } from '@/lib/auth/session-context';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

export const metadata = {
	title: 'Захиалгын дэлгэрэнгүй - Nairly',
};

const PAYMENT_LABELS: Record<string, string> = {
	bank_transfer: 'Банкны шилжүүлэг',
	qpay: 'QPay',
};

const formatOrderDate = (iso: string) => {
	const d = new Date(iso);
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}.${m}.${day}`;
};

const statusBadgeClass = (status: string) => {
	if (status === 'paid') return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
	if (status === 'pending') return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
	if (status === 'cancelled') return 'bg-muted text-muted-foreground hover:bg-muted';
	return 'bg-secondary text-secondary-foreground';
};

const STATUS_LABELS: Record<string, string> = {
	pending: 'Хүлээгдэж буй',
	paid: 'Баталгаажсан',
	cancelled: 'Цуцлагдсан',
};

type PageProps = { params: Promise<{ id: string }> };

export default async function ProviderOrderDetailPage({ params }: PageProps) {
	const { id } = await params;
	const ctx = await getAuthenticatedProfile();
	if (!ctx) redirect(`/login?next=/provider/orders/${id}`);
	if (ctx.userType !== 'provider') redirect('/profile');

	const token = ctx.session.access_token;
	let order: Awaited<ReturnType<typeof getProviderOrderById>>['data'];

	try {
		const res = await getProviderOrderById(id, token);
		order = res.data;
	} catch {
		notFound();
	}

	return (
		<div className='bg-secondary/30 p-6 md:p-10'>
			<div className='mx-auto max-w-3xl space-y-6'>
				<div className='flex flex-wrap items-center gap-3'>
					<Link
						href='/provider/orders'
						className='flex items-center gap-1.5 text-sm font-medium text-accent hover:underline'
					>
						<ArrowLeft className='size-4 shrink-0' /> Буцах
					</Link>
				</div>

				<div className='space-y-1'>
					<p className='font-mono text-lg font-semibold text-foreground'>
						{order.display_ref}
					</p>
					<p className='text-sm text-muted-foreground'>
						Огноо: {formatOrderDate(order.created_at)} · Төлбөр:{' '}
						{PAYMENT_LABELS[order.payment_method] ?? order.payment_method}
					</p>
					<p className='text-sm text-muted-foreground'>
						Төрөл: <span className='text-foreground'>{order.event_type_label}</span> ·
						Танхимын дүн: {new Intl.NumberFormat('mn-MN').format(order.provider_subtotal)}₮
					</p>
				</div>

				<Card>
					<CardHeader className='flex flex-row flex-wrap items-center justify-between gap-4'>
						<CardTitle className='text-base'>Төлөв</CardTitle>
						<Badge className={cn('font-medium', statusBadgeClass(order.status))}>
							{STATUS_LABELS[order.status] ?? order.status}
						</Badge>
					</CardHeader>
					<CardContent>
						<ProviderOrderStatusForm orderId={order.id} initialStatus={order.status} />
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className='text-base'>Үйлчлүүлэгч</CardTitle>
					</CardHeader>
					<CardContent className='space-y-1 text-sm'>
						<p>
							<span className='text-muted-foreground'>Нэр: </span>
							{order.customer_name}
						</p>
						<p>
							<span className='text-muted-foreground'>И-мэйл: </span>
							{order.customer_email}
						</p>
						<p>
							<span className='text-muted-foreground'>Утас: </span>
							{order.customer_phone}
						</p>
						{order.notes ? (
							<p>
								<span className='text-muted-foreground'>Тэмдэглэл: </span>
								{order.notes}
							</p>
						) : null}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className='text-base'>Захиалсан танхим ба багц</CardTitle>
					</CardHeader>
					<CardContent className='px-0 pt-0'>
						<ProviderOrderItemsPanel
							items={order.items}
							providerSubtotal={order.provider_subtotal}
							orderTotal={order.total}
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
