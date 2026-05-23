'use client';

import { CartLinePackageInfo } from '@/components/cart/cart-line-package-info';
import { CheckoutSection, type CheckoutAutofillContact } from '@/components/cart/checkout-section';
import { CartHeader } from '@/components/layout/cart-header';
import { Footer } from '@/components/layout/footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { isServiceCartItem, isVenueCartItem } from '@/lib/service-cart';
import { useCartStore } from '@/lib/stores/cart-store';
import type { CartItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CalendarDays, Clock, Hash, ShoppingBasket, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

function formatBookingDate(iso: string) {
	const d = new Date(`${iso}T12:00:00`);
	return d.toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric' });
}

const formatPrice = (price: number) => new Intl.NumberFormat('mn-MN').format(price) + '₮';

const getDetailIcon = (type: CartItem['detailType']) => {
	switch (type) {
		case 'capacity':
			return <Users className='h-4 w-4 text-accent' />;
		case 'quantity':
			return <Hash className='h-4 w-4 text-accent' />;
		case 'time':
			return <Clock className='h-4 w-4 text-accent' />;
		default:
			return <span className='text-accent'>✿</span>;
	}
};

const categoryHint = (item: CartItem) => {
	if (isVenueCartItem(item) && item.detailType === 'package') return 'БАГЦ';
	if (isServiceCartItem(item)) return 'ТОО';
	if (isVenueCartItem(item) && item.category === 'venue') return 'ХҮЛЭЭН АВАЛТ';
	return '';
};

type CartPageClientProps = {
	autofillContact?: CheckoutAutofillContact;
};

export function CartPageClient({ autofillContact }: CartPageClientProps) {
	const cartItems = useCartStore((s) => s.items);
	const toggleItemSelected = useCartStore((s) => s.toggleItemSelected);
	const removeItem = useCartStore((s) => s.removeItem);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const selectedItems = cartItems.filter((item) => item.selected);
	const subtotal = selectedItems.reduce((sum, item) => sum + item.price, 0);
	const total = subtotal;

	if (!mounted) {
		return (
			<div className='flex min-h-screen flex-col'>
				<CartHeader />
				<main className='flex-1 bg-background py-8'>
					<div className='container mx-auto px-4'>
						<div className='h-40 animate-pulse rounded-lg bg-muted' />
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	if (cartItems.length === 0) {
		return (
			<div className='flex min-h-screen flex-col'>
				<CartHeader />
				<main className='flex flex-1 flex-col items-center justify-center bg-background px-4 py-16'>
					<ShoppingBasket className='h-14 w-14 text-muted-foreground' />
					<h1 className='mt-6 text-2xl font-semibold text-foreground'>
						Таны сагс хоосон байна
					</h1>
					<p className='mt-2 max-w-md text-center text-sm text-muted-foreground'>
						Танхим эсвэл үйлчилгээ сонгож сагсанд нэмснээр энд харагдана.
					</p>
					<div className='mt-8 flex flex-wrap justify-center gap-3'>
						<Button className='bg-accent text-accent-foreground hover:bg-accent/90' asChild>
							<Link href='/venues'>Танхим үзэх</Link>
						</Button>
						<Button variant='outline' asChild>
							<Link href='/services'>Үйлчилгээ үзэх</Link>
						</Button>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	return (
		<div className='flex min-h-screen flex-col'>
			<CartHeader />
			<main className='flex-1 bg-background py-8'>
				<div className='container mx-auto px-4'>
					<div className='mb-8'>
						<h1 className='border-l-4 border-accent pl-4 text-3xl font-bold text-foreground italic'>
							Миний сагс
						</h1>
						<p className='mt-2 pl-5 text-sm text-muted-foreground'>
							Таны сонгосон үйлчилгээнүүд:
						</p>
					</div>

					<div className='grid gap-8 lg:grid-cols-3'>
						<div className='space-y-6 lg:col-span-2'>
							<div className='space-y-4'>
								{cartItems.map((item) => (
									<Card
										key={item.id}
										className={cn(
											'overflow-hidden border-border bg-card transition-all',
											item.selected && 'ring-1 ring-accent/30',
										)}
									>
										<CardContent className='p-4'>
											<div className='flex gap-4'>
												<div className='flex items-start pt-1'>
													<Checkbox
														checked={item.selected}
														onCheckedChange={() => toggleItemSelected(item.id)}
														className='h-5 w-5'
													/>
												</div>

												<div className='relative h-32 w-40 shrink-0 overflow-hidden rounded-lg bg-muted'>
													{item.image && (
														<img
															src={item.image}
															alt={item.name}
															className='h-full w-full object-cover'
														/>
													)}
												</div>

												<div className='flex flex-1 flex-col justify-between'>
													<div>
														<div className='mb-2 flex items-start justify-between gap-2'>
															<div>
																<Badge
																	variant='outline'
																	className='mb-2 border-accent/30 text-xs font-medium text-accent'
																>
																	{item.categoryLabel}
																</Badge>
																<h3 className='text-lg font-semibold text-foreground'>
																	{item.name}
																</h3>
																<p className='text-sm text-muted-foreground'>
																	{item.providerLabel}
																</p>
															</div>
															{item.category && categoryHint(item) ? (
																<span className='shrink-0 text-xs font-medium text-muted-foreground uppercase'>
																	{categoryHint(item)}
																</span>
															) : null}
														</div>

														<div className='flex flex-col gap-2 text-sm text-muted-foreground'>
															<div className='flex items-center gap-2'>
																<CalendarDays className='h-4 w-4 text-accent' />
																<span>{formatBookingDate(item.bookingDate)}</span>
															</div>
															<div className='flex items-center gap-2'>
																{getDetailIcon(item.detailType)}
																<span>{item.details}</span>
															</div>
														</div>

														{isVenueCartItem(item) ? (
															<CartLinePackageInfo item={item} className='mt-3' />
														) : null}

														<p className='mt-3 text-right text-lg font-semibold text-foreground tabular-nums'>
															{formatPrice(item.price)}
															{isVenueCartItem(item) &&
															item.detailType === 'package' ? (
																<span className='ml-1 text-xs font-normal text-muted-foreground'>
																	(багц)
																</span>
															) : null}
														</p>
													</div>

													<div className='mt-4 flex items-center gap-4'>
														<button
															type='button'
															onClick={() => removeItem(item.id)}
															className='flex items-center gap-1 text-sm text-destructive hover:text-destructive/80'
														>
															<Trash2 className='h-4 w-4' />
															УСТГАХ
														</button>
													</div>
												</div>
											</div>
										</CardContent>
									</Card>
								))}
							</div>

							<CheckoutSection
								selectedItems={selectedItems}
								subtotal={subtotal}
								total={total}
								autofillContact={autofillContact}
								onOrderSuccess={() => {
									const ids = new Set(selectedItems.map((i) => i.id));
									cartItems.filter((i) => ids.has(i.id)).forEach((i) => removeItem(i.id));
								}}
							/>
						</div>

						<div className='lg:col-span-1'>
							<Card className='sticky top-24 border-border bg-card'>
								<CardContent className='p-6'>
									<h2 className='mb-6 text-center text-lg font-semibold text-foreground'>
										Захиалгын хураангуй
									</h2>

									<div className='space-y-4'>
										{selectedItems.length > 0 ? (
											<ul className='space-y-3 border-b border-border pb-4'>
												{selectedItems.map((item) => (
													<li key={item.id} className='text-sm'>
														<div className='flex items-start justify-between gap-2'>
															<div className='min-w-0'>
																<p className='truncate font-medium text-foreground'>
																	{item.name}
																</p>
																{isVenueCartItem(item) &&
																item.detailType === 'package' &&
																item.packageName ? (
																	<p className='text-xs text-accent'>
																		Багц: {item.packageName}
																	</p>
																) : null}
																<p className='text-xs text-muted-foreground'>
																	{isServiceCartItem(item)
																		? `${item.quantity} ширхэг`
																		: isVenueCartItem(item)
																			? `${item.guestCount} зочин`
																			: ''}
																</p>
															</div>
															<span className='shrink-0 font-medium text-foreground tabular-nums'>
																{formatPrice(item.price)}
															</span>
														</div>
													</li>
												))}
											</ul>
										) : null}

										<div className='flex items-center justify-between text-sm'>
											<span className='text-muted-foreground'>
												Сонгосон үйлчилгээ ({selectedItems.length})
											</span>
											<span className='font-medium text-foreground'>
												{formatPrice(subtotal)}
											</span>
										</div>

										<div className='border-t border-border pt-4'>
											<div className='flex items-center justify-between'>
												<div>
													<p className='text-xs text-muted-foreground uppercase'>
														Нийт төлөх дүн
													</p>
													<p className='text-2xl font-bold text-foreground'>
														{formatPrice(total)}
													</p>
												</div>
											</div>
										</div>

										<p className='mt-4 text-center text-xs text-muted-foreground'>
											Доорх маягтыг бөглөж{' '}
											<span className='font-medium text-foreground'>
												Захиалга илгээх
											</span>{' '}
											дарна уу.
										</p>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}
