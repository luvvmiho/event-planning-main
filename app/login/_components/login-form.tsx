'use client';

import { signIn } from '@/actions/auth.actions';
import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import type { LoginFormValues } from '@/lib/types';
import { loginSchema } from '@/lib/validations/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

export const LoginForm = () => {
	const [isPending, startTransition] = useTransition();
	const [showPassword, setShowPassword] = useState(false);
	const [rememberMe, setRememberMe] = useState(false);

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: '', password: '' },
	});

	const onSubmit = (values: LoginFormValues) => {
		startTransition(async () => {
			const result = await signIn(values);
			if (result?.error) {
				form.setError('root', { message: result.error });
			}
		});
	};

	return (
		<div className='w-full max-w-md rounded-2xl bg-[#f5f3ef] px-10 py-10 shadow-xl'>
			<div className='mb-8 text-center'>
				<h1 className='font-serif text-4xl font-semibold tracking-tight text-foreground'>
					Nairly
				</h1>
				<p className='mt-1 text-[11px] font-medium tracking-[0.2em] text-muted-foreground uppercase'>
					Нэвтрэх хэсэг
				</p>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6' noValidate>
					{form.formState.errors.root && (
						<div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
							{form.formState.errors.root.message}
						</div>
					)}

					<FormField
						control={form.control}
						name='email'
						render={({ field }) => (
							<FormItem className='space-y-1'>
								<FormLabel className='text-sm text-foreground/80'>И-мэйл хаяг</FormLabel>
								<FormControl>
									<div className='flex items-center gap-3 border-b border-foreground/20 pb-2 transition-colors focus-within:border-foreground'>
										<Mail className='h-4 w-4 shrink-0 text-muted-foreground' />
										<input
											{...field}
											type='email'
											placeholder='example@nairly.mn'
											autoComplete='email'
											disabled={isPending}
											className='w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 disabled:opacity-50'
										/>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name='password'
						render={({ field }) => (
							<FormItem className='space-y-1'>
								<div className='flex items-center justify-between'>
									<FormLabel className='text-sm text-foreground/80'>Нууц үг</FormLabel>
									<Link
										href='/forgot-password'
										className='text-xs text-amber-600 hover:underline'
										tabIndex={0}
									>
										Нууц үг мартсан?
									</Link>
								</div>
								<FormControl>
									<div className='flex items-center gap-3 border-b border-foreground/20 pb-2 transition-colors focus-within:border-foreground'>
										<Lock className='h-4 w-4 shrink-0 text-muted-foreground' />
										<input
											{...field}
											type={showPassword ? 'text' : 'password'}
											placeholder='••••••••'
											autoComplete='current-password'
											disabled={isPending}
											className='w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 disabled:opacity-50'
										/>
										<button
											type='button'
											onClick={() => setShowPassword((v) => !v)}
											tabIndex={0}
											aria-label={showPassword ? 'Нууц үг нуух' : 'Нууц үг харах'}
											className='shrink-0 text-muted-foreground hover:text-foreground'
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

					<Button
						type='submit'
						disabled={isPending}
						className='w-full rounded-lg bg-foreground py-5 text-xs font-semibold tracking-[0.15em] text-background uppercase hover:bg-foreground/90'
					>
						{isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
						Нэвтрэх
					</Button>

					<p className='text-center text-sm text-muted-foreground'>
						Бүртгэлгүй юу?{' '}
						<Link
							href='/register'
							className='font-medium text-amber-600 hover:underline'
							tabIndex={0}
						>
							Шинээр бүртгүүлэх
						</Link>
					</p>
				</form>
			</Form>
		</div>
	);
};
