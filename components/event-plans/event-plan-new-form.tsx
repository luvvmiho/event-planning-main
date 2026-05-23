'use client';

import { createEventPlanAction } from '@/app/event-plans/actions';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
import { Textarea } from '@/components/ui/textarea';
import { createEventPlanSchema } from '@/lib/validations/event-plan';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = createEventPlanSchema;

type FormValues = z.infer<typeof formSchema>;

export const EventPlanNewForm = () => {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			budget: undefined,
			name: '',
			guest_count: undefined,
			notes: '',
		},
	});

	const handleSubmit = async (values: FormValues) => {
		setIsSubmitting(true);
		const result = await createEventPlanAction({
			...values,
			budget: Number(values.budget),
			guest_count: values.guest_count ? Number(values.guest_count) : undefined,
		});
		setIsSubmitting(false);

		if (!result.ok) {
			toast.error(result.error);
			return;
		}

		toast.success('Төлөвлөгөө үүслээ');
		router.push(`/event-plans/${result.planId}`);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Төсөвөө тодорхойлох</CardTitle>
				<CardDescription>
					Эхлээд төсөв, арга хэмжээний огноо болон зочдын тоог оруулна. Дараа нь танхим,
					үйлчилгээ сонгоно.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-5'>
						<FormField
							control={form.control}
							name='budget'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Таны төсөв (₮) *</FormLabel>
									<FormControl>
										<Input
											type='number'
											{...field}
											value={field.value ?? ''}
											onChange={(e) =>
												field.onChange(
													e.target.value ? Number(e.target.value) : undefined,
												)
											}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='name'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Төлөвлөгөөний нэр</FormLabel>
									<FormControl>
										<Input placeholder='Жишээ: Хуримын төлөвлөгөө' {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='event_date'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Арга хэмжээний огноо</FormLabel>
									<FormControl>
										<div className='rounded-lg border border-border p-2'>
											<Calendar
												mode='single'
												selected={
													field.value ? new Date(field.value + 'T12:00:00') : undefined
												}
												onSelect={(d) => {
													if (!d) {
														field.onChange(undefined);
														return;
													}
													const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
													field.onChange(key);
												}}
												className='mx-auto'
											/>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='guest_count'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Зочдын тоо</FormLabel>
									<FormControl>
										<Input
											type='number'
											min={1}
											placeholder='100'
											{...field}
											value={field.value ?? ''}
											onChange={(e) =>
												field.onChange(
													e.target.value ? Number(e.target.value) : undefined,
												)
											}
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
								<FormItem>
									<FormLabel>Тэмдэглэл</FormLabel>
									<FormControl>
										<Textarea
											rows={3}
											placeholder='Нэмэлт хүсэлт, тэмдэглэл…'
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button type='submit' size='lg' className='w-full' disabled={isSubmitting}>
							{isSubmitting ? <Loader2 className='size-4 animate-spin' aria-hidden /> : null}
							Төлөвлөгөө эхлүүлэх
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
};
