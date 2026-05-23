'use client';

import { submitCheckoutOrder } from '@/actions/orders.actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { BANK_TRANSFER_INFO, QPAY_CHECKOUT_HINT } from '@/lib/payment-display';
import type { CartItem, CheckoutFormValues, CheckoutLineItemInput } from '@/lib/types';
import { checkoutFormSchema } from '@/lib/validations/checkout';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export type CheckoutAutofillContact = {
	fullName: string;
	email: string;
	phone: string;
};

type CheckoutSectionProps = {
	selectedItems: CartItem[];
	subtotal: number;
	total: number;
	onOrderSuccess: () => void;
	autofillContact?: CheckoutAutofillContact | null;
};

function toLineItems(items: CartItem[]): CheckoutLineItemInput[] {
	return items.map((item) => {
		if (item.itemType === 'service') {
			return {
				itemType: 'service',
				id: item.id,
				serviceId: item.serviceId,
				name: item.name,
				providerLabel: item.providerLabel,
				category: item.category,
				categoryLabel: item.categoryLabel,
				image: item.image ?? '',
				price: item.price,
				bookingDate: item.bookingDate,
				quantity: item.quantity,
			}
		}

		return {
			itemType: 'venue',
			id: item.id,
			venueId: item.venueId,
			name: item.name,
			providerLabel: item.providerLabel,
			category: item.category,
			categoryLabel: item.categoryLabel,
			image: item.image ?? '',
			price: item.priceMode === 'bundle_flat' && item.priceFlat != null ? item.priceFlat : item.price,
			bookingDate: item.bookingDate,
			guestCount: item.guestCount,
			...(item.packageId ? { packageId: item.packageId } : {}),
		}
	})
}

