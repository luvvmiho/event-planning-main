import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type VenueSectionHeadingProps = {
	title: string
	id?: string
	className?: string
	action?: ReactNode
	withAccent?: boolean
}

export const VenueSectionHeading = ({
	title,
	id,
	className,
	action,
	withAccent = true,
}: VenueSectionHeadingProps) => (
	<div className={cn('mb-4 flex items-center justify-between gap-4', className)}>
		<div className='flex min-w-0 items-center gap-3'>
			{withAccent ? (
				<span className='h-6 w-1 shrink-0 rounded-full bg-accent' aria-hidden />
			) : null}
			<h2 id={id} className='text-lg font-semibold text-foreground'>
				{title}
			</h2>
		</div>
		{action ? <div className='shrink-0 text-sm text-muted-foreground'>{action}</div> : null}
	</div>
)
