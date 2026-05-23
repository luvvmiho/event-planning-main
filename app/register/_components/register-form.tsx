'use client';

import { signUp } from '@/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import type { RegisterFormValues, UserType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { registerSchema } from '@/lib/validations/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Eye, EyeOff, Loader2, User } from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

export const RegisterForm = () => {
	const [isPending, startTransition] = useTransition();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const form = useForm<RegisterFormValues>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: '',
			email: '',
			phone: '',
			password: '',
			confirmPassword: '',
			userType: 'user',
			serviceCategory: '',
			registrationNumber: '',
			acceptTerms: false,
		},
	});

	const userType = form.watch('userType');

	const onSubmit = (values: RegisterFormValues) => {
		startTransition(async () => {
			const result = await signUp(values);
			if (result?.error) {
				form.setError('root', { message: result.error });
			}
		});
	};

	return (
		<div className='w-full max-w-md'>
			<h1 className='mb-8 text-3xl font-bold text-foreground'>Шинэ бүртгэл</h1>

			<div className='mb-8 grid grid-cols-2 gap-4'>
				{(['user', 'provider'] as UserType[]).map((type) => (
					<button
						key={type}
						type='button'
						onClick={() => form.setValue('userType', type)}
						disabled={isPending}
						className={cn(
							'flex flex-col items-center gap-2 rounded-lg border-2 p-6 transition-all',
							userType === type
								? 'border-accent bg-accent/5'
								: 'border-border hover:border-muted-foreground',
						)}
					>
						{type === 'user' ? (
							<User
								className={cn(
									'h-6 w-6',
									userType === type ? 'text-accent' : 'text-muted-foreground',
								)}
							/>
						) : (
							<Building2
								className={cn(
									'h-6 w-6',
									userType === type ? 'text-accent' : 'text-muted-foreground',
								)}
							/>
						)}
						<span
							className={cn(
								'text-sm font-medium',
								userType === type ? 'text-foreground' : 'text-muted-foreground',
							)}
						>
							{type === 'user' ? 'ХЭРЭГЛЭГЧ' : 'ҮЙЛЧИЛГЭЭ ҮЗҮҮЛЭГЧ'}
						</span>
					</button>
				))}
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5' noValidate>
					{form.formState.errors.root && (
						<div className='rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive'>
							{form.formState.errors.root.message}
						</div>
					)}

					<FormField
						control={form.control}
						name='name'
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									{userType === 'provider' ? 'Нэр / Байгууллагын нэр' : 'Нэр'}
								</FormLabel>
								<FormControl>
									<Input
										{...field}
										type='text'
										placeholder='Таны бүтэн нэр'
										autoComplete='name'
										disabled={isPending}
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
								<FormLabel>Цахим шуудан</FormLabel>
								<FormControl>
									<Input
										{...field}
										type='email'
										placeholder='example@domain.com'
										autoComplete='email'
										disabled={isPending}
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
								<FormLabel>Утасны дугаар</FormLabel>
								<FormControl>
									<Input
										{...field}
										type='tel'
										placeholder='+976'
										autoComplete='tel'
										disabled={isPending}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name='password'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Нууц үг</FormLabel>
								<FormControl>
									<div className='relative'>
										<Input
											{...field}
											type={showPassword ? 'text' : 'password'}
											placeholder='••••••••'
											autoComplete='new-password'
											disabled={isPending}
											className='pr-10'
										/>
										<button
											type='button'
											className='absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground'
											onClick={() => setShowPassword((v) => !v)}
											tabIndex={0}
											aria-label={showPassword ? 'Нууц үг нуух' : 'Нууц үг харах'}
										>
											{showPassword ? (
												<EyeOff className='h-4 w-4' />
											) : (
												<Eye className='h-4 w-4' />
											)}
										</button>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name='confirmPassword'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Нууц үг давтах</FormLabel>
								<FormControl>
									<div className='relative'>
										<Input
											{...field}
											type={showConfirmPassword ? 'text' : 'password'}
											placeholder='••••••••'
											autoComplete='new-password'
											disabled={isPending}
											className='pr-10'
										/>
										<button
											type='button'
											className='absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground'
											onClick={() => setShowConfirmPassword((v) => !v)}
											tabIndex={0}
											aria-label={showConfirmPassword ? 'Нууц үг нуух' : 'Нууц үг харах'}
										>
											{showConfirmPassword ? (
												<EyeOff className='h-4 w-4' />
											) : (
												<Eye className='h-4 w-4' />
											)}
										</button>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{userType === 'provider' && (
						<>
							<FormField
								control={form.control}
								name='serviceCategory'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Үйлчилгээний чиглэл</FormLabel>
										<Select
											value={field.value}
											onValueChange={field.onChange}
											disabled={isPending}
										>
											<FormControl>
												<SelectTrigger className='w-full'>
													<SelectValue placeholder='Сонгоно уу' />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value='venue'>Байршил &amp; Танхим</SelectItem>
												<SelectItem value='catering'>Хоол үйлчилгээ</SelectItem>
												<SelectItem value='decoration'>
													Цэцэг засал &amp; Чимэглэл
												</SelectItem>
												<SelectItem value='photography'>Зураг авалт</SelectItem>
												<SelectItem value='transportation'>
													Тээврийн үйлчилгээ
												</SelectItem>
												<SelectItem value='entertainment'>Тоглоом үзвэр</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='registrationNumber'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Регистрийн дугаар</FormLabel>
										<FormControl>
											<Input
												{...field}
												type='text'
												placeholder='7 оронтой тоо'
												disabled={isPending}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</>
					)}

					<FormField
						control={form.control}
						name='acceptTerms'
						render={({ field }) => (
							<FormItem className='flex flex-row items-start space-y-0 space-x-2'>
								<FormControl>
									<Checkbox
										checked={field.value}
										onCheckedChange={field.onChange}
										disabled={isPending}
										className='mt-1'
									/>
								</FormControl>
								<div className='flex-1'>
									<FormLabel className='line-clamp-2 cursor-pointer text-sm leading-relaxed font-normal text-muted-foreground'>
										Би Nairly-ийн{' '}
										<Link
											href='/terms'
											className='font-medium text-accent hover:underline'
										>
											Үйлчилгээний нөхцөл
										</Link>{' '}
										болон{' '}
										<Link
											href='/privacy'
											className='font-medium text-accent hover:underline'
										>
											Нууцлалын бодлого
										</Link>
										-ыг зөвшөөрч байна.
									</FormLabel>
									<FormMessage />
								</div>
							</FormItem>
						)}
					/>

					<Button type='submit' className='w-full' disabled={isPending}>
						{isPending ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								Бүртгэж байна...
							</>
						) : (
							'БҮРТГҮҮЛЭХ'
						)}
					</Button>
				</form>
			</Form>

			<p className='mt-6 text-center text-sm text-muted-foreground'>
				Аль хэдийн бүртгэлтэй юу?{' '}
				<Link href='/login' className='font-medium text-accent hover:underline' tabIndex={0}>
					Нэвтрэх
				</Link>
			</p>
		</div>
	);
};
