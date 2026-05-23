'use client';

import {
	checkoutEventPlanAction,
	clearEventPlanVenueAction,
	deleteEventPlanAction,
	patchEventPlanAction,
	setEventPlanVenueAction,
} from '@/app/event-plans/actions';
import type { CheckoutAutofillContact } from '@/components/cart/checkout-section';
import {
	EventPlanBudgetBar,
	formatMnt,
	planHasItems,
	planTitle,
} from '@/components/event-plans/event-plan-budget-bar';
import { EventPlanServicesStep } from '@/components/event-plans/event-plan-services-step';
import {
	EventPlanStepper,
	type EventPlanStep,
	type EventPlanStepId,
} from '@/components/event-plans/event-plan-stepper';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { fitPlanGuestCount, VenueCard, venueFitsEventPlan } from '@/components/venues/venue-card';
import { getVenueEventPackages } from '@/lib/api';
import { BANK_TRANSFER_INFO } from '@/lib/payment-display';
import type {
	CheckoutFormValues,
	EventPlanDetail,
	VenueEventPackagePublic,
	VenueListItem,
} from '@/lib/types';
import { cn } from '@/lib/utils';
import { checkoutFormSchema } from '@/lib/validations/checkout';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, CheckCircle2, ChevronLeft, ChevronRight, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type EventPlanBuilderProps = {
	plan: EventPlanDetail;
	venues: VenueListItem[];
	autofillContact?: CheckoutAutofillContact | null;
};

const STEP_ORDER: EventPlanStepId[] = ['budget', 'venue', 'services', 'checkout'];

