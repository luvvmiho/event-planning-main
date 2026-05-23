import { ServiceCard } from '@/components/services/service-card'
import type { ServiceListItem } from '@/lib/types'

type ServiceListProps = {
	services: ServiceListItem[]
	emptyHint?: { title: string; description: string }
}

export const ServiceList = ({ services, emptyHint }: ServiceListProps) => {
	if (services.length === 0) {
		return (
			<div className='rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center'>
				<h2 className='text-lg font-semibold text-foreground'>
					{emptyHint?.title ?? 'Үйлчилгээ олдсонгүй'}
				</h2>
				<p className='mt-2 text-sm text-muted-foreground'>
					{emptyHint?.description ?? 'Өөр төрөл эсвэл хайлтаар дахин оролдоно уу.'}
				</p>
			</div>
		)
	}

	return (
		<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
			{services.map((service) => (
				<ServiceCard key={service.id} service={service} />
			))}
		</div>
	)
}
