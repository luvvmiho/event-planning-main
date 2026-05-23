'use client'

import { submitUpdateServiceStatus } from '@/actions/service.actions'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import type { ServiceStatus } from '@/lib/types'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

const STATUS_LABELS: Record<ServiceStatus, string> = {
	draft: 'Ноорог',
	published: 'Нийтэлсэн',
	archived: 'Архивласан',
}

type ServiceStatusControlsProps = {
	serviceId: string
	initialStatus: ServiceStatus
}

export const ServiceStatusControls = ({
	serviceId,
	initialStatus,
}: ServiceStatusControlsProps) => {
	const router = useRouter()
	const [status, setStatus] = useState<ServiceStatus>(initialStatus)
	const [pending, startTransition] = useTransition()

	const handleStatusChange = (next: ServiceStatus) => {
		setStatus(next)
		startTransition(async () => {
			const result = await submitUpdateServiceStatus(serviceId, next)
			if (!result.ok) {
				setStatus(initialStatus)
				toast.error(result.error)
				return
			}
			toast.success('Төлөв шинэчлэгдлээ')
			router.refresh()
		})
	}

	return (
		<div className='flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4'>
			<span className='text-sm text-muted-foreground'>Төлөв:</span>
			<Select
				value={status}
				onValueChange={(v) => handleStatusChange(v as ServiceStatus)}
				disabled={pending}
			>
				<SelectTrigger className='h-9 w-[200px]' aria-label='Үйлчилгээний төлөв'>
					<SelectValue placeholder='Төлөв сонгох' />
				</SelectTrigger>
				<SelectContent>
					{(Object.keys(STATUS_LABELS) as ServiceStatus[]).map((key) => (
						<SelectItem key={key} value={key}>
							{STATUS_LABELS[key]}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{pending ? <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' /> : null}
		</div>
	)
}
