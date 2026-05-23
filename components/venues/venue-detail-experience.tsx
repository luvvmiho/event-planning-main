'use client';

import {
	addVenueToWishlistAction,
	removeVenueFromWishlistAction,
} from '@/app/venues/[slug]/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { VenueAvailabilityCalendar } from '@/components/venues/venue-availability-calendar';
import { VenueBookingSidebar } from '@/components/venues/venue-booking-sidebar';
import { VenueDetailInfo } from '@/components/venues/venue-detail-info';
import { VenueReviewsPanel } from '@/components/venues/venue-reviews-panel';
import { VenueSectionHeading } from '@/components/venues/venue-section-heading';
import { useMounted } from '@/hooks/use-mounted';
import type { VenueDetail, VenueEventPackagePublic, VenueReview } from '@/lib/types';
import { cn } from '@/lib/utils';
import { venueCategoryShortLabel } from '@/lib/venue-labels';
import { venuePackageKindLabelMn } from '@/lib/venue-package-labels';
import { DISTRICT_SLUG_LABELS } from '@/lib/venue-search-params';
import { Bookmark, ChevronLeft, Loader2, MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Playfair_Display } from 'next/font/google';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const VenueLocationMap = dynamic(
	() => import('@/components/venues/venue-location-map').then((m) => m.VenueLocationMap),
	{
		ssr: false,
		loading: () => (
			<div className='min-h-[280px] w-full animate-pulse rounded-t-2xl bg-muted' aria-hidden />
		),
	},
);

const displaySerif = Playfair_Display({ subsets: ['latin'] });

const SECTION_SCROLL_MARGIN = 'scroll-mt-36';

type VenueNavItem = {
	id: string;
	label: string;
};

const buildNavItems = (hasPackages: boolean, reviewsLabel: string): VenueNavItem[] => [
	{ id: 'venue-section-about', label: 'Тайлбар' },
	{ id: 'venue-section-advantages', label: 'Давуу тал' },
	...(hasPackages ? [{ id: 'venue-section-packages', label: 'Багцууд' }] : []),
	{ id: 'venue-section-location', label: 'Байршил' },
	{ id: 'venue-reviews', label: reviewsLabel },
];

const placeholderImage = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80';

type VenueDetailExperienceProps = {
	venue: VenueDetail;
	images: string[];
	initialReviews: VenueReview[];
	isAuthenticated: boolean;
	initialInWishlist?: boolean;
	eventPackages?: VenueEventPackagePublic[];
};

const formatMnt = (n: number) => new Intl.NumberFormat('mn-MN').format(n) + '₮';

