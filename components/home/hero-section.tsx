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
import { cn } from '@/lib/utils';
import {
	DISTRICT_SLUG_LABELS,
	EVENT_TYPE_DEFAULT_CATEGORY,
	heroGuestsRangeToCapacity,
	serializeVenueSearchParams,
} from '@/lib/venue-search-params';
import { MapPin, Search, Users, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { DateRange } from 'react-day-picker';

const heroPopoverContentClass =
	'z-[100]  overflow-x-hidden overflow-y-auto overscroll-contain shadow-xl';

type PopoverKey = 'where' | 'when' | 'who' | null;

const GUEST_OPTIONS = [
	{ value: '10-30', label: '10-30 хүн' },
	{ value: '30-50', label: '30-50 хүн' },
	{ value: '50-100', label: '50-100 хүн' },
	{ value: '100-200', label: '100-200 хүн' },
	{ value: '200+', label: '200+ хүн' },
] as const;

const SUGGESTED_DISTRICTS = [
	{
		slug: 'sukhbaatar',
		title: 'Сүхбаатар дүүрэг',
		hint: 'Төв, олон танхим',
	},
	{
		slug: 'bayanzurkh',
		title: 'Баянзүрх дүүрэг',
		hint: 'Өргөн сонголт',
	},
	{
		slug: 'chingeltei',
		title: 'Чингэлтэй дүүрэг',
		hint: 'Хотын төвийн ойролцоо',
	},
	{
		slug: 'khan-uul',
		title: 'Хан-Уул дүүрэг',
		hint: 'Өргөн заал, гадаа талбай',
	},
] as const;

function SegmentTrigger({
	label,
	value,
	placeholder,
	active,
	className,
}: {
	label: string;
	value: string;
	placeholder: string;
	active: boolean;
	className?: string;
}) {
	return (
		<div
			className={cn(
				'flex min-h-13 min-w-0 flex-1 flex-col justify-center rounded-2xl px-4 py-2 text-left transition-all duration-200 md:min-h-0 md:rounded-full md:px-5 md:py-3',
				active ? 'bg-background shadow-md ring-1 ring-border/60' : 'hover:bg-background/50',
				className,
			)}
		>
			<span className='text-xs font-semibold text-foreground'>{label}</span>
			<span
				className={cn('truncate text-sm', value ? 'text-foreground' : 'text-muted-foreground')}
			>
				{value || placeholder}
			</span>
		</div>
	);
}

function Divider() {
	return <div className='hidden h-8 w-px shrink-0 bg-border/70 md:block' aria-hidden />;
}

function toLocalYmd(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

function formatHeroWhenRange(from: Date, to?: Date | undefined): string {
	const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
	const start = from.toLocaleDateString('en-US', opts);
	if (!to || toLocalYmd(from) === toLocalYmd(to)) {
		return start;
	}
	return `${start} - ${to.toLocaleDateString('en-US', opts)}`;
}

export function HeroSection({
	categoryOptions,
}: {
	categoryOptions: readonly { id: string; slug: string }[];
}) {
	const router = useRouter();
	const [eventType, setEventType] = useState('');
	const [location, setLocation] = useState('');
	const [service, setService] = useState('');
	const [guests, setGuests] = useState('');
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
	const [openPopover, setOpenPopover] = useState<PopoverKey>(null);
	const [calendarMonths, setCalendarMonths] = useState(1);

	useEffect(() => {
		const mq = window.matchMedia('(min-width: 640px)');
		const sync = () => setCalendarMonths(mq.matches ? 2 : 1);
		sync();
		mq.addEventListener('change', sync);
		return () => mq.removeEventListener('change', sync);
	}, []);

	const setOpen = (key: PopoverKey) => setOpenPopover(key);

	const whereSummary = (() => {
		const parts: string[] = [];
		if (location) parts.push(DISTRICT_SLUG_LABELS[location] ?? location);
		if (service) {
			const svc =
				{
					venue: 'Танхим',
					restaurant: 'Ресторан',
					hotel: 'Зочид буудал',
					cafe: 'Кафе',
					hall: 'Их танхим',
					outdoor: 'Гадаа',
				}[service] ?? service;
			parts.push(svc);
		}
		if (eventType) {
			const ev = {
				wedding: 'Хурим',
				birthday: 'Төрсөн өдөр',
				anniversary: 'Хонхны баяр',
				corporate: 'Байгууллага',
			}[eventType];
			if (ev) parts.push(ev);
		}
		return parts.join(' · ');
	})();

	const whenSummary = (() => {
		const from = dateRange?.from;
		if (!from) return '';
		return formatHeroWhenRange(from, dateRange?.to);
	})();

	const whoSummary = guests
		? (GUEST_OPTIONS.find((g) => g.value === guests)?.label ?? guests)
		: '';

	const handleSearch = () => {
		setOpen(null);
		const categoryFromService = service.trim() || null;
		const categoryFromEvent =
			!categoryFromService && eventType && EVENT_TYPE_DEFAULT_CATEGORY[eventType]
				? EVENT_TYPE_DEFAULT_CATEGORY[eventType]
				: null;
		const categorySlug = categoryFromService ?? categoryFromEvent;
		const categoryId = categorySlug
			? (categoryOptions.find((c) => c.slug === categorySlug)?.id ?? null)
			: null;

		const capacity = guests ? heroGuestsRangeToCapacity(guests) : null;

		let dateFrom: string | null = null;
		let dateTo: string | null = null;
		if (dateRange?.from) {
			dateFrom = toLocalYmd(dateRange.from);
			dateTo = dateRange.to ? toLocalYmd(dateRange.to) : dateFrom;
			if (dateTo < dateFrom) {
				[dateFrom, dateTo] = [dateTo, dateFrom];
			}
		}

		const qs = serializeVenueSearchParams({
			page: 1,
			categoryId,
			district: location.trim() || null,
			capacity,
			dateFrom,
			dateTo,
			event: eventType.trim() || null,
		});

		router.push(`/venues${qs}`);
	};

	return (
		<section className='relative flex min-h-[min(92dvh,640px)] w-full flex-col justify-center overflow-x-hidden py-8 md:min-h-[550px] md:py-10'>
			<div
				className='absolute inset-0 bg-cover bg-center bg-no-repeat'
				style={{
					backgroundImage: `url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098&auto=format&fit=crop')`,
				}}
			>
				<div className='hero-scrim absolute inset-0' />
			</div>

			<div className='relative z-10 mx-auto flex w-full max-w-5xl flex-col items-stretch gap-6 px-4 sm:gap-7 md:items-center'>
				<div className='text-center md:mx-auto md:max-w-3xl'>
					<h1 className='text-2xl font-bold tracking-tight text-balance text-primary-foreground sm:text-3xl md:text-4xl lg:text-5xl'>
						Төгс арга хэмжээний эхлэл
					</h1>
					<p className='mt-3 text-sm text-pretty text-primary-foreground/90 sm:text-base md:mt-4 md:text-lg'>
						Баталгаат үйлчилгээг, хамгийн таатай нөхцөлөөр ...
					</p>
				</div>

				<div className='w-full rounded-3xl border border-card/50 bg-card/55 p-2 shadow-2xl shadow-foreground/15 backdrop-blur-xl md:rounded-full md:p-1.5'>
					<div className='flex flex-col gap-2 md:flex-row md:items-center'>
						<Popover
							open={openPopover === 'where'}
							onOpenChange={(o) => setOpen(o ? 'where' : null)}
						>
							<PopoverTrigger asChild>
								<button
									type='button'
									className='min-w-0 flex-1 rounded-2xl border-0 bg-transparent p-0 text-left md:rounded-full'
								>
									<SegmentTrigger
										label='Хаана'
										value={whereSummary}
										placeholder='Дүүрэг, төрөл сонгох'
										active={openPopover === 'where'}
										className='w-full'
									/>
								</button>
							</PopoverTrigger>
							<PopoverContent
								className={cn(
									'w-[min(calc(100vw-1.5rem),400px)] rounded-2xl border-border/80 p-0',
									heroPopoverContentClass,
								)}
								sideOffset={10}
								avoidCollisions={false}
							>
								<div className='p-4'>
									<p className='text-sm font-semibold text-foreground'>
										Санал болгох байршил
									</p>
									<ul className='mt-3 space-y-1'>
										{SUGGESTED_DISTRICTS.map((d) => (
											<li key={d.slug}>
												<button
													type='button'
													className={cn(
														'flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors hover:bg-secondary',
														location === d.slug && 'bg-accent/10',
													)}
													onClick={() => {
														setLocation(d.slug);
													}}
												>
													<span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
														<MapPin className='h-4 w-4' />
													</span>
													<span>
														<span className='block text-sm font-semibold text-foreground'>
															{d.title}
														</span>
														<span className='text-xs text-muted-foreground'>
															{d.hint}
														</span>
													</span>
												</button>
											</li>
										))}
									</ul>
								</div>
								<div className='border-t border-border bg-secondary/20 px-4 py-3'>
									<div className='grid gap-3 sm:grid-cols-2'>
										<div className='space-y-1.5'>
											<Label className='text-xs font-medium text-muted-foreground'>
												Арга хэмжээ
											</Label>
											<Select value={eventType} onValueChange={setEventType}>
												<SelectTrigger className='h-10 w-full rounded-xl border bg-background'>
													<SelectValue placeholder='Сонгох' />
												</SelectTrigger>
												<SelectContent className='z-[9999]'>
													<SelectItem value='wedding'>Хурим найр</SelectItem>
													<SelectItem value='birthday'>Төрсөн өдөр</SelectItem>
													<SelectItem value='anniversary'>Хонхны баяр</SelectItem>
													<SelectItem value='corporate'>Байгууллагын</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className='space-y-1.5'>
											<Label className='text-xs font-medium text-muted-foreground'>
												Үйлчилгээ
											</Label>
											<Select value={service} onValueChange={setService}>
												<SelectTrigger className='h-10 w-full rounded-xl border bg-background'>
													<SelectValue placeholder='Төрөл' />
												</SelectTrigger>
												<SelectContent className='z-[9999]'>
													<SelectItem value='venue'>Танхим</SelectItem>
													<SelectItem value='restaurant'>Ресторан</SelectItem>
													<SelectItem value='hotel'>Зочид буудал</SelectItem>
													<SelectItem value='cafe'>Кафе</SelectItem>
													<SelectItem value='hall'>Их танхим</SelectItem>
													<SelectItem value='outdoor'>Гадаа талбай</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>
								</div>
							</PopoverContent>
						</Popover>
						<Divider />
						<Popover
							modal
							open={openPopover === 'when'}
							onOpenChange={(o) => setOpen(o ? 'when' : null)}
						>
							<div
								className={cn(
									'flex min-h-13 min-w-0 flex-1 items-stretch rounded-2xl transition-all duration-200 md:min-h-0 md:rounded-full',
									openPopover === 'when'
										? 'bg-background shadow-md ring-1 ring-border/60'
										: 'hover:bg-background/50',
								)}
							>
								<PopoverTrigger asChild>
									<button
										type='button'
										className='flex min-w-0 flex-1 flex-col justify-center rounded-2xl px-4 py-2 text-left md:rounded-l-full md:rounded-r-none md:px-5 md:py-3'
									>
										<span className='text-xs font-semibold text-foreground'>Хэзээ</span>
										<span
											className={cn(
												'truncate text-sm',
												whenSummary ? 'text-foreground' : 'text-muted-foreground',
											)}
										>
											{whenSummary || 'Огноо сонгох'}
										</span>
									</button>
								</PopoverTrigger>
								{dateRange?.from ? (
									<button
										type='button'
										className='flex shrink-0 items-center justify-center rounded-2xl pr-3 pl-1 text-muted-foreground hover:text-foreground md:rounded-l-none md:rounded-r-full md:pr-4'
										aria-label='Clear dates'
										onPointerDown={(e) => {
											e.preventDefault();
											e.stopPropagation();
										}}
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											setDateRange(undefined);
										}}
									>
										<X className='size-4' strokeWidth={2} />
									</button>
								) : null}
							</div>
							<PopoverContent
								className={cn(
									'w-auto max-w-[calc(100vw-1rem)] rounded-2xl border-border/80 p-0 sm:max-w-none',
									heroPopoverContentClass,
								)}
								sideOffset={10}
								avoidCollisions={false}
								onOpenAutoFocus={(e) => e.preventDefault()}
							>
								<Calendar
									mode='range'
									defaultMonth={dateRange?.from}
									selected={dateRange}
									onSelect={setDateRange}
									disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
									numberOfMonths={calendarMonths}
									className='p-3'
								/>
								<div className='flex justify-end gap-2 border-t border-border px-3 py-3'>
									<Button
										type='button'
										variant='ghost'
										size='sm'
										className='text-muted-foreground'
										onClick={() => {
											setDateRange(undefined);
										}}
									>
										Цэвэрлэх
									</Button>
									<Button type='button' size='sm' onClick={() => setOpen(null)}>
										Болсон
									</Button>
								</div>
							</PopoverContent>
						</Popover>
						<Divider />
						<Popover
							open={openPopover === 'who'}
							onOpenChange={(o) => setOpen(o ? 'who' : null)}
						>
							<PopoverTrigger asChild>
								<button
									type='button'
									className='min-w-0 flex-1 rounded-2xl border-0 bg-transparent p-0 text-left md:rounded-full'
								>
									<SegmentTrigger
										label='Зочид'
										value={whoSummary}
										placeholder='Тоо нэмэх'
										active={openPopover === 'who'}
										className='w-full'
									/>
								</button>
							</PopoverTrigger>
							<PopoverContent
								className={cn(
									'w-[min(calc(100vw-1.5rem),320px)] rounded-2xl border-border/80 p-2',
									heroPopoverContentClass,
								)}
								sideOffset={10}
								avoidCollisions={false}
							>
								<p className='px-2 pt-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
									Зочдын тоо
								</p>
								<ul className='mt-1'>
									{GUEST_OPTIONS.map((g) => (
										<li key={g.value}>
											<button
												type='button'
												className={cn(
													'flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-secondary',
													guests === g.value && 'bg-accent/15 font-medium',
												)}
												onClick={() => {
													setGuests(g.value);
													setOpen(null);
												}}
											>
												<Users className='h-4 w-4 text-muted-foreground' />
												{g.label}
											</button>
										</li>
									))}
								</ul>
							</PopoverContent>
						</Popover>
						<Button
							type='button'
							size='lg'
							className='aspect-square h-11 shrink-0 rounded-full bg-accent px-6 text-accent-foreground shadow-none transition-transform hover:bg-accent/90 active:scale-[0.98] md:ml-1 md:h-16 md:rounded-full md:px-5 md:pr-6'
							onClick={handleSearch}
						>
							<Search className='size-4.5 stroke-2' />
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
