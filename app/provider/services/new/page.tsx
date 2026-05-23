import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ServiceForm } from '@/app/provider/services/new/_components/service-form'
import { Button } from '@/components/ui/button'
import { getVerifiedSession } from '@/lib/auth/session-context'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: 'Шинэ үйлчилгээ - Nairly' }

export default async function NewServicePage() {
	const verified = await getVerifiedSession()
	if (!verified) redirect('/login?next=/provider/services/new')

	return (
		<div className='p-8'>
			<Button variant='ghost' size='sm' className='mb-6 gap-1' asChild>
				<Link href='/provider/services'>
					<ArrowLeft className='h-4 w-4' aria-hidden />
					Миний үйлчилгээ
				</Link>
			</Button>
			<h1 className='mb-6 text-2xl font-semibold text-foreground'>Шинэ үйлчилгээ нэмэх</h1>
			<div className='rounded-2xl border border-border bg-[#f5f3ef]/40 p-8'>
				<ServiceForm accessToken={verified.session.access_token} />
			</div>
		</div>
	)
}
