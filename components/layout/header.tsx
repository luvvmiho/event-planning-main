'use client';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';
import { useCartStore } from '@/lib/stores/cart-store';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { User } from '@supabase/supabase-js';
import type { LucideIcon } from 'lucide-react';
import {
	Bookmark,
	Briefcase,
	Building2,
	FileText,
	Home,
	LayoutDashboard,
	LogOut,
	Menu,
	Plus,
	ScrollText,
	ShoppingBasket,
	User as UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const navLinks: { href: string; label: string; icon: LucideIcon }[] = [
	{ href: '/', label: 'Нүүр хуудас', icon: Home },
	{ href: '/venues', label: 'Танхимууд', icon: Building2 },
	{ href: '/services', label: 'Үйлчилгээ', icon: Briefcase },
	{ href: '/orders', label: 'Захиалга', icon: ScrollText },
];

function navLinkIsActive(pathname: string, href: string) {
	if (href === '/venues') return pathname === '/venues' || pathname.startsWith('/venues/');
	if (href === '/services') return pathname === '/services' || pathname.startsWith('/services/');
	return pathname === href;
}

const userIsProvider = (u: User) => {
	const appRole = u.app_metadata?.role as string | undefined;
	const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
	const metaRole = meta.role as string | undefined;
	const userType = meta.user_type as string | undefined;
	return appRole === 'provider' || metaRole === 'provider' || userType === 'provider';
};

export function Header() {
	const pathname = usePathname();
	const router = useRouter();
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const cartCount = useCartStore((s) => s.items.length);
	const [cartMounted, setCartMounted] = useState(false);

	useEffect(() => {
		setCartMounted(true);
	}, []);

	useEffect(() => {
		const supabase = createClient();

		supabase.auth.getUser().then(({ data: { user } }) => {
			setUser(user);
			setLoading(false);
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
		});

		return () => subscription.unsubscribe();
	}, []);

	const handleSignOut = async () => {
		const supabase = createClient();
		await supabase.auth.signOut();
		router.push('/');
		router.refresh();
	};

	return (
		<header className='sticky top-0 z-50 w-full border-b border-border bg-card'>
			<div className='container mx-auto flex h-16 items-center justify-between px-4'>
				<Link href='/' className='flex flex-1 items-center'>
					<span className='font-serif text-2xl font-bold text-primary'>Nairly</span>
				</Link>

				<nav className='hidden flex-1 items-center gap-8 md:flex'>
					{navLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className={cn(
								'text-sm font-medium transition-colors hover:text-primary',
								navLinkIsActive(pathname, link.href)
									? 'text-primary underline underline-offset-4'
									: 'text-muted-foreground',
							)}
						>
							{link.label}
						</Link>
					))}
				</nav>

				<div className='hidden flex-1 items-center justify-end gap-3 md:flex'>
					{loading ? (
						<div className='h-10 w-24 animate-pulse rounded-md bg-muted' />
					) : user ? (
						<>
							<Button
								asChild
								size='sm'
								className='gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90'
							>
								<Link href='/event-plans/new'>
									<Plus className='size-4' aria-hidden />
									Төлөвлөгөө үүсгэх
								</Link>
							</Button>
							<Link href='/cart'>
								<Button variant='ghost' size='icon' className='relative'>
									<ShoppingBasket className='size-6!' />
									{cartMounted && cartCount > 0 ? (
										<span className='absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-0.5 text-[10px] font-medium text-accent-foreground'>
											{cartCount > 99 ? '99+' : cartCount}
										</span>
									) : null}
								</Button>
							</Link>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant='ghost' size='icon' className='rounded-full'>
										<div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground'>
											<UserIcon className='h-4 w-4' />
										</div>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align='end' className='w-56'>
									<div className='px-2 py-1.5'>
										<p className='text-sm font-medium'>
											{user.user_metadata?.name || 'Хэрэглэгч'}
										</p>
										<p className='text-xs text-muted-foreground'>{user.email}</p>
									</div>
									<DropdownMenuSeparator />
									<DropdownMenuItem asChild>
										<Link href='/profile' className='cursor-pointer'>
											Профайл
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link
											href='/event-plans'
											className='flex cursor-pointer items-center gap-2'
										>
											Миний төлөвлөгөө
										</Link>
									</DropdownMenuItem>
									{userIsProvider(user) ? (
										<DropdownMenuItem asChild>
											<Link href='/provider' className='cursor-pointer'>
												Үйлчилгээний самбар
											</Link>
										</DropdownMenuItem>
									) : null}
									<DropdownMenuItem asChild>
										<Link
											href='/profile/wishlist'
											className='flex cursor-pointer items-center gap-2'
										>
											Хадгалсан
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link href='/orders' className='cursor-pointer'>
											Миний захиалгууд
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link href='/cart' className='cursor-pointer'>
											Миний сагс
										</Link>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={handleSignOut}
										className='cursor-pointer text-destructive'
									>
										<LogOut className='mr-2 h-4 w-4' />
										Гарах
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</>
					) : (
						<>
							<Link href='/login'>
								<Button variant='ghost' className='text-sm font-medium'>
									Нэвтрэх
								</Button>
							</Link>
							<Link href='/register'>
								<Button className='bg-primary text-primary-foreground hover:bg-primary/90'>
									Бүртгүүлэх
								</Button>
							</Link>
						</>
					)}
				</div>

				<div className='flex items-center gap-2 md:hidden'>
					{user && (
						<Link href='/cart'>
							<Button variant='ghost' size='icon' className='relative'>
								<ShoppingBasket className='h-5 w-5' />
								{cartMounted && cartCount > 0 ? (
									<span className='absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-0.5 text-[10px] font-medium text-accent-foreground'>
										{cartCount > 99 ? '99+' : cartCount}
									</span>
								) : null}
							</Button>
						</Link>
					)}
					<Sheet>
						<SheetTrigger asChild>
							<Button variant='ghost' size='icon' aria-label='Цэс нээх'>
								<Menu className='h-5 w-5' />
							</Button>
						</SheetTrigger>
						<SheetContent
							side='right'
							className='flex w-[min(20rem,calc(100vw-1rem))] flex-col border-border bg-card p-0 sm:max-w-none'
						>
							<SheetHeader>
								<SheetTitle className='sr-only'>Үндсэн цэс</SheetTitle>
							</SheetHeader>

							<div className='flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4'>
								{user ? (
									<div className='rounded-xl border border-border bg-secondary/40 p-4 shadow-sm'>
										<div className='flex items-center gap-3'>
											<div
												className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground'
												aria-hidden
											>
												{(user.user_metadata?.name as string | undefined)
													?.trim()?.[0]
													?.toUpperCase() ??
													user.email?.[0]?.toUpperCase() ??
													'Х'}
											</div>
											<div className='min-w-0 flex-1'>
												<p className='truncate text-sm font-semibold text-foreground'>
													{user.user_metadata?.name || 'Хэрэглэгч'}
												</p>
												<p className='truncate text-xs text-muted-foreground'>
													{user.email}
												</p>
											</div>
										</div>
										<Separator className='my-3 bg-border' />
										<nav className='flex flex-col gap-1' aria-label='Бүртгэл'>
											<SheetClose asChild>
												<Link
													href='/profile'
													className='flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
												>
													<UserIcon
														className='h-4 w-4 shrink-0 text-muted-foreground'
														aria-hidden
													/>
													Профайл
												</Link>
											</SheetClose>
											<SheetClose asChild>
												<Link
													href='/event-plans/new'
													className='flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
												>
													<Plus
														className='h-4 w-4 shrink-0 text-muted-foreground'
														aria-hidden
													/>
													Төлөвлөгөө үүсгэх
												</Link>
											</SheetClose>
											<SheetClose asChild>
												<Link
													href='/event-plans'
													className='flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
												>
													<FileText
														className='h-4 w-4 shrink-0 text-muted-foreground'
														aria-hidden
													/>
													Миний төлөвлөгөө
												</Link>
											</SheetClose>
											{userIsProvider(user) ? (
												<SheetClose asChild>
													<Link
														href='/provider'
														className='flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
													>
														<LayoutDashboard
															className='h-4 w-4 shrink-0 text-muted-foreground'
															aria-hidden
														/>
														Үйлчилгээний самбар
													</Link>
												</SheetClose>
											) : null}
											<SheetClose asChild>
												<Link
													href='/profile/wishlist'
													className='flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
												>
													<Bookmark
														className='h-4 w-4 shrink-0 text-muted-foreground'
														aria-hidden
													/>
													Хадгалсан
												</Link>
											</SheetClose>
											<SheetClose asChild>
												<Link
													href='/orders'
													className='flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
												>
													<ScrollText
														className='h-4 w-4 shrink-0 text-muted-foreground'
														aria-hidden
													/>
													Миний захиалгууд
												</Link>
											</SheetClose>
											<SheetClose asChild>
												<Link
													href='/cart'
													className='flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
												>
													<ShoppingBasket
														className='h-4 w-4 shrink-0 text-muted-foreground'
														aria-hidden
													/>
													Миний сагс
													{cartMounted && cartCount > 0 ? (
														<span className='ml-auto rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground tabular-nums'>
															{cartCount > 99 ? '99+' : cartCount}
														</span>
													) : null}
												</Link>
											</SheetClose>
										</nav>
									</div>
								) : null}

								<div>
									<p className='mb-2 px-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase'>
										Холбоос
									</p>
									<nav className='flex flex-col gap-1' aria-label='Үндсэн навигаци'>
										{navLinks.map((link) => {
											const Icon = link.icon;
											const active = navLinkIsActive(pathname, link.href);
											return (
												<SheetClose asChild key={link.href}>
													<Link
														href={link.href}
														className={cn(
															'flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
															active
																? 'bg-primary/10 text-primary'
																: 'text-foreground hover:bg-secondary/80',
														)}
													>
														<Icon
															className={cn(
																'h-5 w-5 shrink-0',
																active ? 'text-primary' : 'text-muted-foreground',
															)}
															aria-hidden
														/>
														<span className='flex-1'>{link.label}</span>
														{active ? (
															<span
																className='h-1.5 w-1.5 shrink-0 rounded-full bg-accent'
																aria-hidden
															/>
														) : null}
													</Link>
												</SheetClose>
											);
										})}
									</nav>
								</div>

								{!user ? (
									<div className='flex flex-col gap-2'>
										<SheetClose asChild>
											<Button
												asChild
												className='w-full bg-primary text-primary-foreground hover:bg-primary/90'
											>
												<Link href='/register'>Бүртгүүлэх</Link>
											</Button>
										</SheetClose>
										<SheetClose asChild>
											<Button asChild variant='outline' className='w-full border-border'>
												<Link href='/login'>Нэвтрэх</Link>
											</Button>
										</SheetClose>
									</div>
								) : null}
							</div>

							{user ? (
								<SheetFooter className='border-t border-border bg-secondary/20 p-4'>
									<Button
										variant='outline'
										className='w-full border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive'
										onClick={handleSignOut}
									>
										<LogOut className='mr-2 h-4 w-4' aria-hidden />
										Гарах
									</Button>
								</SheetFooter>
							) : null}
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>
	);
}
