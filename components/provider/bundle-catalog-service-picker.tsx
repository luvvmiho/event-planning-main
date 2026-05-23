'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { serviceKindLabelMn } from '@/lib/service-labels'
import type { ServiceKind, ServiceManageDetail } from '@/lib/types'
import { cn } from '@/lib/utils'

type BundleCatalogServicePickerProps = {
	open: boolean
	onOpenChange: (open: boolean) => void
	services: ServiceManageDetail[]
	excludeIds?: string[]
	onSelect: (service: ServiceManageDetail) => void
}

const formatMnt = (n: number) => new Intl.NumberFormat('mn-MN').format(n) + '₮'

export const BundleCatalogServicePicker = ({
	open,
	onOpenChange,
	services,
	excludeIds = [],
	onSelect,
}: BundleCatalogServicePickerProps) => {
	const excluded = new Set(excludeIds)
	const available = services.filter((s) => !excluded.has(s.id))

	const handleSelect = (service: ServiceManageDetail) => {
		onSelect(service)
		onOpenChange(false)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-h-[85vh] max-w-lg overflow-hidden p-0'>
				<DialogHeader className='border-b border-border px-6 py-4'>
					<DialogTitle>Миний үйлчилгээнээс сонгох</DialogTitle>
					<DialogDescription>
						Каталогын үйлчилгээг багцад холбоно. Үнэ зөвхөн лавлагаа — багцын нийт үнэд
						автоматаар нэмэгдэхгүй.
					</DialogDescription>
				</DialogHeader>
				<div className='max-h-[min(60vh,480px)] overflow-y-auto px-4 py-3'>
					{available.length === 0 ? (
						<p className='px-2 py-8 text-center text-sm text-muted-foreground'>
							{services.length === 0
								? 'Одоогоор үйлчилгээ байхгүй. Эхлээд «Үйлчилгээ» хэсэгт нэмнэ үү.'
								: 'Бүх үйлчилгээг энэ багцад аль хэдийн нэмсэн байна.'}
						</p>
					) : (
						<ul className='space-y-2'>
							{available.map((service) => (
								<li key={service.id}>
									<button
										type='button'
										onClick={() => handleSelect(service)}
										className={cn(
											'flex w-full gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors',
											'hover:border-accent/40 hover:bg-accent/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
										)}
									>
										<div className='relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted'>
											{service.image_url ? (
												<img
													src={service.image_url}
													alt=''
													className='size-full object-cover'
												/>
											) : null}
										</div>
										<div className='min-w-0 flex-1'>
											<div className='flex flex-wrap items-center gap-2'>
												<p className='font-medium text-foreground'>{service.name}</p>
												{service.status !== 'published' ? (
													<Badge variant='secondary' className='text-[10px]'>
														{service.status === 'draft' ? 'Ноорог' : 'Архив'}
													</Badge>
												) : null}
											</div>
											<p className='text-xs text-muted-foreground'>
												{serviceKindLabelMn(service.kind as ServiceKind)}
											</p>
											<p className='mt-1 text-sm font-semibold tabular-nums text-accent'>
												{formatMnt(service.price_flat)}
												<span className='ml-1 text-xs font-normal text-muted-foreground'>
													(лавлагаа)
												</span>
											</p>
										</div>
									</button>
								</li>
							))}
						</ul>
					)}
				</div>
				<div className='border-t border-border px-6 py-3'>
					<Button type='button' variant='outline' className='w-full' onClick={() => onOpenChange(false)}>
						Хаах
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
