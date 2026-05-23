import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { ServiceDetailExperience } from '@/components/services/service-detail-experience'
import { Button } from '@/components/ui/button'
import { getServiceBySlug } from '@/lib/api'
import {
	isMarketplaceServiceSlug,
	MARKETPLACE_SERVICE_DETAILS,
} from '@/lib/marketplace-services'

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps) {
	const { slug } = await params

	try {
		const { data: service } = await getServiceBySlug(slug)
		return {
			title: `${service.name} - Nairly`,
			description: service.short_description || service.description || undefined,
		}
	} catch {
		if (!isMarketplaceServiceSlug(slug)) {
			return { title: 'Үйлчилгээ олдсонгүй - Nairly' }
		}
		const detail = MARKETPLACE_SERVICE_DETAILS[slug]
		return {
			title: `${detail.title} - Nairly`,
			description: detail.lede,
		}
	}
}

export default async function ServiceSlugPage({ params }: PageProps) {
	const { slug } = await params

	try {
		const { data: service } = await getServiceBySlug(slug)
		return (
			<div className='flex min-h-screen flex-col'>
				<Header />
				<main className='flex-1'>
					<ServiceDetailExperience service={service} />
				</main>
				<Footer />
			</div>
		)
	} catch {
		if (!isMarketplaceServiceSlug(slug)) {
			notFound()
		}

		const detail = MARKETPLACE_SERVICE_DETAILS[slug]

		return (
			<div className='flex min-h-screen flex-col'>
				<Header />
				<main className='flex-1 bg-background py-12'>
					<div className='container mx-auto max-w-2xl px-4'>
						<Button variant='ghost' size='sm' className='mb-6 -ml-2 text-muted-foreground' asChild>
							<Link href='/services'>← Бүх үйлчилгээ</Link>
						</Button>
						<h1 className='mb-3 border-l-4 border-accent pl-4 text-3xl font-bold text-foreground'>
							{detail.title}
						</h1>
						<p className='mb-6 pl-5 text-lg text-muted-foreground'>{detail.lede}</p>
						<p className='pl-5 leading-relaxed text-foreground'>{detail.body}</p>
						<div className='mt-10 pl-5'>
							<Button asChild>
								<Link href={slug === 'venues' ? '/venues' : '/services'}>
									{slug === 'venues' ? 'Танхимуудыг үзэх' : 'Үйлчилгээний каталог'}
								</Link>
							</Button>
						</div>
					</div>
				</main>
				<Footer />
			</div>
		)
	}
}
