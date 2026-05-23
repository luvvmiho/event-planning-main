'use client';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCartStore } from '@/lib/stores/cart-store';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { User } from '@supabase/supabase-js';
import { LogOut, ShoppingBasket, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const navLinks = [
	{ href: '/', label: 'Нүүр хуудас' },
	{ href: '/orders', label: 'Захиалга' },
	{ href: '/services', label: 'Үйлчилгээ' },
];

export function CartHeader() {
	const pathname = usePathname();
	const router = useRouter();
	const cartCount = useCartStore((s) => s.items.length);
	const [mounted, setMounted] = useState(false);
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setMounted(true);
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
				<Link href='/' className='flex items-center'>
					<span className='font-serif text-2xl font-bold text-primary'>Nairly</span>
				</Link>

				<nav className='hidden items-center gap-8 md:flex'>
					{navLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className={cn(
								'text-sm font-medium transition-colors hover:text-primary',
								pathname === link.href
									? 'text-primary underline underline-offset-4'
									: 'text-muted-foreground',
							)}
						>
							{link.label}
						</Link>
					))}
				</nav>

				<div className='flex items-center gap-4'>
					<Link href='/cart' className='relative'>
						<ShoppingBasket className='h-6 w-6 text-foreground' />
						{mounted && cartCount > 0 ? (
							<span className='absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-medium text-accent-foreground'>
								{cartCount > 99 ? '99+' : cartCount}
							</span>
						) : null}
					</Link>

					{loading ? (
						<div className='h-10 w-10 animate-pulse rounded-full bg-muted' />
					) : user ? (
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
									<Link href='/orders' className='cursor-pointer'>
										Миний захиалгууд
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
					) : (
						<Button variant='outline' size='sm' asChild>
							<Link href='/login'>Нэвтрэх</Link>
						</Button>
					)}
				</div>
			</div>
		</header>
	);
}
