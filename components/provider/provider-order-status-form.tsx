'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { updateProviderOrderStatus, type ProviderOrderStatus } from '@/app/provider/actions'

const OPTIONS: { value: ProviderOrderStatus; label: string }[] = [
	{ value: 'pending', label: 'Хүлээгдэж буй' },
	{ value: 'paid', label: 'Баталгаажсан' },
	{ value: 'cancelled', label: 'Цуцлагдсан' },
]

export type ProviderOrderStatusFormProps = {
	orderId: string
	initialStatus: string
}

export const ProviderOrderStatusForm = ({ orderId, initialStatus }: ProviderOrderStatusFormProps) => {
	const [pending, startTransition] = useTransition()

	const handleValueChange = (value: string) => {
		startTransition(async () => {
			const result = await updateProviderOrderStatus(orderId, value as ProviderOrderStatus)
			if (!result.ok) toast.error(result.error)
		})
	}

	const safe =
		initialStatus === 'pending' || initialStatus === 'paid' || initialStatus === 'cancelled'
			? initialStatus
			: 'pending'

	return (
		<div className='flex max-w-xs flex-col gap-2'>
			<label htmlFor={`order-status-${orderId}`} className='text-sm font-medium text-foreground'>
				Захиалгын төлөв
			</label>
			<Select value={safe} onValueChange={handleValueChange} disabled={pending}>
				<SelectTrigger id={`order-status-${orderId}`} className='w-full' aria-label='Захиалга төлөв сонгох'>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{OPTIONS.map((o) => (
						<SelectItem key={o.value} value={o.value}>
							{o.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{pending && <p className='text-xs text-muted-foreground'>Хадгалж байна…</p>}
		</div>
	)
}
