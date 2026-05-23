'use client'

import { submitVenueReview } from '@/app/venues/[slug]/actions'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import type { VenueReview } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'

type VenueReviewsPanelProps = {
	venueId: string
	slug: string
	initialReviews: VenueReview[]
	aggregateRating: number | null
	reviewCount: number
	isAuthenticated: boolean
}

const formatDate = (iso: string) =>
	new Date(iso).toLocaleDateString('mn-MN', { year: 'numeric', month: 'short', day: 'numeric' })

export const VenueReviewsPanel = ({
	venueId,
	slug,
	initialReviews,
	aggregateRating,
	reviewCount,
	isAuthenticated,
}: VenueReviewsPanelProps) => {
	const router = useRouter()
	const [pending, startTransition] = useTransition()
	const [rating, setRating] = useState(0)
	const [hoverRating, setHoverRating] = useState(0)
	const [comment, setComment] = useState('')

	const displayAvg = useMemo(() => {
		if (aggregateRating != null && Number.isFinite(Number(aggregateRating))) {
			return Number(aggregateRating)
		}
		if (initialReviews.length === 0) return null
		const s = initialReviews.reduce((acc, r) => acc + r.rating, 0)
		return Math.round((s / initialReviews.length) * 10) / 10
	}, [aggregateRating, initialReviews])

	const starHistogram = useMemo(() => {
		const counts = [0, 0, 0, 0, 0]
		for (const r of initialReviews) {
			const i = Math.min(5, Math.max(1, r.rating)) - 1
			counts[i] += 1
		}
		const max = Math.max(1, ...counts)
		return { counts, max }
	}, [initialReviews])

	const loginHref = `/login?next=/venues/${encodeURIComponent(slug)}`

	const handleSubmit = () => {
		if (!isAuthenticated) {
			router.push(loginHref)
			return
		}
		if (rating < 1) {
			toast.error('Одоор үнэлнэ үү')
			return
		}
		startTransition(async () => {
			const result = await submitVenueReview({ venueId, slug, rating, comment: comment.trim() || undefined })
			if (!result.ok) {
				toast.error(result.error)
				return
			}
			toast.success('Сэтгэгдэл хадгалагдлаа')
			setComment('')
			setRating(0)
			router.refresh()
		})
	}

	const effectiveCount = reviewCount > 0 ? reviewCount : initialReviews.length

	return (
		<div className='space-y-10'>
			<div className='flex flex-col gap-8 rounded-xl border border-border bg-card p-6 shadow-sm md:flex-row md:items-start'>
				<div className='flex shrink-0 flex-col items-center gap-1 md:w-40'>
					<p className='text-5xl font-semibold tabular-nums text-foreground'>
						{displayAvg != null ? displayAvg.toFixed(1) : '—'}
					</p>
					<div className='flex gap-0.5' aria-hidden>
						{[1, 2, 3, 4, 5].map((i) => (
							<Star
								key={i}
								className={cn(
									'h-5 w-5',
									displayAvg != null && i <= Math.round(displayAvg)
										? 'fill-accent text-accent'
										: 'text-muted-foreground/30',
								)}
							/>
						))}
					</div>
					<p className='text-center text-xs text-muted-foreground'>Нийт үнэлгээ</p>
					<p className='text-xs text-muted-foreground'>({effectiveCount} сэтгэгдэл)</p>
				</div>

				<div className='min-w-0 flex-1 space-y-4'>
					<p className='text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
						Одны тархалт
					</p>
					<div className='space-y-2'>
						{[5, 4, 3, 2, 1].map((stars) => {
							const n = starHistogram.counts[stars - 1] ?? 0
							const pct = (n / starHistogram.max) * 100
							return (
								<div key={stars} className='grid grid-cols-[4.5rem_1fr_auto] items-center gap-2 text-sm'>
									<span className='text-muted-foreground'>{stars} од</span>
									<Progress value={pct} className='h-2 bg-secondary' />
									<span className='w-8 text-right tabular-nums text-foreground'>{n}</span>
								</div>
							)
						})}
					</div>
				</div>
			</div>

			<div className='rounded-xl border border-border bg-card p-6 shadow-sm'>
				<h3 className='text-lg font-semibold text-foreground'>Сэтгэгдэл үлдээх</h3>
				<p className='mt-1 text-sm text-muted-foreground'>
					Нэг танхимд нэг удаа сэтгэгдэл үлдээнэ (өмнөхтэй давхацвал шинэчлэгдэнэ).
				</p>
				<div className='mt-4'>
					<p id='review-rating-label' className='mb-2 text-sm font-medium text-foreground'>
						Үнэлгээ <span className='text-destructive'>*</span>
					</p>
					<div
						className='flex gap-1'
						role='group'
						aria-labelledby='review-rating-label'
						onMouseLeave={() => setHoverRating(0)}
					>
						{[1, 2, 3, 4, 5].map((i) => {
							const active = (hoverRating || rating) >= i
							return (
								<button
									key={i}
									type='button'
									className='rounded-md p-1 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
									aria-label={`${i} од`}
									onMouseEnter={() => setHoverRating(i)}
									onClick={() => setRating(i)}
								>
									<Star
										className={cn(
											'h-8 w-8',
											active ? 'fill-accent text-accent' : 'text-muted-foreground/35',
										)}
									/>
								</button>
							)
						})}
					</div>
				</div>
				<div className='mt-4'>
					<label htmlFor='review-comment' className='mb-2 block text-sm font-medium text-foreground'>
						Тайлбар
					</label>
					<Textarea
						id='review-comment'
						placeholder='Таны туршлагаа хуваалцана уу…'
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						className='min-h-[100px] resize-y'
						maxLength={2000}
					/>
				</div>
				<div className='mt-4 flex flex-wrap gap-3'>
					<Button
						type='button'
						className='bg-primary text-primary-foreground'
						onClick={handleSubmit}
						disabled={pending || rating < 1}
					>
						{pending ? 'Илгээж байна…' : 'Сэтгэгдэл илгээх'}
					</Button>
				</div>
			</div>

			<div className='space-y-4'>
				<h3 className='text-lg font-semibold text-foreground'>Сэтгэгдлүүд</h3>
				{initialReviews.length === 0 ? (
					<p className='text-sm text-muted-foreground'>Одоогоор сэтгэгдэл алга байна.</p>
				) : (
					<ul className='space-y-4'>
						{initialReviews.map((rev) => (
							<li key={rev.id} className='rounded-lg border border-border bg-secondary/20 p-4'>
								<div className='flex flex-wrap items-center justify-between gap-2'>
									<p className='font-medium text-foreground'>
										{rev.profiles?.full_name?.trim() || 'Хэрэглэгч'}
									</p>
									<time className='text-xs text-muted-foreground' dateTime={rev.created_at}>
										{formatDate(rev.created_at)}
									</time>
								</div>
								<div className='mt-1 flex gap-0.5' aria-label={`${rev.rating} од`}>
									{[1, 2, 3, 4, 5].map((i) => (
										<Star
											key={i}
											className={cn(
												'h-4 w-4',
												i <= rev.rating ? 'fill-accent text-accent' : 'text-muted-foreground/25',
											)}
										/>
									))}
								</div>
								{rev.comment ? (
									<p className='mt-2 text-sm leading-relaxed text-muted-foreground'>{rev.comment}</p>
								) : null}
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	)
}
