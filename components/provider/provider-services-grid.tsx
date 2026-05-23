import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { serviceKindLabelMn } from '@/lib/service-labels'
import type { ServiceManageDetail, ServiceStatus } from '@/lib/types'
import { cn } from '@/lib/utils'
import { MapPin, Package, Pencil, PlusCircle } from 'lucide-react'

const STATUS_LABELS: Record<ServiceStatus, string> = {
	draft: 'Ноорог',
	published: 'Нийтэлсэн',
	archived: 'Архив',
}

const statusBadgeClass = (status?: ServiceStatus) => {
	if (status === 'published') return 'bg-emerald-100 text-emerald-800'
	if (status === 'draft') return 'bg-amber-100 text-amber-800'
	if (status === 'archived') return 'bg-muted text-muted-foreground'
	return 'bg-secondary text-secondary-foreground'
}

type Props = {
	services: ServiceManageDetail[]
	emptyCtaHref: string
}

export const ProviderServicesGrid = ({ services, emptyCtaHref }: Props) => {
	if (services.length === 0) {
		return (
			<div className='flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-[#f5f3ef]/50 py-16 text-center'>
				<Package className='mb-4 h-12 w-12 text-muted-foreground/50' />
				<h2 className='text-lg font-medium text-foreground'>Үйлчилгээ байхгүй байна</h2>
				<p className='mt-1 text-sm text-muted-foreground'>Эхний үйлчилгээгээ нэмж эхлээрэй</p>
				<Button asChild className='mt-6'>
					<Link href={emptyCtaHref}>
						<PlusCircle className='mr-2 h-4 w-4' />
						Үйлчилгээ нэмэх
					</Link>
				</Button>
			</div>
		)
	}

	return (
		<div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
			{services.map((service) => (
				<div key={service.id} className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
					{service.image_url ? (
						<img src={service.image_url} alt={service.name} className='h-40 w-full object-cover' />
					) : (
						<div className='flex h-40 w-full items-center justify-center bg-secondary/30'>
							<Package className='h-10 w-10 text-muted-foreground/40' />
						</div>
					)}
					<div className='p-4'>
						<div className='flex flex-wrap items-center gap-2'>
							<h3 className='font-semibold text-foreground'>{service.name}</h3>
							<Badge className={cn('text-[10px] font-medium', statusBadgeClass(service.status))}>
								{STATUS_LABELS[service.status]}
							</Badge>
						</div>
						<p className='mt-1 text-xs text-muted-foreground'>
							{serviceKindLabelMn(service.kind)}
						</p>
						{service.short_description ? (
							<p className='mt-1 line-clamp-2 text-xs text-muted-foreground'>
								{service.short_description}
							</p>
						) : null}
						{service.location ? (
							<div className='mt-3 flex items-center gap-1 text-xs text-muted-foreground'>
								<MapPin className='h-3.5 w-3.5' />
								{service.location}
							</div>
						) : null}
						<div className='mt-3 flex flex-wrap items-center justify-between gap-2'>
							<span className='text-sm font-semibold text-foreground'>
								{service.price_flat.toLocaleString()}₮
							</span>
							<div className='flex gap-2'>
								<Button asChild variant='outline' size='sm'>
									<Link href={`/provider/services/${service.id}/edit`}>
										<Pencil className='mr-1 h-3.5 w-3.5' aria-hidden />
										Засах
									</Link>
								</Button>
								{service.status === 'published' ? (
									<Button asChild variant='ghost' size='sm'>
										<Link href={`/services/${service.slug}`}>Харах</Link>
									</Button>
								) : null}
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	)
}