export function CheckoutSection({
	selectedItems,
	subtotal,
	total,
	onOrderSuccess,
	autofillContact,
}: CheckoutSectionProps) {
	const [isOrdering, setIsOrdering] = useState(false);
	const router = useRouter();

	const form = useForm<CheckoutFormValues>({
		resolver: zodResolver(checkoutFormSchema),
		defaultValues: {
			fullName: autofillContact?.fullName?.trim() ?? '',
			email: autofillContact?.email?.trim() ?? '',
			phone: autofillContact?.phone?.trim() ?? '',
			notes: '',
			paymentMethod: 'bank_transfer',
		},
	});

	const paymentMethod = form.watch('paymentMethod');
	const disabled = selectedItems.length === 0;
	const formBusy = disabled || isOrdering;

	const onSubmit = async (values: CheckoutFormValues) => {
		if (selectedItems.length === 0) {
			toast.error('Дор хаяж нэг үйлчилгээ сонгоно уу.');
			return;
		}

		setIsOrdering(true);
		try {
			const result = await submitCheckoutOrder({
				form: values,
				items: toLineItems(selectedItems),
				subtotal,
				total,
			});

			if (!result.ok) {
				toast.error(result.error);
				return;
			}

			const email = values.email.trim().toLowerCase();
			toast.success(`Захиалга илгээгдлээ (№ ${result?.orderId?.slice(0, 8)}…)`);
			onOrderSuccess();
			form.reset({
				fullName: '',
				email: '',
				phone: '',
				notes: '',
				paymentMethod: values.paymentMethod,
			});
			const qs = new URLSearchParams();
			qs.set('guestEmail', email);
			router.push(`/orders/${result.orderId}?${qs.toString()}`);
		} finally {
			setIsOrdering(false);
		}
	};

	return (
		<Card className='border-border bg-card'>
			<CardHeader className='pb-4'>
				<CardTitle className='text-lg'>Захиалгын мэдээлэл</CardTitle>
				<CardDescription>
					Холбоо барих мэдээлэл болон төлбөрийн аргыг бөглөнө үү.
				</CardDescription>
			</CardHeader>
			<CardContent className='relative'>
				{isOrdering ? (
					<div
						className='absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg bg-background/80 backdrop-blur-[2px]'
						role='status'
						aria-live='polite'
						aria-busy='true'
					>
						<Loader2 className='h-10 w-10 animate-spin text-accent' aria-hidden />
						<p className='text-sm font-medium text-foreground'>Захиалгыг илгээж байна…</p>
						<p className='max-w-xs px-4 text-center text-xs text-muted-foreground'>
							Түр хүлээнэ үү, бүү хаа.
						</p>
					</div>
				) : null}
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className='space-y-6'
						aria-busy={isOrdering}
					>
						<div className='grid gap-4 sm:grid-cols-2'>
							<FormField
								control={form.control}
								name='fullName'
								render={({ field }) => (
									<FormItem className='sm:col-span-2'>
										<FormLabel>Овог нэр</FormLabel>
										<FormControl>
											<Input
												placeholder='Таны бүтэн нэр'
												disabled={formBusy}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='email'
								render={({ field }) => (
									<FormItem>
										<FormLabel>И-мэйл</FormLabel>
										<FormControl>
											<Input
												type='email'
												placeholder='you@example.com'
												disabled={formBusy}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='phone'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Утас</FormLabel>
										<FormControl>
											<Input
												type='tel'
												placeholder='+976 99112233'
												disabled={formBusy}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='notes'
								render={({ field }) => (
									<FormItem className='sm:col-span-2'>
										<FormLabel>Нэмэлт тэмдэглэл (заавал биш)</FormLabel>
										<FormControl>
											<Textarea
												placeholder='Онцгой хүсэлт, хоолны хориглолт гэх мэт'
												className='min-h-[80px] resize-none'
												disabled={formBusy}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name='paymentMethod'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Төлбөрийн арга</FormLabel>
									<FormControl>
										<RadioGroup
											onValueChange={field.onChange}
											value={field.value}
											className='grid gap-3 sm:grid-cols-2'
											disabled={formBusy}
										>
											<label
												htmlFor='pay-bank'
												className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${field.value === 'bank_transfer' ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/30'} ${formBusy ? 'pointer-events-none opacity-50' : ''}`}
											>
												<RadioGroupItem
													value='bank_transfer'
													id='pay-bank'
													className='mt-1'
												/>
												<div className='space-y-1'>
													<div className='flex items-center gap-2 font-medium text-foreground'>
														<Building2 className='h-4 w-4 text-accent' />
														Банкны шилжүүлэг
													</div>
													<p className='text-xs text-muted-foreground'>
														Данс руу шууд төлбөр
													</p>
												</div>
											</label>
										</RadioGroup>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{paymentMethod === 'qpay' ? (
							<div className='rounded-lg border border-dashed border-accent/40 bg-secondary/30 p-4 text-sm text-muted-foreground'>
								<p className='font-medium text-foreground'>QPay</p>
								<p className='mt-2'>{QPAY_CHECKOUT_HINT}</p>
								<div className='mt-4 flex aspect-2/1 max-h-36 items-center justify-center rounded-md bg-muted text-xs'>
									QR код (QPay API холболт хийгдсний дараа)
								</div>
							</div>
						) : (
							<div className='rounded-lg border border-border bg-secondary/20 p-4 text-sm'>
								<p className='font-semibold text-foreground'>Дансны мэдээлэл</p>
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
								<p className='mt-3 text-xs text-muted-foreground'>
									Гүйлгээний утга дээр захиалгын дугаараа заавал бичнэ үү. Төлбөр орсны
									дараа баталгаажина.
								</p>
							</div>
						)}

						<Button
							type='submit'
							className='w-full bg-primary text-primary-foreground hover:bg-primary/90'
							disabled={formBusy}
						>
							{isOrdering ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Илгээж байна...
								</>
							) : (
								<>
									<CheckCircle2 className='mr-2 h-4 w-4' />
									Захиалга илгээх
								</>
							)}
						</Button>
					</form>
				</Form>
				<p className='mt-4 text-center text-xs text-muted-foreground'>
					Илгээснээр{' '}
					<Link href='/services' className='text-accent underline-offset-2 hover:underline'>
						үйлчилгээний нөхцөлийг
					</Link>{' '}
					зөвшөөрсөнд тооцно.
				</p>
			</CardContent>
		</Card>
	);
}
