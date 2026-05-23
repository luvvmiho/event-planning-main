import Link from 'next/link'
import type { EventPlanSummary } from '@/lib/types'
import { EventPlanBudgetBar, formatMnt, planTitle } from '@/components/event-plans/event-plan-budget-bar'
import { Badge } from '@/components/ui/badge'
import { ChevronRight } from 'lucide-react'

const formatPlanDate = (iso: string | null) => {
	if (!iso) return '—'
	return new Date(iso).toLocaleDateString('mn-MN', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
}

export const EventPlanList = ({ plans }: { plans: EventPlanSummary[] }) => {
	if (plans.length === 0) {
		return (
			<div className='rounded-xl border border-dashed border-border bg-secondary/20 py-16 text-center'>
				<p className='text-muted-foreground'>Танд хадгалсан төлөвлөгөө алга байна.</p>
				<Link
					href='/event-plans/new'
					className='mt-4 inline-block text-sm font-medium text-accent hover:underline'
				>
					Шинэ төлөвлөгөө эхлүүлэх
				</Link>
			</div>
		)
	}

	return (
		<ul className='space-y-4'>
			{plans.map((plan) => (
				<li key={plan.id}>
					<Link
						href={`/event-plans/${plan.id}`}
						className='block rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary/30 md:p-5'
					>
						<div className='flex flex-wrap items-start justify-between gap-3'>
							<div className='min-w-0'>
								<div className='flex flex-wrap items-center gap-2'>
									<h2 className='truncate text-lg font-semibold text-foreground'>
										{planTitle(plan)}
									</h2>
									{plan.over_budget ? (
										<Badge variant='destructive' className='text-[10px]'>
											Төсөв хэтэрсэн
										</Badge>
									) : null}
									{plan.mixed_providers ? (
										<Badge variant='outline' className='text-[10px]'>
											Олон үзүүлэгч
										</Badge>
									) : null}
								</div>
								<p className='mt-1 text-sm text-muted-foreground'>
									{formatPlanDate(plan.event_date)}
									{plan.guest_count ? ` · ${plan.guest_count} зочин` : ''}
								</p>
							</div>
							<div className='flex shrink-0 items-center gap-2'>
								<span className='text-lg font-semibold tabular-nums text-foreground'>
									{formatMnt(plan.estimated_total)}
								</span>
								<ChevronRight className='size-5 text-muted-foreground' aria-hidden />
							</div>
						</div>
						<div className='mt-4'>
							<EventPlanBudgetBar
								budget={plan.budget}
								estimatedTotal={plan.estimated_total}
								remainingBudget={plan.remaining_budget}
								overBudget={plan.over_budget}
								compact
							/>
						</div>
					</Link>
				</li>
			))}
		</ul>
	)
}
