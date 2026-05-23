import { CartPageClient } from './_components/cart-page-client'
import { getAuthenticatedProfile } from '@/lib/auth/session-context'
import type { CheckoutAutofillContact } from '@/components/cart/checkout-section'

export const metadata = {
  title: 'Миний сагс - Nairly',
}

export default async function CartPage() {
  const ctx = await getAuthenticatedProfile()

  let autofillContact: CheckoutAutofillContact | undefined
  if (ctx) {
    const metaName = ctx.session.user.user_metadata?.name as string | undefined
    const metaPhone = ctx.session.user.user_metadata?.phone as string | undefined
    autofillContact = {
      fullName: (ctx.profile?.full_name ?? metaName ?? '').trim(),
      email: (ctx.session.user.email ?? '').trim(),
      phone: (ctx.profile?.phone ?? metaPhone ?? '').trim(),
    }
  }

  return <CartPageClient autofillContact={autofillContact} />
}
