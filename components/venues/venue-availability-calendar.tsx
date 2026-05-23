'use client';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { getVenueAvailability } from '@/lib/api';
import { useCartStore } from '@/lib/stores/cart-store';
import type {
   BookingPopoverProps,
   DayAvailability,
   VenueAvailabilityCalendarProps,
   VenueBookingEntry,
   VenueTimeSlot,
} from '@/lib/types';
import { cn } from '@/lib/utils';
import { venueCategoryCartLabel } from '@/lib/venue-labels';
import {
   CalendarDays,
   ChevronLeft,
   ChevronRight,
   ShoppingBasket,
   Tag,
   Users,
   X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

const MONGOLIAN_WEEKDAYS_SHORT = ['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя'];
const MONGOLIAN_WEEKDAYS_FULL = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'];
const MONGOLIAN_MONTHS = [
	'1-р сар',
	'2-р сар',
	'3-р сар',
	'4-р сар',
	'5-р сар',
	'6-р сар',
	'7-р сар',
	'8-р сар',
	'9-р сар',
	'10-р сар',
	'11-р сар',
	'12-р сар',
];

const DEFAULT_WEEKDAY_PRICE = 30000;
const DEFAULT_WEEKEND_PRICE = 55000;
const SERVICE_FEE_RATE = 0.05;

const formatPrice = (price: number) => price.toLocaleString() + '₮';
const formatDateKey = (date: Date) =>
	`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;
const isSameMonth = (a: Date, b: Date) =>
	a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

function getCalendarDays(month: Date): (Date | null)[] {
	const first = startOfMonth(month);
	const last = endOfMonth(month);
	const startPad = (first.getDay() + 6) % 7;
	const days: (Date | null)[] = Array(startPad).fill(null);
	for (let d = 1; d <= last.getDate(); d++) {
		days.push(new Date(month.getFullYear(), month.getMonth(), d));
	}
	while (days.length % 7 !== 0) days.push(null);
	return days;
}

function formatDisplayDate(date: Date): string {
	return `${date.getFullYear()} оны ${MONGOLIAN_MONTHS[date.getMonth()]} ${date.getDate()}, ${MONGOLIAN_WEEKDAYS_FULL[date.getDay()]}`;
}

export function VenueAvailabilityCalendar({ venueId, venue }: VenueAvailabilityCalendarProps) {
	const router = useRouter();
	const addVenueItem = useCartStore((s) => s.addVenueItem);

	const [currentMonth, setCurrentMonth] = useState(() => new Date());
	const [timeSlots, setTimeSlots] = useState<VenueTimeSlot[]>([]);
	const [bookings, setBookings] = useState<VenueBookingEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [openDate, setOpenDate] = useState<string | null>(null);
	const [guests, setGuests] = useState<string>(String(venue.capacity_min));

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const calendarDays = getCalendarDays(currentMonth);

	const step = venue.capacity_max > 100 ? 50 : 10;
	const guestOptions: number[] = [];
	for (let i = venue.capacity_min; i <= venue.capacity_max; i += step) {
		guestOptions.push(i);
	}
	if (!guestOptions.includes(venue.capacity_max)) guestOptions.push(venue.capacity_max);

	const fetchData = useCallback(async () => {
		setLoading(true);
		const month = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
		try {
			const { data } = await getVenueAvailability(venueId, month);
			setTimeSlots(data.slots);
			setBookings(data.bookings);
		} catch (err) {
			console.error('Failed to fetch availability:', err);
		} finally {
			setLoading(false);
		}
	}, [venueId, currentMonth]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const navigateMonth = (direction: 'prev' | 'next') => {
		setOpenDate(null);
		setCurrentMonth((prev) => {
			const d = new Date(prev);
			d.setMonth(d.getMonth() + (direction === 'next' ? 1 : -1));
			return d;
		});
	};

	const getDayInfo = (date: Date): DayAvailability => {
		const dateKey = formatDateKey(date);
		const dayOfWeek = date.getDay();
		const isBooked = bookings.some((b) => b.booking_date === dateKey);
		const slot = timeSlots.find((s) => s.day_of_week === dayOfWeek);
		const price =
			slot?.regular_price ?? (isWeekend(date) ? DEFAULT_WEEKEND_PRICE : DEFAULT_WEEKDAY_PRICE);
		const isOnSale = slot?.is_on_sale ?? false;
		const salePrice = slot?.sale_price ?? null;
		return { date: dateKey, isBooked, price, isOnSale, salePrice };
	};

	const handleAddToCart = (date: Date, dayPrice: number) => {
		const guestCount = parseInt(guests, 10);
		const serviceFee = Math.round(dayPrice * SERVICE_FEE_RATE);
		const total = dayPrice + serviceFee;

		const image =
			venue.image_url?.trim() || (Array.isArray(venue.images) && venue.images[0]) || '';

		const providerLabel = [venue.district]
			.filter((s): s is string => Boolean(s?.trim()))
			.join(' · ');

		addVenueItem({
			venueId: venue.id,
			name: venue.name,
			providerLabel: providerLabel || venue.location,
			category: venue.category,
			categoryLabel: venueCategoryCartLabel(venue.category),
			image,
			guestCount,
			price: total,
			bookingDate: formatDateKey(date),
		});

		setOpenDate(null);
		router.push('/cart');
	};

	return (
		<div className='w-full overflow-hidden rounded-lg border border-border bg-card'>
			<div className='flex items-center justify-between border-b border-border bg-secondary/30 px-4 py-3'>
				<Button
					variant='ghost'
					size='icon'
					onClick={() => navigateMonth('prev')}
					className='h-8 w-8'
					aria-label='Өмнөх сар'
				>
					<ChevronLeft className='h-4 w-4' />
				</Button>
				<h3 className='text-sm font-semibold text-foreground'>
					{currentMonth.getFullYear()} · {MONGOLIAN_MONTHS[currentMonth.getMonth()]}
				</h3>
				<Button
					variant='ghost'
					size='icon'
					onClick={() => navigateMonth('next')}
					className='h-8 w-8'
					aria-label='Дараагийн сар'
				>
					<ChevronRight className='h-4 w-4' />
				</Button>
			</div>

			{loading ? (
				<div className='flex h-64 items-center justify-center'>
					<div className='h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent' />
				</div>
			) : (
				<div className='p-3'>
					<div className='mb-1 grid grid-cols-7 gap-1'>
						{[...MONGOLIAN_WEEKDAYS_SHORT.slice(1), MONGOLIAN_WEEKDAYS_SHORT[0]].map((wd) => (
							<div
								key={wd}
								className='py-1 text-center text-xs font-medium text-muted-foreground'
							>
								{wd}
							</div>
						))}
					</div>

					<div className='grid grid-cols-7 gap-1'>
						{calendarDays.map((date, idx) => {
							if (!date) return <div key={`empty-${idx}`} />;

							const isPast = date < today;
							const isCurrentMonth = isSameMonth(date, currentMonth);
							const isToday = formatDateKey(date) === formatDateKey(today);
							const info = getDayInfo(date);
							const isOpen = openDate === info.date;
							const effectivePrice =
								info.isOnSale && info.salePrice ? info.salePrice : info.price;

							if (isPast || !isCurrentMonth) {
								return (
									<div
										key={info.date}
										className='flex min-h-[64px] flex-col items-center justify-start rounded-md p-1 opacity-30'
									>
										<span className='text-xs font-medium text-muted-foreground'>
											{date.getDate()}
										</span>
									</div>
								);
							}

							if (info.isBooked) {
								return (
									<div
										key={info.date}
										className='flex min-h-[64px] flex-col items-center justify-between rounded-md bg-muted p-1.5'
									>
										<span
											className={cn(
												'text-xs font-semibold',
												isWeekend(date) ? 'text-orange-400' : 'text-muted-foreground',
											)}
										>
											{date.getDate()}
										</span>
										<span className='text-[10px] leading-tight text-muted-foreground'>
											Захиалгатай
										</span>
									</div>
								);
							}

							return (
								<Popover
									key={info.date}
									open={isOpen}
									onOpenChange={(open) => {
										setOpenDate(open ? info.date : null);
										if (open) setGuests(String(venue.capacity_min));
									}}
								>
									<PopoverTrigger asChild>
										<button
											aria-label={`${date.getDate()} - ${formatPrice(effectivePrice)}`}
											className={cn(
												'flex min-h-[64px] w-full flex-col items-center justify-between rounded-md border p-1.5 transition-all',
												isOpen
													? 'border-accent bg-accent/15 ring-1 ring-accent'
													: isWeekend(date)
														? 'border-orange-200 bg-orange-50/50 hover:border-orange-400 hover:bg-orange-50'
														: 'border-border bg-white hover:border-accent/60 hover:bg-accent/5',
												isToday && !isOpen && 'ring-1 ring-accent/40',
											)}
										>
											<span
												className={cn(
													'text-xs font-semibold',
													isOpen
														? 'text-accent'
														: isWeekend(date)
															? 'text-orange-600'
															: 'text-foreground',
												)}
											>
												{date.getDate()}
												{isToday && (
													<span className='ml-0.5 text-[8px] text-accent'> ●</span>
												)}
											</span>
											<div className='flex flex-col items-center gap-0.5'>
												{info.isOnSale && info.salePrice && (
													<span className='text-[9px] font-medium text-green-600'>
														sale
													</span>
												)}
												<span
													className={cn(
														'text-[10px] leading-tight font-medium',
														isOpen ? 'text-accent' : 'text-foreground',
													)}
												>
													{formatPrice(effectivePrice)}
												</span>
											</div>
										</button>
									</PopoverTrigger>

									<PopoverContent
										side='bottom'
										align='center'
										sideOffset={6}
										className='w-72 p-0 shadow-lg'
										onOpenAutoFocus={(e) => e.preventDefault()}
									>
										<BookingPopover
											date={date}
											info={info}
											effectivePrice={effectivePrice}
											guests={guests}
											guestOptions={guestOptions}
											venue={venue}
											onGuestsChange={setGuests}
											onAddToCart={() => handleAddToCart(date, effectivePrice)}
											onClose={() => setOpenDate(null)}
										/>
									</PopoverContent>
								</Popover>
							);
						})}
					</div>
				</div>
			)}

			<div className='flex flex-wrap items-center gap-4 border-t border-border bg-secondary/20 px-4 py-3'>
				<div className='flex items-center gap-2'>
					<div className='h-5 w-9 rounded bg-muted' />
					<span className='text-xs text-muted-foreground'>захиалсан</span>
				</div>
				<div className='flex items-center gap-2'>
					<div className='h-5 w-9 rounded border border-border bg-white' />
					<span className='text-xs text-muted-foreground'>боломжтой</span>
				</div>
				<div className='flex items-center gap-2'>
					<div className='h-5 w-9 rounded border border-orange-200 bg-orange-50/50' />
					<span className='text-xs text-muted-foreground'>амралтын өдөр</span>
				</div>
				<div className='flex items-center gap-2'>
					<div className='h-5 w-9 rounded border border-accent bg-accent/15' />
					<span className='text-xs text-muted-foreground'>сонгосон</span>
				</div>
			</div>
		</div>
	);
}

function BookingPopover({
	date,
	info,
	effectivePrice,
	guests,
	guestOptions,
	venue,
	onGuestsChange,
	onAddToCart,
	onClose,
}: BookingPopoverProps) {
	const guestCount = parseInt(guests, 10);
	const serviceFee = Math.round(effectivePrice * SERVICE_FEE_RATE);
	const total = effectivePrice + serviceFee;

	return (
		<div className='flex flex-col'>
			<div className='flex items-center justify-between border-b border-border bg-secondary/30 px-4 py-3'>
				<div className='flex items-center gap-2 text-sm font-medium text-foreground'>
					<CalendarDays className='h-4 w-4 text-accent' />
					{formatDisplayDate(date)}
				</div>
				<button
					onClick={onClose}
					aria-label='Хаах'
					className='rounded p-0.5 text-muted-foreground hover:text-foreground'
				>
					<X className='h-4 w-4' />
				</button>
			</div>

			<div className='space-y-4 p-4'>
				{info.isOnSale && info.salePrice && (
					<div className='flex items-center gap-1.5 rounded-md bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700'>
						<Tag className='h-3.5 w-3.5' />
						Хямдрал: {formatPrice(info.price)} → {formatPrice(info.salePrice)}
					</div>
				)}

				<div>
					<label className='mb-1.5 block text-xs font-medium text-foreground'>
						Зочдын тоо
					</label>
					<Select value={guests} onValueChange={onGuestsChange}>
						<SelectTrigger className='h-9 w-full text-sm'>
							<div className='flex items-center gap-2'>
								<Users className='h-3.5 w-3.5 text-muted-foreground' />
								<SelectValue />
							</div>
						</SelectTrigger>
						<SelectContent>
							{guestOptions.map((count) => (
								<SelectItem key={count} value={String(count)}>
									{count} хүн
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<p className='mt-1 text-[11px] text-muted-foreground'>
						Багтаамж: {venue.capacity_min}–{venue.capacity_max} хүн
					</p>
				</div>

				<Separator />

				<div className='space-y-1.5 text-sm'>
					<div className='flex justify-between text-muted-foreground'>
						<span>Өдрийн үнэ</span>
						<span>{formatPrice(effectivePrice)}</span>
					</div>
					<div className='flex justify-between text-muted-foreground'>
						<span>Үйлчилгээний хураамж (5%)</span>
						<span>{formatPrice(serviceFee)}</span>
					</div>
					<Separator />
					<div className='flex justify-between font-semibold text-foreground'>
						<span>Нийт дүн</span>
						<span>{formatPrice(total)}</span>
					</div>
					<p className='text-[11px] text-muted-foreground'>{guestCount} зочинд · 1 өдөр</p>
				</div>

				<Button
					className='w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90'
					size='sm'
					onClick={onAddToCart}
				>
					<ShoppingBasket className='h-4 w-4' />
					Сагсанд нэмэх
				</Button>

				<p className='text-center text-[11px] text-muted-foreground'>
					Захиалга баталгаажуулах хүртэл төлбөр авахгүй
				</p>
			</div>
		</div>
	);
}