export const VenueDetailExperience = ({
	venue,
	images,
	initialReviews,
	isAuthenticated,
	initialInWishlist = false,
	eventPackages = [],
}: VenueDetailExperienceProps) => {
	const router = useRouter();
	const isMounted = useMounted();
	const [saved, setSaved] = useState(initialInWishlist);
	const [wishlistBusy, setWishlistBusy] = useState(false);
	const [activeSection, setActiveSection] = useState('venue-section-about');

	useEffect(() => {
		setSaved(initialInWishlist);
	}, [initialInWishlist, venue.id]);

	const handleWishlistClick = useCallback(async () => {
		if (!isAuthenticated) {
			router.push(`/login?next=${encodeURIComponent(`/venues/${venue.slug}`)}`);
			return;
		}
		setWishlistBusy(true);
		try {
			const payload = { venueId: venue.id, slug: venue.slug };
			if (saved) {
				const res = await removeVenueFromWishlistAction(payload);
				if (res.ok) {
					setSaved(false);
					toast.success('Хадгалснаас хаслаа');
				} else {
					toast.error(res.error);
				}
			} else {
				const res = await addVenueToWishlistAction(payload);
				if (res.ok) {
					setSaved(true);
					toast.success('Хадгалсанд нэмлээ');
				} else {
					toast.error(res.error);
				}
			}
		} finally {
			setWishlistBusy(false);
		}
	}, [isAuthenticated, router, saved, venue.id, venue.slug]);

	const sortedEventPackages = useMemo(
		() => [...eventPackages].sort((a, b) => a.sort_order - b.sort_order),
		[eventPackages],
	);

	const reviewsLabel = useMemo(() => {
		const rating =
			venue.rating != null
				? Number(venue.rating).toFixed(1)
				: initialReviews.length > 0
					? (
							initialReviews.reduce((sum, r) => sum + r.rating, 0) / initialReviews.length
						).toFixed(1)
					: null;
		return rating ? `Сэтгэгдэл (${rating})` : 'Сэтгэгдэл';
	}, [venue.rating, initialReviews]);

	const navItems = useMemo(
		() => buildNavItems(sortedEventPackages.length > 0, reviewsLabel),
		[sortedEventPackages.length, reviewsLabel],
	);

	const handleNavClick = useCallback((id: string) => {
		document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		setActiveSection(id);
	}, []);

	useEffect(() => {
		const sectionIds = navItems.map((i) => i.id);
		const elements = sectionIds
			.map((id) => document.getElementById(id))
			.filter((el): el is HTMLElement => el != null);
		if (elements.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
				if (visible[0]?.target.id) {
					setActiveSection(visible[0].target.id);
				}
			},
			{ rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.1, 0.25, 0.5, 1] },
		);

		for (const el of elements) {
			observer.observe(el);
		}
		return () => observer.disconnect();
	}, [venue.id, navItems]);

	const displayImages = images.length > 0 ? images : [placeholderImage];
	const main = displayImages[0];
	const side = displayImages.slice(1, 3);
	const categoryLabel = venue.categories?.name ?? venueCategoryShortLabel(venue.category);

	const mapLat = venue.lat;
	const mapLng = venue.long;
	const hasMapCoords = mapLat != null && mapLng != null;

	const calendarVenue = {
		id: venue.id,
		name: venue.name,
		capacity_min: venue.capacity_min,
		capacity_max: venue.capacity_max,
		location: venue.location,
		district: venue.district ?? '',
		category: venue.category,
		image_url: venue.image_url,
		images: venue.images,
	};

	if (!isMounted) {
		return null;
	}

	return (
		<>
			<div className='border-b border-border bg-secondary/30'>
				<div className='container mx-auto px-4 py-3'>
					<Link href='/venues'>
						<Button
							variant='ghost'
							size='sm'
							className='gap-1 text-muted-foreground hover:text-foreground'
						>
							<ChevronLeft className='h-4 w-4' aria-hidden />
							Бүх танхимууд
						</Button>
					</Link>
				</div>
			</div>

			<div className='container mx-auto px-4 py-8'>
				<div className='mb-6 flex flex-wrap items-start justify-between gap-4'>
					<div>
						<div className='flex flex-wrap items-center gap-2'>
							<Badge variant='secondary' className='rounded-full text-xs'>
								{categoryLabel}
							</Badge>
							{venue.is_featured ? (
								<Badge className='rounded-full bg-primary text-xs text-primary-foreground'>
									Онцлох
								</Badge>
							) : null}
							{venue.is_new ? (
								<Badge className='rounded-full bg-accent text-xs text-accent-foreground'>
									Шинэ
								</Badge>
							) : null}
						</div>
						<h1
							className={cn(
								'mt-3 text-3xl font-medium tracking-tight text-foreground md:text-4xl lg:text-5xl',
								displaySerif.className,
							)}
						>
							{venue.name}
						</h1>
						<div className='mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground'>
							<span className='flex items-center gap-1'>
								<MapPin className='h-4 w-4 shrink-0 text-accent' aria-hidden />
								{venue.location}
								{venue.district ? ` · ${DISTRICT_SLUG_LABELS[venue.district]}` : ''}
							</span>
							<Button variant='link' className='h-auto p-0 text-accent' asChild>
								<a href='#venue-reviews'>
									Сэтгэгдэл ·{' '}
									{venue.review_count > 0 ? venue.review_count : initialReviews.length}
								</a>
							</Button>
						</div>
					</div>
					<Button
						type='button'
						variant='outline'
						size='icon'
						className='shrink-0 border-border'
						onClick={() => {
							void handleWishlistClick();
						}}
						disabled={wishlistBusy}
						aria-busy={wishlistBusy}
						aria-pressed={saved}
						aria-label={wishlistBusy ? 'Уншиж байна' : saved ? 'Хадгалсан' : 'Хадгалах'}
					>
						{wishlistBusy ? (
							<Loader2 className='h-5 w-5 animate-spin text-muted-foreground' aria-hidden />
						) : (
							<Bookmark
								className={cn(
									'h-5 w-5',
									saved ? 'fill-accent text-accent' : 'text-muted-foreground',
								)}
								aria-hidden
							/>
						)}
					</Button>
				</div>

				{displayImages.length === 1 ? (
					<div className='relative aspect-[21/9] min-h-[260px] overflow-hidden rounded-2xl bg-muted md:min-h-[360px]'>
						<img src={displayImages[0]} alt='' className='size-full object-cover' />
					</div>
				) : displayImages.length === 2 ? (
					<div className='grid gap-2 sm:gap-3 md:grid-cols-2'>
						{displayImages.map((src, i) => (
							<div
								key={i}
								className='relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted md:min-h-[280px]'
							>
								<img src={src} alt='' className='size-full object-cover' />
							</div>
						))}
					</div>
				) : (
					<div className='grid gap-2 sm:gap-3 md:grid-cols-3 md:grid-rows-2'>
						<div className='relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted md:col-span-2 md:row-span-2 md:aspect-auto md:min-h-[320px]'>
							<img src={main} alt='' className='size-full object-cover' />
						</div>
						{side.map((src, i) => (
							<div
								key={i}
								className='relative aspect-video overflow-hidden rounded-2xl bg-muted md:min-h-[156px]'
							>
								<img src={src} alt='' className='size-full object-cover' />
							</div>
						))}
					</div>
				)}

				<div className='mt-10 grid gap-10 lg:grid-cols-3'>
					<div className='min-w-0 lg:col-span-2'>
						<div className='sticky top-16 z-30 mb-8 border-b border-border bg-background'>
							<div
								className='flex gap-8 overflow-x-auto'
								role='tablist'
								aria-label='Танхимын хэсгүүд'
							>
								{navItems.map(({ id, label }) => (
									<button
										key={id}
										type='button'
										role='tab'
										aria-selected={activeSection === id}
										aria-controls={id}
										className={cn(
											'shrink-0 border-b-2 pt-2 pb-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
											activeSection === id
												? 'border-accent text-foreground'
												: 'border-transparent text-muted-foreground hover:text-foreground',
										)}
										onClick={() => handleNavClick(id)}
									>
										{label}
									</button>
								))}
							</div>
						</div>

						<div className='space-y-14'>
							<section
								id='venue-section-about'
								className={SECTION_SCROLL_MARGIN}
								aria-labelledby='venue-about-heading'
							>
								<h2 id='venue-about-heading' className='sr-only'>
									Тайлбар
								</h2>
								<VenueDetailInfo venue={venue} part='description' />
							</section>

							<section
								id='venue-section-advantages'
								className={SECTION_SCROLL_MARGIN}
								aria-labelledby='venue-advantages-heading'
							>
								<h2 id='venue-advantages-heading' className='sr-only'>
									Давуу тал
								</h2>
								<VenueDetailInfo venue={venue} part='advantages' />
							</section>

							{sortedEventPackages.length > 0 ? (
								<section
									id='venue-section-packages'
									className={cn(SECTION_SCROLL_MARGIN, 'space-y-6')}
									aria-labelledby='venue-packages-heading'
								>
									<VenueSectionHeading
										id='venue-packages-heading'
										title='Багц болон үйлчилгээ'
										action={`${sortedEventPackages.length} багц олдлоо`}
									/>
									<p className='text-sm text-muted-foreground'>
										Багцын үнэ нь мөр захиалгын нийт дүн (хүн тутамд үржүүлэхгүй).
										Захиалгын баруун хэсгээс багц сонгон орох боломжтой.
									</p>
									<div className='grid gap-4 sm:grid-cols-2'>
										{sortedEventPackages.map((pkg) => {
											const effMin = Math.max(
												venue.capacity_min,
												pkg.guests_min ?? venue.capacity_min,
											);
											const effMax = Math.min(
												venue.capacity_max,
												pkg.guests_max ?? venue.capacity_max,
											);
											const services = [...(pkg.venue_package_services ?? [])].sort(
												(a, b) => a.sort_order - b.sort_order,
											);
											return (
												<Card
													key={pkg.id}
													className='overflow-hidden border-border pt-0 shadow-sm'
												>
													<div className='relative aspect-16/10 bg-muted'>
														<img
															src={main}
															alt=''
															className='size-full object-cover'
														/>
													</div>
													<CardContent className='space-y-3'>
														<p className='font-semibold text-foreground'>
															{pkg.name}
														</p>
														{pkg.short_description ? (
															<p className='line-clamp-3 text-sm text-muted-foreground'>
																{pkg.short_description}
															</p>
														) : null}
														<p className='text-xs text-muted-foreground'>
															Зочид: {effMin}–{effMax} хүн · Багцын нийт үнэ
														</p>
														<p className='text-lg font-semibold text-primary'>
															{formatMnt(pkg.price_flat)}
														</p>
														{services.length > 0 ? (
															<ul className='space-y-2 border-t border-border pt-3 text-sm'>
																{services.map((s, idx) => (
																	<li
																		key={`${pkg.id}-svc-${idx}`}
																		className='flex gap-2 text-muted-foreground'
																	>
																		<Badge
																			variant='outline'
																			className='shrink-0 text-[10px]'
																		>
																			{venuePackageKindLabelMn(
																				s.kind as Parameters<
																					typeof venuePackageKindLabelMn
																				>[0],
																			)}
																		</Badge>
																		<span className='min-w-0'>
																			<span className='font-medium text-foreground'>
																				{s.title}
																			</span>
																			{s.quantity != null && s.quantity > 1 ? (
																				<span className='tabular-nums'>
																					{' '}
																					×{s.quantity}
																				</span>
																			) : null}
																			{/* {s.is_included ? (
																				<span className='block text-xs text-accent'>
																					Багтаж байна
																				</span>
																			) : null} */}
																		</span>
																	</li>
																))}
															</ul>
														) : null}
													</CardContent>
												</Card>
											);
										})}
									</div>
								</section>
							) : null}

							<section
								id='venue-section-location'
								className={cn(SECTION_SCROLL_MARGIN, 'space-y-6')}
								aria-labelledby='venue-location-heading'
							>
								<VenueSectionHeading title='Байршил' />
								<VenueDetailInfo venue={venue} part='contact' />
								{venue.address ? (
									<p className='text-sm text-muted-foreground'>{venue.address}</p>
								) : null}
								{hasMapCoords ? (
									<div className='overflow-hidden rounded-2xl border border-border shadow-sm'>
										<VenueLocationMap
											latitude={mapLat}
											longitude={mapLng}
											venueName={venue.name}
										/>
									</div>
								) : (
									<p className='text-sm text-muted-foreground'>
										Газрын зурагийн координат бүртгэгдээгүй байна.
									</p>
								)}
							</section>

							<section
								id='venue-section-availability'
								className={cn(SECTION_SCROLL_MARGIN, 'space-y-6')}
								aria-labelledby='venue-availability-heading'
							>
								<VenueSectionHeading title='Өдрийн боломж' />
								<p className='text-sm text-muted-foreground'>
									Өнгө тайлбар доор байна. Саарал — захиалгатай, захиалга аваагүй өдөр
									нээлттэй.
								</p>
								<VenueAvailabilityCalendar venueId={venue.id} venue={calendarVenue} />
							</section>
						</div>
					</div>

					<div className='lg:col-span-1'>
						<VenueBookingSidebar venue={venue} bundles={sortedEventPackages} />
					</div>
				</div>

				<section
					id='venue-reviews'
					className={cn(SECTION_SCROLL_MARGIN, 'mt-14 border-t border-border pt-12')}
					aria-labelledby='venue-reviews-heading'
				>
					<div className='max-w-4xl'>
						<h2
							id='venue-reviews-heading'
							className='text-2xl font-semibold tracking-tight text-foreground'
						>
							Үйлчлүүлэгчдийн сэтгэгдэл
						</h2>
						<p className='mt-2 text-sm text-muted-foreground'>
							Үнэлгээ үлдээж, бусадтай туршлагаа хуваалцана уу.
						</p>
						<div className='mt-8'>
							<VenueReviewsPanel
								venueId={venue.id}
								slug={venue.slug}
								initialReviews={initialReviews}
								aggregateRating={venue.rating}
								reviewCount={venue.review_count}
								isAuthenticated={isAuthenticated}
							/>
						</div>
					</div>
				</section>
			</div>
		</>
	);
};