const toLocalDateKey = (d: Date) =>
	`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const EventPlanBuilder = ({ plan, venues, autofillContact }: EventPlanBuilderProps) => {
	const router = useRouter();
	const [currentStep, setCurrentStep] = useState<EventPlanStepId>('budget');
	const [busy, setBusy] = useState(false);
	const [venueDialogOpen, setVenueDialogOpen] = useState(false);
	const [selectedVenue, setSelectedVenue] = useState<VenueListItem | null>(null);
	const [packages, setPackages] = useState<VenueEventPackagePublic[]>([]);
	const [packagesLoading, setPackagesLoading] = useState(false);
	const [priceMode, setPriceMode] = useState<'per_person' | 'package'>('per_person');
	const [selectedPackageId, setSelectedPackageId] = useState<string | undefined>();
	const [venueGuestCount, setVenueGuestCount] = useState(String(plan.guest_count ?? 50));
	const [venueBookingDate, setVenueBookingDate] = useState<Date | undefined>(
		plan.event_date ? new Date(plan.event_date + 'T12:00:00') : undefined,
	);
	const [confirmOverBudgetOpen, setConfirmOverBudgetOpen] = useState(false);
	const [pendingCheckout, setPendingCheckout] = useState<CheckoutFormValues | null>(null);

	const budgetForm = useForm({
		defaultValues: {
			name: plan.name ?? '',
			budget: plan.budget,
			event_date: plan.event_date ?? '',
			guest_count: plan.guest_count ?? undefined,
			notes: plan.notes ?? '',
		},
	});

	const checkoutForm = useForm<CheckoutFormValues>({
		resolver: zodResolver(checkoutFormSchema),
		defaultValues: {
			fullName: autofillContact?.fullName?.trim() ?? '',
			email: autofillContact?.email?.trim() ?? '',
			phone: autofillContact?.phone?.trim() ?? '',
			notes: '',
			paymentMethod: 'bank_transfer',
		},
	});

	const paymentMethod = checkoutForm.watch('paymentMethod');

	const todayMidnight = useMemo(() => {
		const d = new Date();
		d.setHours(0, 0, 0, 0);
		return d;
	}, []);

	const steps: EventPlanStep[] = [
		{ id: 'budget', label: 'Төсөв', complete: plan.budget > 0 },
		{ id: 'venue', label: 'Танхим', complete: Boolean(plan.venue) },
		{ id: 'services', label: 'Үйлчилгээ', complete: plan.services.length > 0 },
		{ id: 'checkout', label: 'Төлбөр', complete: false },
	];

	const currentStepIndex = STEP_ORDER.indexOf(currentStep);

	const fittingVenues = useMemo(
		() =>
			venues.filter((venue) =>
				venueFitsEventPlan(
					plan.guest_count,
					plan.budget,
					venue.capacity_min,
					venue.capacity_max,
					venue.price_per_person,
				),
			),
		[venues, plan.guest_count, plan.budget],
	);

	const handleRefresh = () => router.refresh();

	const goToStep = (step: EventPlanStepId) => setCurrentStep(step);

	const goNext = () => {
		if (currentStepIndex < STEP_ORDER.length - 1) {
			setCurrentStep(STEP_ORDER[currentStepIndex + 1]);
		}
	};

	const goPrev = () => {
		if (currentStepIndex > 0) {
			setCurrentStep(STEP_ORDER[currentStepIndex - 1]);
		}
	};

	const handleSaveBudget = async () => {
		const values = budgetForm.getValues();
		setBusy(true);
		const result = await patchEventPlanAction(plan.id, {
			name: values.name || undefined,
			budget: Number(values.budget),
			event_date: values.event_date || undefined,
			guest_count: values.guest_count ? Number(values.guest_count) : undefined,
			notes: values.notes || undefined,
		});
		setBusy(false);
		if (!result.ok) {
			toast.error(result.error);
			return;
		}
		toast.success('Хадгалагдлаа');
		handleRefresh();
		goNext();
	};

	const handleOpenVenueDialog = async (venue: VenueListItem) => {
		setSelectedVenue(venue);
		setPriceMode('per_person');
		setSelectedPackageId(undefined);
		setVenueGuestCount(
			String(fitPlanGuestCount(plan.guest_count, venue.capacity_min, venue.capacity_max)),
		);
		setVenueBookingDate(plan.event_date ? new Date(plan.event_date + 'T12:00:00') : undefined);
		setVenueDialogOpen(true);
		setPackagesLoading(true);
		try {
			const { data } = await getVenueEventPackages(venue.id);
			setPackages(data);
		} catch {
			setPackages([]);
		} finally {
			setPackagesLoading(false);
		}
	};

	const handleConfirmVenue = async () => {
		if (!selectedVenue || !venueBookingDate) {
			toast.error('Огноо сонгоно уу');
			return;
		}
		const guests = Math.max(1, parseInt(venueGuestCount, 10) || 1);
		if (priceMode === 'package' && !selectedPackageId) {
			toast.error('Багц сонгоно уу');
			return;
		}

		setBusy(true);
		const result = await setEventPlanVenueAction(plan.id, {
			venue_id: selectedVenue.id,
			venue_guest_count: guests,
			venue_booking_date: toLocalDateKey(venueBookingDate),
			...(priceMode === 'package' && selectedPackageId
				? { venue_package_id: selectedPackageId }
				: {}),
		});
		setBusy(false);

		if (!result.ok) {
			toast.error(result.error);
			return;
		}

		toast.success('Танхим сонгогдлоо');
		setVenueDialogOpen(false);
		handleRefresh();
	};

	const handleClearVenue = async () => {
		setBusy(true);
		const result = await clearEventPlanVenueAction(plan.id);
		setBusy(false);
		if (!result.ok) {
			toast.error(result.error);
			return;
		}
		toast.success('Танхим хасагдлаа');
		handleRefresh();
	};

	const runCheckout = async (values: CheckoutFormValues) => {
		setBusy(true);
		const result = await checkoutEventPlanAction(plan.id, values);
		setBusy(false);
		if (!result.ok) {
			toast.error(result.error);
			return;
		}
		toast.success('Захиалга амжилттай');
		router.push(`/orders/${result.orderId}`);
	};

	const handleCheckoutSubmit = checkoutForm.handleSubmit(async (values) => {
		if (!planHasItems(plan)) {
			toast.error('Танхим эсвэл үйлчилгээ сонгоно уу');
			return;
		}
		if (plan.over_budget) {
			setPendingCheckout(values);
			setConfirmOverBudgetOpen(true);
			return;
		}
		await runCheckout(values);
	});

	const handleDeletePlan = async () => {
		if (!window.confirm('Энэ төлөвлөгөөг устгах уу?')) return;
		setBusy(true);
		const result = await deleteEventPlanAction(plan.id);
		setBusy(false);
		if (!result.ok) {
			toast.error(result.error);
			return;
		}
		toast.success('Устгагдлаа');
		router.push('/event-plans');
	};

	return (
		<div className='space-y-6'>
			<div className='flex flex-wrap items-start justify-between gap-4'>
				<div>
					<h1 className='border-l-4 border-accent pl-4 text-2xl font-bold text-foreground italic md:text-3xl'>
						{planTitle(plan)}
					</h1>
					<p className='mt-2 pl-5 text-sm text-muted-foreground'>
						Төсөв → 1 танхим → төрөл бүрийн үйлчилгээ → захиалга
					</p>
				</div>
				<Button
					type='button'
					variant='outline'
					size='sm'
					className='gap-2 text-destructive hover:text-destructive'
					onClick={handleDeletePlan}
					disabled={busy}
				>
					<Trash2 className='size-4' aria-hidden />
					Устгах
				</Button>
			</div>

			<EventPlanBudgetBar
				budget={plan.budget}
				estimatedTotal={plan.estimated_total}
				remainingBudget={plan.remaining_budget}
				overBudget={plan.over_budget}
			/>

			<EventPlanStepper steps={steps} currentStep={currentStep} onStepChange={goToStep} />

			<div className='rounded-xl border border-border bg-card p-5 md:p-6'>
				{currentStep === 'budget' ? (
					<div className='space-y-4'>
						<div>
							<h3 className='text-lg font-semibold text-foreground'>Төсөв ба арга хэмжээ</h3>
							<p className='mt-1 text-sm text-muted-foreground'>
								Төлөвлөгөөний үндсэн мэдээллээ оруулна уу.
							</p>
						</div>
						<div className='grid gap-4 md:grid-cols-2'>
							<div>
								<Label htmlFor='plan-name'>Нэр</Label>
								<Input id='plan-name' className='mt-1.5' {...budgetForm.register('name')} />
							</div>
							<div>
								<Label htmlFor='plan-budget'>Төсөв (₮) *</Label>
								<Input
									id='plan-budget'
									type='number'
									min={1}
									className='mt-1.5'
									{...budgetForm.register('budget', { valueAsNumber: true })}
								/>
							</div>
							<div>
								<Label htmlFor='plan-guests'>Зочдын тоо</Label>
								<Input
									id='plan-guests'
									type='number'
									min={1}
									className='mt-1.5'
									{...budgetForm.register('guest_count', { valueAsNumber: true })}
								/>
							</div>
							<div>
								<Label htmlFor='plan-date'>Огноо (YYYY-MM-DD)</Label>
								<Input
									id='plan-date'
									placeholder='2026-09-01'
									className='mt-1.5'
									{...budgetForm.register('event_date')}
								/>
							</div>
							<div className='md:col-span-2'>
								<Label htmlFor='plan-notes'>Тэмдэглэл</Label>
								<Textarea
									id='plan-notes'
									rows={3}
									className='mt-1.5'
									{...budgetForm.register('notes')}
								/>
							</div>
						</div>
					</div>
				) : null}

				{currentStep === 'venue' ? (
					<div className='space-y-4'>
						<div>
							<h3 className='text-lg font-semibold text-foreground'>Танхим сонгох</h3>
							<p className='mt-1 text-sm text-muted-foreground'>
								{plan.guest_count && plan.budget
									? `${plan.guest_count} зочин, ${formatMnt(plan.budget)} төсөвт тохирох танхимууд (зочин × хүн тутамд үнэ).`
									: plan.guest_count
										? `${plan.guest_count} зочинд тохирох танхимууд. Төсөв алхам дээр төсөв оруулна уу.`
										: 'Эхлээд төсөв алхам дээр зочдын тоо болон төсөв оруулна уу.'}
							</p>
						</div>

						{plan.venue ? (
							<div className='rounded-xl border border-accent/30 bg-accent/5 p-4'>
								<div className='flex flex-wrap items-start justify-between gap-3'>
									<div>
										<div className='flex items-center gap-2'>
											<Building2 className='size-5 text-accent' aria-hidden />
											<h4 className='font-semibold text-foreground'>
												{plan.venue.venue_name}
											</h4>
											<Badge>Сонгогдсон</Badge>
										</div>
										{plan.venue.venue_package_name ? (
											<p className='mt-1 text-sm text-muted-foreground'>
												Багц: {plan.venue.venue_package_name}
											</p>
										) : (
											<p className='mt-1 text-sm text-muted-foreground'>
												{plan.venue.venue_guest_count} зочин · хүн тутамд
											</p>
										)}
										<p className='mt-1 text-sm text-muted-foreground'>
											{plan.venue.venue_booking_date}
										</p>
										<p className='mt-2 text-lg font-semibold text-foreground tabular-nums'>
											{formatMnt(plan.venue.estimated_price)}
										</p>
									</div>
									<div className='flex gap-2'>
										{plan.venue.venue_slug ? (
											<Button variant='outline' size='sm' asChild>
												<Link href={`/venues/${plan.venue.venue_slug}`}>
													Дэлгэрэнгүй
												</Link>
											</Button>
										) : null}
										<Button
											type='button'
											variant='outline'
											size='sm'
											onClick={handleClearVenue}
											disabled={busy}
										>
											Хасах
										</Button>
									</div>
								</div>
							</div>
						) : (
							<p className='rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground'>
								Доорх жагсаалтаас нэг танхим сонгоно уу.
							</p>
						)}

						{!plan.guest_count || !plan.budget ? (
							<p className='rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground'>
								{!plan.guest_count && !plan.budget
									? 'Зочдын тоо болон төсөв оруулаагүй байна.'
									: !plan.guest_count
										? 'Зочдын тоо оруулаагүй байна.'
										: 'Төсөв оруулаагүй байна.'}{' '}
								<button
									type='button'
									className='font-medium text-accent underline-offset-4 hover:underline'
									onClick={() => goToStep('budget')}
								>
									Төсөв алхам руу буцах
								</button>
							</p>
						) : fittingVenues.length === 0 ? (
							<p className='rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground'>
								{plan.guest_count} зочин, {formatMnt(plan.budget)} төсөвт тохирох танхим
								олдсонгүй.
							</p>
						) : (
							<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
								{fittingVenues.map((venue) => {
									const isSelected = plan.venue?.venue_id === venue.id;
									const fittedGuests = fitPlanGuestCount(
										plan.guest_count,
										venue.capacity_min,
										venue.capacity_max,
									);

									return (
										<VenueCard
											key={venue.id}
											name={venue.name}
											slug={venue.slug}
											imageUrl={venue.image_url}
											locationLine={venue.location}
											district={venue.district ?? ''}
											pricePerPerson={venue.price_per_person}
											rating={Number(venue.rating ?? 0)}
											isFeatured={venue.is_featured}
											isNew={venue.is_new}
											planGuestCount={fittedGuests}
											onSelect={() => handleOpenVenueDialog(venue)}
											selectLabel={isSelected ? 'Солих' : 'Сонгох'}
											metaBadge={
												isSelected ? (
													<Badge className='border-0 bg-primary/95 text-primary-foreground'>
														Сонгогдсон
													</Badge>
												) : undefined
											}
											className={cn(isSelected && 'border-accent ring-2 ring-accent/20')}
										/>
									);
								})}
							</div>
						)}
					</div>
				) : null}

				{currentStep === 'services' ? (
					<EventPlanServicesStep
						plan={plan}
						busy={busy}
						setBusy={setBusy}
						onUpdated={handleRefresh}
					/>
				) : null}

				{currentStep === 'checkout' ? (
					<div className='grid gap-6 lg:grid-cols-2'>
						<div>
							<h3 className='font-semibold text-foreground'>Төлөвлөгөөний дүгнэлт</h3>
							<div className='mt-4 space-y-3 text-sm'>
								{plan.venue ? (
									<div className='flex justify-between gap-2'>
										<span className='text-muted-foreground'>{plan.venue.venue_name}</span>
										<span className='tabular-nums'>
											{formatMnt(plan.venue.estimated_price)}
										</span>
									</div>
								) : null}
								{plan.services.map((line) => (
									<div key={line.id} className='flex justify-between gap-2'>
										<span className='text-muted-foreground'>
											{line.service_name} × {line.quantity}
										</span>
										<span className='tabular-nums'>
											{formatMnt(line.estimated_price)}
										</span>
									</div>
								))}
								{!plan.venue && plan.services.length === 0 ? (
									<p className='text-muted-foreground'>Сонголт хийгээгүй байна.</p>
								) : null}
								<Separator />
								<div className='flex justify-between font-semibold text-foreground'>
									<span>Нийт</span>
									<span className='tabular-nums'>{formatMnt(plan.estimated_total)}</span>
								</div>
							</div>
						</div>

						<Form {...checkoutForm}>
							<form
								onSubmit={handleCheckoutSubmit}
								className='space-y-4 rounded-xl border border-border bg-background p-4'
							>
								<h3 className='font-semibold text-foreground'>Захиалгын мэдээлэл</h3>
								<FormField
									control={checkoutForm.control}
									name='fullName'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Овог нэр</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={checkoutForm.control}
									name='email'
									render={({ field }) => (
										<FormItem>
											<FormLabel>И-мэйл</FormLabel>
											<FormControl>
												<Input type='email' {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={checkoutForm.control}
									name='phone'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Утас</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={checkoutForm.control}
									name='paymentMethod'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Төлбөрийн хэлбэр</FormLabel>
											<FormControl>
												<RadioGroup
													onValueChange={field.onChange}
													value={field.value}
													className='grid gap-2'
												>
													<div className='flex items-center gap-2 rounded-lg border border-border p-3'>
														<RadioGroupItem value='bank_transfer' id='ep-bank' />
														<Label htmlFor='ep-bank'>Банкны шилжүүлэг</Label>
													</div>
												</RadioGroup>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<div className='rounded-lg border border-border bg-secondary/20 p-3 text-xs text-muted-foreground'>
									<p className='font-semibold text-foreground'>Дансны мэдээлэл</p>
									<ul className='mt-2 space-y-1'>
										<li>
											<span className='text-foreground'>Банк: </span>
											{BANK_TRANSFER_INFO.bankName}
										</li>
										<li>
											<span className='text-foreground'>Данс: </span>
											<span className='font-mono text-foreground'>
												{BANK_TRANSFER_INFO.accountNumber}
											</span>
										</li>
									</ul>
								</div>

								<Button
									type='submit'
									size='lg'
									className='w-full gap-2'
									disabled={busy || !planHasItems(plan)}
								>
									{busy ? (
										<Loader2 className='size-4 animate-spin' aria-hidden />
									) : (
										<CheckCircle2 className='size-4' aria-hidden />
									)}
									Захиалга баталгаажуулах
								</Button>
							</form>
						</Form>
					</div>
				) : null}

				{currentStep !== 'checkout' ? (
					<div className='mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5'>
						<Button
							type='button'
							variant='outline'
							onClick={goPrev}
							disabled={currentStepIndex === 0 || busy}
							className='gap-1'
						>
							<ChevronLeft className='size-4' aria-hidden />
							Өмнөх
						</Button>

						{currentStep === 'budget' ? (
							<Button
								type='button'
								onClick={handleSaveBudget}
								disabled={busy}
								className='gap-1'
							>
								{busy ? <Loader2 className='size-4 animate-spin' aria-hidden /> : null}
								Хадгалах
								<ChevronRight className='size-4' aria-hidden />
							</Button>
						) : (
							<Button
								type='button'
								onClick={goNext}
								disabled={currentStepIndex === STEP_ORDER.length - 1 || busy}
								className='gap-1'
							>
								Дараах
								<ChevronRight className='size-4' aria-hidden />
							</Button>
						)}
					</div>
				) : (
					<div className='mt-8 border-t border-border pt-5'>
						<Button
							type='button'
							variant='outline'
							onClick={goPrev}
							disabled={busy}
							className='gap-1'
						>
							<ChevronLeft className='size-4' aria-hidden />
							Өмнөх
						</Button>
					</div>
				)}
			</div>

			<Dialog open={venueDialogOpen} onOpenChange={setVenueDialogOpen}>
				<DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
					<DialogHeader>
						<DialogTitle>{selectedVenue?.name ?? 'Танхим сонгох'}</DialogTitle>
					</DialogHeader>

					<div className='space-y-4'>
						<div>
							<Label className='mb-2 block'>Үнийн горим</Label>
							<RadioGroup
								value={priceMode}
								onValueChange={(v) => {
									setPriceMode(v as 'per_person' | 'package');
									if (v === 'per_person') setSelectedPackageId(undefined);
								}}
								className='grid gap-2'
							>
								<div className='flex items-center gap-2 rounded-lg border border-border p-3'>
									<RadioGroupItem value='per_person' id='ep-per-person' />
									<Label htmlFor='ep-per-person'>Хүн тутамд</Label>
								</div>
								<div className='flex items-center gap-2 rounded-lg border border-border p-3'>
									<RadioGroupItem
										value='package'
										id='ep-package'
										disabled={packages.length === 0 && !packagesLoading}
									/>
									<Label htmlFor='ep-package'>Багц</Label>
								</div>
							</RadioGroup>
						</div>

						{priceMode === 'package' ? (
							<div>
								<Label className='mb-2 block'>Багц сонгох</Label>
								{packagesLoading ? (
									<Loader2 className='size-5 animate-spin' />
								) : packages.length === 0 ? (
									<p className='text-sm text-muted-foreground'>Идэвхтэй багц алга</p>
								) : (
									<Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
										<SelectTrigger>
											<SelectValue placeholder='Багц сонгох' />
										</SelectTrigger>
										<SelectContent>
											{packages.map((pkg) => (
												<SelectItem key={pkg.id} value={pkg.id}>
													{pkg.name} — {formatMnt(pkg.price_flat)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							</div>
						) : (
							<div>
								<Label htmlFor='ep-guests'>Зочдын тоо</Label>
								<Input
									id='ep-guests'
									type='number'
									min={1}
									className='mt-1.5'
									value={venueGuestCount}
									onChange={(e) => setVenueGuestCount(e.target.value)}
								/>
							</div>
						)}

						<div>
							<Label className='mb-2 block'>Захиалгын огноо</Label>
							<div className='rounded-lg border border-border p-2'>
								<Calendar
									mode='single'
									selected={venueBookingDate}
									onSelect={setVenueBookingDate}
									disabled={(d) => {
										const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
										return dayStart.getTime() < todayMidnight.getTime();
									}}
									className='mx-auto'
								/>
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button type='button' variant='outline' onClick={() => setVenueDialogOpen(false)}>
							Болих
						</Button>
						<Button type='button' onClick={handleConfirmVenue} disabled={busy}>
							{busy ? <Loader2 className='size-4 animate-spin' aria-hidden /> : null}
							Хадгалах
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog open={confirmOverBudgetOpen} onOpenChange={setConfirmOverBudgetOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Төсөв хэтэрсэн</AlertDialogTitle>
						<AlertDialogDescription>
							Тооцоолсон зардал ({formatMnt(plan.estimated_total)}) таны төсвөөс (
							{formatMnt(plan.budget)}) {formatMnt(Math.abs(plan.remaining_budget))}-р
							хэтэрсэн байна. Үргэлжлүүлэх үү?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Болих</AlertDialogCancel>
						<AlertDialogAction
							onClick={async () => {
								if (pendingCheckout) await runCheckout(pendingCheckout);
								setConfirmOverBudgetOpen(false);
								setPendingCheckout(null);
							}}
						>
							Захиалах
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};
