'use client';

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Package, ShoppingBasket, Wrench, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
	href: string;
	label: string;
	icon: LucideIcon;
	end?: boolean;
};

const navItems: NavItem[] = [
	{ href: '/provider', label: 'Хянах самбар', icon: LayoutDashboard, end: true },
	{ href: '/provider/orders', label: 'Захиалгууд', icon: ShoppingBasket },
	{ href: '/provider/venues', label: 'Миний байршлууд', icon: Package },
	{ href: '/provider/services', label: 'Үйлчилгээ', icon: Wrench },
];

const matchActive = (pathname: string, href: string, end?: boolean) => {
	if (end) return pathname === href;
	return pathname === href || pathname.startsWith(`${href}/`);
};

export type ProviderAppShellProps = {
	children: React.ReactNode;
	userName: string;
	userEmail: string;
};

export const ProviderAppShell = ({ children, userName, userEmail }: ProviderAppShellProps) => {
	const pathname = usePathname();

	return (
		<SidebarProvider className={cn('flex min-h-0 w-full flex-1')}>
			<Sidebar
				collapsible='icon'
				className='top-20! bottom-0! h-auto! border-r border-sidebar-border [--sidebar-accent:var(--secondary)]'
			>
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupContent>
							<SidebarMenu>
								{navItems.map((item) => {
									const Icon = item.icon;
									const active = matchActive(pathname, item.href, item.end);
									return (
										<SidebarMenuItem key={item.href}>
											<SidebarMenuButton
												asChild
												isActive={active}
												tooltip={item.label}
												className='data-[active=true]:bg-primary! data-[active=true]:text-primary-foreground! data-[active=true]:hover:bg-primary! data-[active=true]:hover:text-primary-foreground!'
											>
												<Link href={item.href}>
													<Icon aria-hidden className='shrink-0' />
													<span className='text-xs font-semibold tracking-wide uppercase'>
														{item.label}
													</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									);
								})}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
			</Sidebar>
			<SidebarInset className='min-w-0 overflow-auto'>
				<header className='sticky top-0 z-10 flex h-12 items-center gap-2 border-b border-border bg-background px-3 md:hidden'>
					<SidebarTrigger aria-label='Цэс нээх' />
					<span className='text-xs font-semibold text-foreground'>Үйлчилгээ үзүүлэгч</span>
				</header>
				{children}
			</SidebarInset>
		</SidebarProvider>
	);
};
