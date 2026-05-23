'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from '@/components/ui/drawer';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { getVenueAvailability } from '@/lib/api';
import { useCartStore } from '@/lib/stores/cart-store';
import type { VenueEventPackagePublic } from '@/lib/types';
import { cn } from '@/lib/utils';
import { venueCategoryCartLabel } from '@/lib/venue-labels';
import { buildPackageCartItem, validatePackageGuests } from '@/lib/venue-package-order';
import { DISTRICT_SLUG_LABELS } from '@/lib/venue-search-params';
import { CalendarDays, ChevronRight, ShoppingBasket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const toLocalDateKey = (d: Date) =>
	`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

type BookingPriceMode = 'per_person' | 'package';

type PackagePickerListProps = {
	bundles: VenueEventPackagePublic[];
	selectedId?: string;
	onSelect: (id: string) => void;
	formatPrice: (price: number) => string;
	bundleGuestLabel: (bundle: VenueEventPackagePublic) => string;
};

const PackagePickerList = ({
	bundles,
	selectedId,
	onSelect,
	formatPrice,
	bundleGuestLabel,
}: PackagePickerListProps) => (
	<div className='flex max-h-[min(60vh,420px)] flex-col gap-2 overflow-y-auto pr-1'>
		{bundles.map((bundle) => {
			const isSelected = selectedId === bundle.id;
			return (
				<button
					key={bundle.id}
					type='button'
					onClick={() => onSelect(bundle.id)}
					className={cn(
						'w-full rounded-lg border p-3 text-left transition-colors',
						isSelected
							? 'border-accent bg-accent/5 ring-1 ring-accent/20'
							: 'border-border hover:border-accent/40',
					)}
				>
					<div className='flex items-start justify-between gap-3'>
						<div className='min-w-0 flex-1'>
							<p className='text-sm leading-snug font-medium text-foreground'>
								{bundle.name}
							</p>
							{bundle.short_description ? (
								<p className='mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground'>
									{bundle.short_description}
								</p>
							) : null}
							<p className='mt-1 text-xs text-muted-foreground'>
								{bundleGuestLabel(bundle)} · нийт үнэ
							</p>
						</div>
						<p className='shrink-0 text-sm font-semibold text-accent tabular-nums'>
							{formatPrice(bundle.price_flat)}₮
						</p>
					</div>
				</button>
			);
		})}
	</div>
);

interface VenueBookingSidebarProps {
	venue: {
		id: string;
		name: string;
		price_per_person: number;
		capacity_min: number;
		capacity_max: number;
		location: string;
		district?: string | null;
		category: string;
		image_url?: string | null;
		images?: string[] | null;
	};
	/** Active API bundles (optional) */
	bundles?: VenueEventPackagePublic[];
}

export const VenueBookingSidebar = ({ venue, bundles = [] }: VenueBookingSidebarProps) => {
	const router = useRouter();
	const isMobile = useIsMobile();
	const addVenueItem = useCartStore((s) => s.addVenueItem);
	const [date, setDate] = useState<Date | undefined>(undefined);
	const [guests, setGuests] = useState<string>('');
	const [priceMode, setPriceMode] = useState<BookingPriceMode>('per_person');
	const [bundleMode, setBundleMode] = useState<string>('');
	const [packagePickerOpen, setPackagePickerOpen] = useState(false);
	const [calendarMonth, setCalendarMonth] = useState(() => {
		const n = new Date();
		return new Date(n.getFullYear(), n.getMonth(), 1);
	});
	const [bookedKeys, setBookedKeys] = useState<Set<string>>(new Set());

	const todayMidnight = new Date();
	todayMidnight.setHours(0, 0, 0, 0);

	useEffect(() => {
		let cancelled = false;
		const monthParam = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, '0')}`;
		const run = async () => {
			try {
				const { data } = await getVenueAvailability(venue.id, monthParam);
				const next = new Set(
					data.bookings.map((b) =>
						b.booking_date.length >= 10 ? b.booking_date.slice(0, 10) : b.booking_date,
					),
				);
				if (!cancelled) setBookedKeys(next);
			} catch {
				if (!cancelled) setBookedKeys(new Set());
			}
		};
		void run();
		return () => {
			cancelled = true;
		};
	}, [venue.id, calendarMonth]);

	const validBundles = useMemo(() => {
		return bundles.filter((b) => {
			const bMin = b.guests_min ?? venue.capacity_min;
			const bMax = b.guests_max ?? venue.capacity_max;
			const min = Math.max(venue.capacity_min, bMin);
			const max = Math.min(venue.capacity_max, bMax);
			return min <= max;
		});
	}, [bundles, venue.capacity_min, venue.capacity_max]);

	useEffect(() => {
		if (bundleMode && !validBundles.some((b) => b.id === bundleMode)) {
			setBundleMode('');
			setPriceMode('per_person');
		}
	}, [bundleMode, validBundles]);

	const selectedBundle =
		priceMode === 'package' && bundleMode
			? validBundles.find((b) => b.id === bundleMode)
			: undefined;

	const guestBounds = useMemo(() => {
		if (!selectedBundle) {
			return { min: venue.capacity_min, max: venue.capacity_max };
		}
		const bMin = selectedBundle.guests_min ?? venue.capacity_min;
		const bMax = selectedBundle.guests_max ?? venue.capacity_max;
		return {
			min: Math.max(venue.capacity_min, bMin),
			max: Math.min(venue.capacity_max, bMax),
		};
	}, [selectedBundle, venue.capacity_min, venue.capacity_max]);

	const guestOptions = useMemo(() => {
		const { min, max } = guestBounds;
		const opts: number[] = [];
		const step = max > 100 ? 50 : 10;
		for (let i = min; i <= max; i += step) {
			opts.push(i);
		}
		if (!opts.includes(max)) {
			opts.push(max);
		}
		return [...new Set(opts)].sort((a, b) => a - b);
	}, [guestBounds]);

	useEffect(() => {
		const { min, max } = guestBounds;
		const current = guests ? parseInt(guests, 10) : NaN;
		if (!Number.isFinite(current) || current < min || current > max) {
			setGuests(String(min));
		}
	}, [guestBounds.min, guestBounds.max]);

	const formatPrice = (price: number) => new Intl.NumberFormat('mn-MN').format(price);

	const bundleGuestLabel = (bundle: VenueEventPackagePublic) => {
		const min = Math.max(venue.capacity_min, bundle.guests_min ?? venue.capacity_min);
		const max = Math.min(venue.capacity_max, bundle.guests_max ?? venue.capacity_max);
		return `${min}–${max} зочин`;
	};

	const handleSelectPerPerson = () => {
		setPriceMode('per_person');
		setBundleMode('');
		setPackagePickerOpen(false);
	};

	const handleSelectPackageMode = () => {
		setPriceMode('package');
		if (validBundles.length === 1) {
			setBundleMode(validBundles[0].id);
			return;
		}
		if (!bundleMode) {
			setPackagePickerOpen(true);
		}
	};

	const handlePickPackage = (id: string) => {
		setBundleMode(id);
		setPriceMode('package');
		setPackagePickerOpen(false);
	};

	const handlePriceModeChange = (value: BookingPriceMode) => {
		if (value === 'per_person') {
			handleSelectPerPerson();
			return;
		}
		handleSelectPackageMode();
	};

	const packagePickerContent = (
		<PackagePickerList
			bundles={validBundles}
			selectedId={bundleMode}
			onSelect={handlePickPackage}
			formatPrice={formatPrice}
			bundleGuestLabel={bundleGuestLabel}
		/>
	);

	const guestCount = guests ? parseInt(guests, 10) : guestBounds.min;
	const estimatedTotal = selectedBundle
		? selectedBundle.price_flat
		: venue.price_per_person * guestCount;
	const grandTotal = estimatedTotal;

	const pushToCart = () => {
		if (!date) return false;

		const bookingDate = toLocalDateKey(date);
		const providerLabel = [
			venue.district ? DISTRICT_SLUG_LABELS[venue.district] : undefined,
			venue.location,
		]
			.filter((s): s is string => Boolean(s && String(s).trim()))
			.join(' · ');
		const categoryLabel = venueCategoryCartLabel(venue.category);

		if (priceMode === 'package') {
			if (!selectedBundle) {
				toast.error('Багц сонгоно уу');
				setPackagePickerOpen(true);
				return false;
			}

			const pkgErr = validatePackageGuests(selectedBundle, guestCount);
			if (pkgErr) {
				toast.error(pkgErr);
				return false;
			}

			const built = buildPackageCartItem({
				venue,
				pkg: selectedBundle,
				guestCount,
				bookingDate,
				providerLabel: providerLabel || venue.location,
				categoryLabel,
			});
			if ('error' in built) {
				toast.error(built.error);
				return false;
			}
			addVenueItem(built.item);
			return true;
		}

		const { min, max } = guestBounds;
		if (!Number.isFinite(guestCount) || guestCount < min || guestCount > max) {
			toast.error(`Зочдын тоо ${min}–${max} хооронд байх ёстой`);
			return false;
		}

		const image =
			venue.image_url?.trim() || (Array.isArray(venue.images) && venue.images[0]) || '';

		addVenueItem({
			venueId: venue.id,
			name: venue.name,
			providerLabel: providerLabel || venue.location,
			category: venue.category,
			categoryLabel,
			image,
			guestCount,
			price: grandTotal,
			bookingDate,
			priceMode: 'per_person',
		});
		return true;
	};

	const handleOrder = () => {
		if (!pushToCart()) return;
		router.push('/cart');
	};

	const handleAddToCartStay = () => {
		if (!pushToCart()) return;
		toast.success('Сагсанд нэмэгдлээ');
	};

	return (
		<div className='space-y-4'>
			<Card className='sticky top-24 overflow-hidden border-border pt-0 shadow-xl'>
				<CardHeader className='border-b border-primary/80 bg-primary py-6! text-primary-foreground'>
					<p className='text-center font-serif text-sm font-semibold tracking-wide uppercase md:text-base'>
						Захиалга хийх
					</p>
				</CardHeader>

				<CardContent className='space-y-4'>
					{validBundles.length > 0 ? (
						<fieldset>
							<legend className='mb-2 block text-sm font-medium text-foreground'>
								Захиалгын төрөл
							</legend>
							<RadioGroup
								value={priceMode}
								onValueChange={(v) => handlePriceModeChange(v as BookingPriceMode)}
								className='flex flex-col gap-2'
							>
								<label
									htmlFor='booking-price-per-person'
									className={cn(
										'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
										priceMode === 'per_person'
											? 'border-accent bg-accent/5'
											: 'border-border hover:border-accent/30',
									)}
								>
									<RadioGroupItem
										value='per_person'
										id='booking-price-per-person'
										className='mt-0.5'
									/>
									<div className='min-w-0 flex-1'>
										<p className='text-sm font-medium text-foreground'>Хүн тутамд</p>
										<p className='mt-0.5 text-xs text-muted-foreground'>
											{formatPrice(venue.price_per_person)}₮ / хүн · зочны тоонд үржүүлэн
											тооцно
										</p>
									</div>
								</label>

								<div
									className={cn(
										'rounded-lg border transition-colors',
										priceMode === 'package'
											? 'border-accent bg-accent/5'
											: 'border-border',
									)}
								>
									<label
										htmlFor='booking-price-package'
										className='flex cursor-pointer items-start gap-3 p-3'
									>
										<RadioGroupItem
											value='package'
											id='booking-price-package'
											className='mt-0.5'
										/>
										<div className='min-w-0 flex-1'>
											<p className='text-sm font-medium text-foreground'>Багц</p>
											<p className='mt-0.5 text-xs text-muted-foreground'>
												Нэг мөрний нийт үнэ · хүн тоонд үржүүлэхгүй
											</p>
										</div>
									</label>

									{priceMode === 'package' ? (
										<button
											type='button'
											onClick={() => setPackagePickerOpen(true)}
											className={cn(
												'mx-3 mb-3 flex w-[calc(100%-1.5rem)] items-center justify-between gap-3 rounded-md border bg-background p-3 text-left transition-colors hover:border-accent/40',
												selectedBundle
													? 'border-border'
													: 'border-dashed border-border',
											)}
										>
											<div className='min-w-0 flex-1'>
												{selectedBundle ? (
													<>
														<p className='truncate text-sm font-medium text-foreground'>
															{selectedBundle.name}
														</p>
														<p className='mt-0.5 text-xs text-muted-foreground'>
															{bundleGuestLabel(selectedBundle)} · солих
														</p>
													</>
												) : (
													<>
														<p className='text-sm font-medium text-foreground'>
															Багц сонгох
														</p>
														<p className='mt-0.5 text-xs text-muted-foreground'>
															{validBundles.length} багц байна
														</p>
													</>
												)}
											</div>
											<div className='flex shrink-0 items-center gap-2'>
												{selectedBundle ? (
													<span className='text-sm font-semibold text-accent tabular-nums'>
														{formatPrice(selectedBundle.price_flat)}₮
													</span>
												) : null}
												<ChevronRight
													className='size-4 text-muted-foreground'
													aria-hidden
												/>
											</div>
										</button>
									) : null}
								</div>
							</RadioGroup>

							{isMobile ? (
								<Drawer open={packagePickerOpen} onOpenChange={setPackagePickerOpen}>
									<DrawerContent className='px-4 pb-8'>
										<DrawerHeader className='px-0 text-left'>
											<DrawerTitle>Багц сонгох</DrawerTitle>
											<DrawerDescription>
												Багцын үнэ нэг мөрний нийт дүн — хүн тоонд үржүүлэхгүй.
											</DrawerDescription>
										</DrawerHeader>
										{packagePickerContent}
									</DrawerContent>
								</Drawer>
							) : (
								<Dialog open={packagePickerOpen} onOpenChange={setPackagePickerOpen}>
									<DialogContent className='gap-4 sm:max-w-md'>
										<DialogHeader>
											<DialogTitle>Багц сонгох</DialogTitle>
										</DialogHeader>
										{packagePickerContent}
									</DialogContent>
								</Dialog>
							)}
						</fieldset>
					) : null}

					<div>
						<label className='mb-2 flex items-center gap-2 text-sm font-medium text-foreground'>
							<CalendarDays className='h-4 w-4 text-accent' aria-hidden />
							Огноо
						</label>
						<div className='rounded-lg border border-border bg-card p-2'>
							<Calendar
								mode='single'
								selected={date}
								onSelect={setDate}
								month={calendarMonth}
								onMonthChange={setCalendarMonth}
								disabled={(d) => {
									const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
									if (dayStart.getTime() < todayMidnight.getTime()) return true;
									return bookedKeys.has(toLocalDateKey(dayStart));
								}}
								className='mx-auto w-full max-w-full'
							/>
						</div>
						<p className='mt-2 text-[11px] text-muted-foreground'>
							Өнгөрсөн болон захиалгатай өдрийг сонгох боломжгүй. Сар өөрчлөхөд жагсаалт
							шинэчлэгдэнэ.
						</p>
					</div>

					<div>
						<label className='mb-2 block text-sm font-medium text-foreground'>
							Зочдын тоо
						</label>
						<Select value={guests} onValueChange={setGuests}>
							<SelectTrigger className='w-full'>
								<SelectValue placeholder={`${guestBounds.min} хүнээс сонгох`} />
							</SelectTrigger>
							<SelectContent>
								{guestOptions.map((count) => (
									<SelectItem key={count} value={count.toString()}>
										{count} хүн
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<p className='mt-1 text-xs text-muted-foreground'>
							Зочид: {guestBounds.min} – {guestBounds.max} хүн
							{selectedBundle ? ' (багцын хязгаар)' : ''}
						</p>
					</div>

					<Separator />

					<div className='space-y-2 text-sm'>
						{selectedBundle ? (
							<div className='flex justify-between'>
								<span className='font-semibold'>Багцын үнэ (нийт)</span>
								<span className='font-medium tabular-nums'>
									{formatPrice(selectedBundle.price_flat)}₮
								</span>
							</div>
						) : (
							<div className='flex justify-between'>
								<span className='font-semibold'>
									{formatPrice(venue.price_per_person)}₮ × {guestCount} хүн
								</span>
								<span className='tabular-nums'>{formatPrice(estimatedTotal)}₮</span>
							</div>
						)}
					</div>
				</CardContent>

				<CardFooter className='flex-col gap-3 pb-6'>
					<Button
						type='button'
						className='w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90'
						size='lg'
						onClick={handleOrder}
						disabled={!date}
					>
						Захиалах
					</Button>
					<Button
						type='button'
						variant='outline'
						className='w-full gap-2 border-primary/30'
						size='lg'
						onClick={handleAddToCartStay}
						disabled={!date}
					>
						<ShoppingBasket className='h-4 w-4' aria-hidden />
						Сагсанд нэмэх
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
};
