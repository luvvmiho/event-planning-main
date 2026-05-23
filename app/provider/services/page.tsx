import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ProviderServicesGrid } from '@/components/provider/provider-services-grid'
import { Button } from '@/components/ui/button'
import { listMyServices } from '@/lib/api'
import { getAuthenticatedProfile } from '@/lib/auth/session-context'
import { PlusCircle } from 'lucide-react'

export const metadata = { title: 'Миний үйлчилгээ - Nairly' }

export default async function ProviderServicesPage() {
	const ctx = await getAuthenticatedProfile()
	if (!ctx?.session || ctx.userType !== 'provider') {
		redirect('/login?next=/provider/services')
	}

	let services: Awaited<ReturnType<typeof listMyServices>>['data'] = []
	try {
		const res = await listMyServices(ctx.session.access_token)
		services = res.data
	} catch {
		services = []
	}

	return (
		<div className='p-8'>
			<div className='mb-8 flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-semibold text-foreground'>Миний үйлчилгээ</h1>
					<p className='mt-1 text-sm text-muted-foreground'>
						Машин, бялуу, зураг авалт гэх мэт — бүх төлөвт харагдана
					</p>
				</div>
				<Button asChild>
					<Link href='/provider/services/new'>
						<PlusCircle className='mr-2 h-4 w-4' />
						Үйлчилгээ нэмэх
					</Link>
				</Button>
			</div>

			<ProviderServicesGrid services={services} emptyCtaHref='/provider/services/new' />
		</div>
	)
}
