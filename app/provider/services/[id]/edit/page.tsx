import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ServiceForm } from '@/app/provider/services/new/_components/service-form'
import { ServiceDeleteDialog } from '@/components/provider/service-delete-dialog'
import { ServiceStatusControls } from '@/components/provider/service-status-controls'
import { Button } from '@/components/ui/button'
import { getServiceForManage } from '@/lib/api'
import { getVerifiedSession } from '@/lib/auth/session-context'
import { mapManageServiceToForm } from '@/lib/validations/service'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: 'Үйлчилгээ засах - Nairly' }

type PageProps = { params: Promise<{ id: string }> }

export default async function EditServicePage({ params }: PageProps) {
	const { id } = await params
	const verified = await getVerifiedSession()
	if (!verified) redirect(`/login?next=/provider/services/${id}/edit`)

	const token = verified.session.access_token

	let service
	try {
		const res = await getServiceForManage(id, token)
		service = res.data
	} catch {
		notFound()
	}

	return (
		<div className='p-8'>
			<div className='mb-6'>
				<Button variant='ghost' size='sm' className='mb-4 gap-1' asChild>
					<Link href='/provider/services'>
						<ArrowLeft className='h-4 w-4' aria-hidden />
						Миний үйлчилгээ
					</Link>
				</Button>
				<div className='flex flex-wrap items-start justify-between gap-4'>
					<h1 className='text-2xl font-semibold text-foreground'>{service.name}</h1>
					<ServiceDeleteDialog serviceId={service.id} serviceName={service.name} />
				</div>
			</div>

			<div className='mb-6'>
				<ServiceStatusControls serviceId={service.id} initialStatus={service.status} />
			</div>

			<div className='rounded-2xl border border-border bg-[#f5f3ef]/40 p-8'>
				<ServiceForm
					key={service.id}
					mode='edit'
					serviceId={service.id}
					accessToken={token}
					initialValues={mapManageServiceToForm(service)}
				/>
			</div>
		</div>
	)
}
