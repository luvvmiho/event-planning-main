import Link from 'next/link'
import { Cake, Camera, Car, Flower2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { ServiceKind } from '@/lib/types'

const FEATURED_SERVICE_CATEGORIES: {
	kind: ServiceKind
	name: string
	description: string
	icon: typeof Car
}[] = [
	{
		kind: 'car',
		name: 'Тээвэр',
		description: 'Хүндэт зочдын унаа',
		icon: Car,
	},
	{
		kind: 'decoration',
		name: 'Цэцэг',
		description: 'Чимэглэл ба баглаа',
		icon: Flower2,
	},
	{
		kind: 'cake',
		name: 'Бялуу',
		description: 'Захиалгат амттан',
		icon: Cake,
	},
	{
		kind: 'photoshoot',
		name: 'Зураг авалт',
		description: 'Мэргэжлийн баг',
		icon: Camera,
	},
]

const servicesListHref = (kind: ServiceKind) =>
	`/services?${new URLSearchParams({ kind }).toString()}`

export const AdditionalServices = () => {
	return (
		<section className='bg-secondary/50 py-12'>
			<div className='container mx-auto px-4'>
				<div className='mb-6 flex items-center justify-between'>
					<div>
						<p className='mb-1 text-xs font-medium uppercase tracking-wider text-accent'>
							Үйлчилгээ
						</p>
						<h2 className='text-xl font-semibold text-foreground'>
							Нэмэлт үйлчилгээнүүд
						</h2>
					</div>
					<Link
						href='/services'
						className='text-sm font-medium text-foreground hover:text-accent'
					>
						Бүгдийг үзэх →
					</Link>
				</div>

				<div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
					{FEATURED_SERVICE_CATEGORIES.map((service) => (
						<Link
							key={service.kind}
							href={servicesListHref(service.kind)}
							aria-label={`${service.name} — үйлчилгээний жагсаалт`}
						>
							<Card className='group h-full border-border bg-card transition-all hover:border-accent hover:shadow-md'>
								<CardContent className='flex flex-col items-center p-6 text-center'>
									<div className='mb-4 rounded-lg bg-secondary p-3 transition-colors group-hover:bg-accent/10'>
										<service.icon className='h-6 w-6 text-foreground' aria-hidden />
									</div>
									<h3 className='mb-1 text-sm font-semibold text-foreground'>
										{service.name}
									</h3>
									<p className='text-xs text-muted-foreground'>{service.description}</p>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			</div>
		</section>
	)
}
