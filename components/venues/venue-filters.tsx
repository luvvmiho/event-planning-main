'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import type { CatalogCategory } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
	capacityToGuestSlug,
	DISTRICT_SLUG_LABELS,
	EVENT_SLUG_LABELS,
	GUEST_SLUG_LABELS,
	matchVenueBudgetSlug,
	VENUE_BUDGET_OPTIONS,
	VENUE_SORT_VALUES,
	venueSearchParamsParsers,
	type GuestSlug,
} from '@/lib/venue-search-params';
import {
	Calculator,
	CalendarDays,
	Layers,
	MapPin,
	Search,
	Users,
	UtensilsCrossed,
	X,
} from 'lucide-react';
import { useQueryStates } from 'nuqs';
import { useEffect, useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';

interface VenueFiltersProps {
	totalCount: number;
	categoryCatalog: CatalogCategory[];
}

type VenueSort = (typeof VENUE_SORT_VALUES)[number];

const ALL = '__all__';

const SERVICE_SLUG_LABELS: Record<string, string> = {
	venue: 'Танхим',
	restaurant: 'Ресторан',
	hotel: 'Зочид буудал',
	cafe: 'Кафе',
	hall: 'Их танхим',
	outdoor: 'Гадаа талбай',
};

function toLocalYmd(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

function formatWhenRangeMn(from?: Date | null, to?: Date | null): string | null {
	if (!from) return null;
	const fmt = new Intl.DateTimeFormat('mn-MN', {
		month: 'short',
		day: 'numeric',
	});
	const a = fmt.format(from);
	if (!to || toLocalYmd(from) === toLocalYmd(to)) return a;
	return `${a} — ${fmt.format(to)}`;
}

export function VenueFilters({ totalCount, categoryCatalog }: VenueFiltersProps) {
	const [params, setParams] = useQueryStates(venueSearchParamsParsers);
	const { sort, district, event, categoryId, dateFrom, dateTo, capacity, minPrice, maxPrice } =
		params;

	const [dateOpen, setDateOpen] = useState(false);
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
	const [calendarMonths, setCalendarMonths] = useState(1);

	useEffect(() => {
		const mq = typeof window !== 'undefined' ? window.matchMedia('(min-width: 640px)') : null;
		const sync = () => setCalendarMonths(mq?.matches ? 2 : 1);
		sync();
		mq?.addEventListener('change', sync);
		return () => mq?.removeEventListener('change', sync);
	}, []);

	useEffect(() => {
		if (!dateFrom) {
			setDateRange(undefined);
			return;
		}
		const fromDate = new Date(`${dateFrom}T12:00:00`);
		const parsedTo = dateTo ? new Date(`${dateTo}T12:00:00`) : undefined;
		if (Number.isNaN(fromDate.getTime())) return;
		setDateRange({
			from: fromDate,
			to: parsedTo && !Number.isNaN(parsedTo.getTime()) ? parsedTo : fromDate,
		});
	}, [dateFrom, dateTo]);

	const districtSlugOptions = useMemo(() => Object.keys(DISTRICT_SLUG_LABELS), []);

	const serviceSlug = isCategoryUuid(categoryId ?? null)
		? (categoryCatalog.find((c) => c.id === categoryId)?.slug ?? ALL)
		: ALL;

	const guestSlug = capacityToGuestSlug(capacity ?? null) ?? ALL;
	const budgetSlug = matchVenueBudgetSlug(minPrice, maxPrice);

	const districtLabel = district ? (DISTRICT_SLUG_LABELS[district] ?? district) : null;
	const categoryRow = categoryId ? categoryCatalog.find((c) => c.id === categoryId) : undefined;
	const categoryLabel =
		categoryRow?.name ??
		(serviceSlug !== ALL ? (SERVICE_SLUG_LABELS[serviceSlug] ?? serviceSlug) : null);
	const eventLabel = event ? (EVENT_SLUG_LABELS[event] ?? event) : null;
	const whenLabel = dateRange?.from
		? formatWhenRangeMn(dateRange.from, dateRange?.to ?? dateRange.from)
		: null;

	const subtitlePrimary = `${totalCount.toLocaleString()} танхим олдлоо`;
	const subtitleHints = [
		districtLabel,
		categoryId ? categoryLabel : null,
		eventLabel,
		whenLabel,
		capacity != null
			? capacityToGuestSlug(capacity)
				? GUEST_SLUG_LABELS[capacityToGuestSlug(capacity)!]
				: `${capacity} хүн`
			: null,
		budgetSlug ? VENUE_BUDGET_OPTIONS.find((b) => b.slug === budgetSlug)?.label : null,
	].filter(Boolean);
	const subtitle =
		subtitleHints.length > 0
			? `${subtitlePrimary} · ${subtitleHints.join(' · ')}`
			: subtitlePrimary;

	const handleSortChange = (value: string) => {
		void setParams({ sort: value as VenueSort, page: 1 });
	};

	const applyDateToUrl = (range: DateRange | undefined) => {
		if (!range?.from) {
			void setParams({ dateFrom: null, dateTo: null, page: 1 });
			return;
		}
		const df = toLocalYmd(range.from);
		const dt = range.to ? toLocalYmd(range.to) : df;
		let a = df;
		let b = dt;
		if (b < a) [a, b] = [b, a];
		void setParams({ dateFrom: a, dateTo: b, page: 1 });
	};

	const handleSearchTap = () => {
		setDateOpen(false);
		void setParams({ page: 1 });
	};

	type Chip = { id: string; label: string };
	const chips: Chip[] = [];
	if (district && districtLabel) chips.push({ id: 'district', label: districtLabel });
	if (categoryId && categoryLabel) chips.push({ id: 'category', label: categoryLabel });
	if (event && eventLabel) chips.push({ id: 'event', label: eventLabel });
	if (whenLabel) chips.push({ id: 'date', label: whenLabel });
	if (capacity != null) {
		const gs = capacityToGuestSlug(capacity);
		chips.push({
			id: 'guests',
			label: gs ? GUEST_SLUG_LABELS[gs] : `${capacity} хүн`,
		});
	}
	if (budgetSlug)
		chips.push({
			id: 'budget',
			label:
				VENUE_BUDGET_OPTIONS.find((b) => b.slug === budgetSlug)?.label ?? String(budgetSlug),
		});

	const handleRemoveChip = (id: string) => {
		switch (id) {
			case 'district':
				void setParams({ district: null, page: 1 });
				break;
			case 'category':
				void setParams({ categoryId: null, page: 1 });
				break;
			case 'event':
				void setParams({ event: null, page: 1 });
				break;
			case 'date':
				void setParams({ dateFrom: null, dateTo: null, page: 1 });
				setDateRange(undefined);
				break;
			case 'guests':
				void setParams({ capacity: null, page: 1 });
				break;
			case 'budget':
				void setParams({ minPrice: null, maxPrice: null, page: 1 });
				break;
			default:
		}
	};

	const handleClearAll = () => {
		setDateRange(undefined);
		void setParams({
			district: null,
			categoryId: null,
			event: null,
			dateFrom: null,
			dateTo: null,
			capacity: null,
			minPrice: null,
			maxPrice: null,
			page: 1,
		});
	};

	const divider = (
		<div className='hidden h-14 w-px shrink-0 self-center bg-border lg:block' aria-hidden />
	);

	const cellClass = 'min-w-0 flex-1 px-4 py-3 lg:py-4';

	return (
		<div className='flex flex-col gap-6'>
			<div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
				<div>
					<h1 className='text-3xl font-bold text-foreground'>Хайлтын үр дүн</h1>
					<p className='mt-1 text-sm text-muted-foreground'>{subtitle}</p>
				</div>

				<div className='flex items-center gap-3'>
					<span className='text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
						Эрэмбэлэх
					</span>
					<Select value={sort} onValueChange={handleSortChange}>
						<SelectTrigger className='w-[200px]' aria-label='Эрэмбэлэх'>
							<SelectValue placeholder='Эрэмбэлэх' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='rating'>Үнэлгээгээр</SelectItem>
							<SelectItem value='price_asc'>Үнэ: багаас их руу</SelectItem>
							<SelectItem value='price_desc'>Үнэ: ихээс бага руу</SelectItem>
							<SelectItem value='newest'>Шинэ нь эхэндээ</SelectItem>
							<SelectItem value='name'>Нэрээр</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className='overflow-hidden rounded-2xl border bg-card shadow-sm'>
				<div className='flex flex-col lg:flex-row lg:divide-x lg:divide-y-0 lg:divide-border'>
					<div className={cellClass}>
						<Label className='flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase'>
							<MapPin className='h-3.5 w-3.5 text-accent' aria-hidden />
							Байршил
						</Label>
						<Select
							value={district ?? ALL}
							onValueChange={(v) =>
								void setParams({ district: v === ALL ? null : v, page: 1 })
							}
						>
							<SelectTrigger
								className='mt-1.5 h-auto border-0 bg-transparent px-0 py-0 text-base font-medium shadow-none ring-0 focus-visible:ring-0'
								aria-label='Дүүрэг сонгох'
							>
								<SelectValue placeholder='Сонгох' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={ALL}>Бүх дүүрэг</SelectItem>
								{districtSlugOptions.map((slug) => (
									<SelectItem key={slug} value={slug}>
										{DISTRICT_SLUG_LABELS[slug] ?? slug}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{divider}

					<div className={cellClass}>
						<Label className='flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase'>
							<UtensilsCrossed className='h-3.5 w-3.5 text-accent' aria-hidden />
							Үйлчилгээ
						</Label>
						<Select
							value={categoryRow?.slug ?? ALL}
							onValueChange={(slug) => {
								if (slug === ALL) {
									void setParams({ categoryId: null, page: 1 });
									return;
								}
								const row = categoryCatalog.find((c) => c.slug === slug);
								void setParams({ categoryId: row?.id ?? null, page: 1 });
							}}
						>
							<SelectTrigger
								className='mt-1.5 h-auto border-0 bg-transparent px-0 py-0 text-base font-medium shadow-none ring-0 focus-visible:ring-0'
								aria-label='Үйлчилгээний төрөл'
							>
								<SelectValue placeholder='Сонгох' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={ALL}>Бүгд</SelectItem>
								{categoryCatalog.map((c) => (
									<SelectItem key={c.id} value={c.slug}>
										{c.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{divider}

					<div className={cellClass}>
						<Label className='flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase'>
							<Layers className='h-3.5 w-3.5 text-accent' aria-hidden />
							Арга хэмжээний төрөл
						</Label>
						<Select
							value={event ?? ALL}
							onValueChange={(v) => void setParams({ event: v === ALL ? null : v, page: 1 })}
						>
							<SelectTrigger
								className='mt-1.5 h-auto border-0 bg-transparent px-0 py-0 text-base font-medium shadow-none ring-0 focus-visible:ring-0'
								aria-label='Арга хэмжээний төрөл'
							>
								<SelectValue placeholder='Сонгох' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={ALL}>Сонгохгүй</SelectItem>
								{Object.entries(EVENT_SLUG_LABELS).map(([slug, title]) => (
									<SelectItem key={slug} value={slug}>
										{title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{divider}

					<div className={cellClass}>
						<Label className='flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase'>
							<CalendarDays className='h-3.5 w-3.5 text-accent' aria-hidden />
							Өдөр
						</Label>
						<Popover open={dateOpen} onOpenChange={setDateOpen}>
							<PopoverTrigger asChild>
								<button
									type='button'
									className='mt-1.5 flex w-full items-center justify-between text-left text-base font-medium text-foreground hover:underline'
									aria-label='Огноо сонгох'
								>
									<span className={cn(!whenLabel && 'text-muted-foreground')}>
										{whenLabel ?? 'Сонгох'}
									</span>
								</button>
							</PopoverTrigger>
							<PopoverContent
								className='w-auto max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl border-border p-0 shadow-xl sm:max-w-none'
								align='start'
								sideOffset={8}
							>
								<div className='border-b border-border px-4 py-2.5'>
									<p className='text-sm font-semibold'>Огнооны цонх</p>
								</div>
								<Calendar
									mode='range'
									defaultMonth={dateRange?.from}
									selected={dateRange}
									onSelect={setDateRange}
									disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
									numberOfMonths={calendarMonths}
									className='p-3'
								/>
								<div className='flex justify-end gap-2 border-t border-border px-3 py-2.5'>
									<Button
										type='button'
										variant='ghost'
										size='sm'
										onClick={() => {
											setDateRange(undefined);
											applyDateToUrl(undefined);
										}}
									>
										Цэвэрлэх
									</Button>
									<Button
										type='button'
										size='sm'
										className='bg-accent text-accent-foreground hover:bg-accent/90'
										onClick={() => {
											applyDateToUrl(dateRange);
											setDateOpen(false);
											void setParams({ page: 1 });
										}}
									>
										Болсон
									</Button>
								</div>
							</PopoverContent>
						</Popover>
					</div>

					{divider}

					<div className='flex shrink-0 flex-col justify-center px-3 py-3 lg:border-border lg:px-5'>
						<Button
							type='button'
							onClick={handleSearchTap}
							className='h-12 min-w-28 gap-2 rounded-xl bg-accent px-6 font-semibold tracking-wide text-accent-foreground uppercase hover:bg-accent/90'
							aria-label='Хайх'
						>
							<Search className='h-4 w-4' aria-hidden />
							Хайх
						</Button>
					</div>
				</div>

				<div className='flex flex-col divide-y divide-border border-t border-border bg-secondary/25 sm:flex-row sm:divide-x sm:divide-y-0'>
					<div className={cn(cellClass, 'sm:flex-1')}>
						<Label className='flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase'>
							<Users className='h-3.5 w-3.5 text-accent' aria-hidden />
							Хүний тоо
						</Label>
						<Select
							value={guestSlug}
							onValueChange={(v) => {
								const cap =
									v === ALL
										? null
										: {
												'10-30': 30,
												'30-50': 50,
												'50-100': 100,
												'100-200': 200,
												'200+': 350,
											}[v as GuestSlug];
								void setParams({ capacity: cap, page: 1 });
							}}
						>
							<SelectTrigger
								className='mt-1.5 h-auto border-0 bg-transparent px-0 py-0 text-base font-medium shadow-none ring-0 focus-visible:ring-0'
								aria-label='Зочдын тоо'
							>
								<SelectValue placeholder='Сонгох' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={ALL}>Сонгохгүй</SelectItem>
								{(Object.entries(GUEST_SLUG_LABELS) as [GuestSlug, string][]).map(
									([slug, title]) => (
										<SelectItem key={slug} value={slug}>
											{title}
										</SelectItem>
									),
								)}
							</SelectContent>
						</Select>
					</div>

					<div className={cn(cellClass, 'sm:flex-1')}>
						<Label className='flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase'>
							<Calculator className='h-3.5 w-3.5 text-accent' aria-hidden />
							Төсөв
						</Label>
						<Select
							value={budgetSlug ? budgetSlug : ALL}
							onValueChange={(slug) => {
								if (slug === ALL) {
									void setParams({
										minPrice: null,
										maxPrice: null,
										page: 1,
									});
									return;
								}
								const row = VENUE_BUDGET_OPTIONS.find((b) => b.slug === slug);
								void setParams({
									minPrice: row?.minPrice ?? null,
									maxPrice: row?.maxPrice ?? null,
									page: 1,
								});
							}}
						>
							<SelectTrigger
								className='mt-1.5 h-auto border-0 bg-transparent px-0 py-0 text-base font-medium shadow-none ring-0 focus-visible:ring-0'
								aria-label='Төсөвийн муж'
							>
								<SelectValue placeholder='Сонгох' />
							</SelectTrigger>
							<SelectContent>
								{VENUE_BUDGET_OPTIONS.map((o) => (
									<SelectItem
										key={o.slug === '' ? 'budget-all' : o.slug}
										value={o.slug === '' ? ALL : o.slug}
									>
										{o.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			{chips.length > 0 && (
				<div className='flex flex-wrap items-center gap-x-4 gap-y-2'>
					<span className='text-xs font-bold tracking-wider text-muted-foreground uppercase'>
						Идэвхтэй шүүлтүүр:
					</span>
					<ul className='flex flex-wrap items-center gap-2'>
						{chips.map((chip) => (
							<li key={chip.id}>
								<button
									type='button'
									onClick={() => handleRemoveChip(chip.id)}
									className='inline-flex items-center gap-1.5 rounded-full border border-border bg-accent/10 px-3 py-1 text-sm font-medium text-foreground hover:bg-accent/20'
									aria-label={`${chip.label}-г хасах`}
								>
									<span>{chip.label}</span>
									<X className='h-3.5 w-3.5 text-muted-foreground' aria-hidden />
								</button>
							</li>
						))}
						<button
							type='button'
							onClick={handleClearAll}
							className='text-xs font-semibold tracking-wide text-accent uppercase hover:underline'
						>
							Бүгдийг цэвэрлэх
						</button>
					</ul>
				</div>
			)}
		</div>
	);
}

function isCategoryUuid(v: string | null): boolean {
	if (!v) return false;
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}
