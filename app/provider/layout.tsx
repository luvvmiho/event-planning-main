import { Header } from '@/components/layout/header'
import { ProviderAppShell } from '@/components/provider/provider-app-shell'
import { getAuthenticatedProfile } from '@/lib/auth/session-context'
import { redirect } from 'next/navigation'

export const metadata = {
	title: 'Үйлчилгээ үзүүлэгч - Nairly',
}

export default async function ProviderLayout({ children }: { children: React.ReactNode }) {
	const ctx = await getAuthenticatedProfile()

	if (!ctx) redirect('/login?next=/provider')

	const { session, userType } = ctx
	const user = session.user

	if (userType !== 'provider') redirect('/profile')

	const name =
		(user.user_metadata?.name as string | undefined) ??
		ctx.profile?.full_name ??
		user.email ??
		'Үйлчилгээ үзүүлэгч'

	return (
		<div className='flex min-h-screen flex-col'>
			<Header />
			<div className='flex min-h-0 flex-1'>
				<ProviderAppShell userName={name} userEmail={user.email ?? ''}>
					{children}
				</ProviderAppShell>
			</div>
		</div>
	)
}
