import { redirect } from 'next/navigation'
import { getCategories, listMyServices } from '@/lib/api'
import { getVerifiedSession } from '@/lib/auth/session-context'
import { VenueForm } from './_components/venue-form'

export const metadata = { title: 'Байршил нэмэх - Nairly' }

export default async function NewVenuePage() {
  const verified = await getVerifiedSession()
  if (!verified) redirect('/login?next=/provider/venues/new')

  let categories: Awaited<ReturnType<typeof getCategories>>['data'] = []
  try {
    const res = await getCategories()
    categories = res.data
  } catch {
    categories = []
  }

  let providerServices: Awaited<ReturnType<typeof listMyServices>>['data'] = []
  try {
    const res = await listMyServices(verified.session.access_token)
    providerServices = res.data
  } catch {
    providerServices = []
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Байршил нэмэх</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Шинэ байршлын мэдээллийг бөглөж нэмнэ үү
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-[#f5f3ef]/40 p-8">
        <VenueForm
          categories={categories}
          accessToken={verified.session.access_token}
          providerServices={providerServices}
        />
      </div>
    </div>
  )
}
