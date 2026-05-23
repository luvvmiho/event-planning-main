import Link from 'next/link'
import { getAuthenticatedProfile } from '@/lib/auth/session-context'
import { getProviderVenues } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ProviderVenuesGrid } from '@/components/provider/provider-venues-grid'
import { PlusCircle } from 'lucide-react'

export const metadata = { title: 'Миний байршлууд - Nairly' }

export default async function ProviderVenuesPage() {
  const ctx = await getAuthenticatedProfile()
  const session = ctx?.session
  const accessToken = session?.access_token
  const userId = session?.user.id ?? ''

  let venues: Awaited<ReturnType<typeof getProviderVenues>>['data'] = []
  if (session && ctx?.userType === 'provider') {
    try {
      const res = await getProviderVenues(userId, accessToken)
      venues = res.data
    } catch {
      venues = []
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Миний байршлууд</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Таны үүсгэсэн байршлууд — зөвхөн та харна уу
          </p>
        </div>
        <Button asChild>
          <Link href="/provider/venues/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Байршил нэмэх
          </Link>
        </Button>
      </div>

      <ProviderVenuesGrid venues={venues} emptyCtaHref="/provider/venues/new" />
    </div>
  )
}
