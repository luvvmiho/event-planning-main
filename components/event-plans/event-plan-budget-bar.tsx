import type { EventPlanDetail, EventPlanSummary } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

export const formatMnt = (n: number) => new Intl.NumberFormat('mn-MN').format(n) + '₮'

type EventPlanBudgetBarProps = {
	budget: number
	estimatedTotal: number
	remainingBudget: number
	overBudget: boolean
	className?: string
	compact?: boolean
}

export const EventPlanBudgetBar = ({
	budget,
	estimatedTotal,
	remainingBudget,
	overBudget,
	className,
	compact = false,
}: EventPlanBudgetBarProps) => {
	const usedPercent = budget > 0 ? Math.min(100, Math.round((estimatedTotal / budget) * 100)) : 0

	return (
		<div className={cn('rounded-xl border border-border bg-card p-4 md:p-5', className)}>
			<div className='flex flex-wrap items-end justify-between gap-3'>
				<div>
					<p className='text-xs font-medium tracking-wide text-muted-foreground uppercase'>
						Төсөв
					</p>
					<p className='mt-1 text-xl font-bold tabular-nums text-foreground'>{formatMnt(budget)}</p>
				</div>
				<div className='text-right'>
					<p className='text-xs font-medium tracking-wide text-muted-foreground uppercase'>
						Тооцоолсон нийт
					</p>
					<p
						className={cn(
							'mt-1 text-xl font-bold tabular-nums',
							overBudget ? 'text-destructive' : 'text-foreground',
						)}
					>
						{formatMnt(estimatedTotal)}
					</p>
				</div>
			</div>

			<div className='mt-4 space-y-2'>
				<Progress
					value={usedPercent}
					className={cn('h-2.5', overBudget && '[&_[data-slot=progress-indicator]]:bg-destructive')}
				/>
				<div className='flex flex-wrap justify-between gap-2 text-sm'>
					<span className='text-muted-foreground'>Ашигласан: {usedPercent}%</span>
					<span
						className={cn(
							'font-medium tabular-nums',
							overBudget ? 'text-destructive' : 'text-accent',
						)}
					>
						{overBudget
							? `${formatMnt(Math.abs(remainingBudget))} хэтэрсэн`
							: `Үлдсэн: ${formatMnt(remainingBudget)}`}
					</span>
				</div>
			</div>

			{!compact && overBudget ? (
				<p className='mt-3 text-sm text-destructive'>
					Тооцоолсон зардал таны төсвөөс хэтэрсэн байна. Захиалга хийхдээ анхаарна уу.
				</p>
			) : null}
		</div>
	)
}

export const planTitle = (plan: Pick<EventPlanSummary, 'name' | 'id'>) =>
	plan.name?.trim() || `Төлөвлөгөө ${plan.id.slice(0, 8)}`

export const planHasItems = (plan: Pick<EventPlanDetail, 'venue' | 'services'>) =>
	Boolean(plan.venue) || plan.services.length > 0
