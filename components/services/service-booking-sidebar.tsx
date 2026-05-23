'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { buildServiceCartInput } from '@/lib/service-cart';
import { useCartStore } from '@/lib/stores/cart-store';
import type { ServiceCatalogDetail } from '@/lib/types';
import { CalendarDays, ShoppingBasket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

const toLocalDateKey = (d: Date) =>
	`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const formatMnt = (n: number) => new Intl.NumberFormat('mn-MN').format(n) + '₮';

const QUANTITY_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1);

type ServiceBookingSidebarProps = {
	service: ServiceCatalogDetail;
	providerLabel?: string;
};

export const ServiceBookingSidebar = ({
	service,
	providerLabel = 'Үйлчилгээ үзүүлэгч',
}: ServiceBookingSidebarProps) => {
	const router = useRouter();
	const addServiceItem = useCartStore((s) => s.addServiceItem);
	const [date, setDate] = useState<Date | undefined>(undefined);
	const [quantity, setQuantity] = useState('1');

	const todayMidnight = useMemo(() => {
		const d = new Date();
		d.setHours(0, 0, 0, 0);
		return d;
	}, []);

	const qty = Math.max(1, parseInt(quantity, 10) || 1);
	const total = service.price_flat * qty;

	const pushToCart = () => {
		if (!date) {
			toast.error('Огноо сонгоно уу');
			return false;
		}

		addServiceItem(buildServiceCartInput(service, providerLabel, qty, toLocalDateKey(date)));
		return true;
	};

	const handleAddToCart = () => {
		if (!pushToCart()) return;
		toast.success('Сагсанд нэмэгдлээ');
	};

	const handleCheckout = () => {
		if (!pushToCart()) return;
		router.push('/cart');
	};

	return (
		<Card className='sticky top-24 overflow-hidden border-border pt-0 shadow-xl'>
			<CardHeader className='border-b border-primary/80 bg-primary py-6 text-primary-foreground'>
				<p className='text-center font-serif text-sm font-semibold tracking-wide uppercase md:text-base'>
					Захиалга хийх
				</p>
			</CardHeader>

			<CardContent className='space-y-5 pt-5'>
				<div className='rounded-lg bg-secondary/50 px-4 py-3'>
					<p className='text-xs font-medium tracking-wide text-muted-foreground uppercase'>
						Нэгжийн үнэ
					</p>
					<p className='mt-1 text-2xl font-bold text-foreground tabular-nums'>
						{formatMnt(service.price_flat)}
					</p>
				</div>

				<div>
					<label className='mb-2 flex items-center gap-2 text-sm font-medium text-foreground'>
						<CalendarDays className='size-4 text-accent' aria-hidden />
						Огноо *
					</label>
					<div className='rounded-lg border border-border bg-card p-2'>
						<Calendar
							mode='single'
							selected={date}
							onSelect={setDate}
							disabled={(d) => {
								const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
								return dayStart.getTime() < todayMidnight.getTime();
							}}
							className='mx-auto w-full max-w-full'
						/>
					</div>
					<p className='mt-2 text-[11px] text-muted-foreground'>
						Өнгөрсөн өдрийг сонгох боломжгүй.
					</p>
				</div>

				<div>
					<label className='mb-2 block text-sm font-medium text-foreground'>Тоо ширхэг</label>
					<Select value={quantity} onValueChange={setQuantity}>
						<SelectTrigger className='w-full'>
							<SelectValue placeholder='1' />
						</SelectTrigger>
						<SelectContent>
							{QUANTITY_OPTIONS.map((n) => (
								<SelectItem key={n} value={String(n)}>
									{n} ширхэг
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<Separator />

				<div className='space-y-2 text-sm'>
					<div className='flex justify-between text-muted-foreground'>
						<span>
							{formatMnt(service.price_flat)} × {qty} ширхэг
						</span>
						<span className='tabular-nums'>{formatMnt(total)}</span>
					</div>
					<Separator />
					<div className='flex justify-between text-base font-semibold text-foreground'>
						<span>Нийт</span>
						<span className='tabular-nums'>{formatMnt(total)}</span>
					</div>
				</div>
			</CardContent>

			<CardFooter className='flex-col gap-3 pb-6'>
				<Button
					type='button'
					className='w-full bg-primary text-primary-foreground hover:bg-primary/90'
					size='lg'
					onClick={handleCheckout}
					disabled={!date}
				>
					Захиалах
				</Button>
				<Button
					type='button'
					variant='outline'
					className='w-full gap-2 border-primary/30'
					size='lg'
					onClick={handleAddToCart}
					disabled={!date}
				>
					<ShoppingBasket className='size-4' aria-hidden />
					Сагсанд нэмэх
				</Button>
			</CardFooter>
		</Card>
	);
};
