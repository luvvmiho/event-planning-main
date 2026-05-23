import { createClient } from '@/lib/supabase/server'
import type { Session, User } from '@supabase/supabase-js'
import type { UserType } from '@/lib/types'

export const getVerifiedSession = async (): Promise<{ session: Session; user: User } | null> => {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return null

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) return null

  return { session: { ...session, user }, user }
}

export type UserProfileRow = {
  user_type: string | null
  full_name: string | null
  phone: string | null
  service_category: string | null
  registration_number: string | null
}

export const resolveUserTypeFromSources = (
  profile: { user_type: string | null } | null,
  meta: Record<string, unknown> | undefined,
): UserType => {
  const p = profile?.user_type
  if (p === 'provider' || p === 'user') return p
  const m = meta?.user_type
  if (m === 'provider' || m === 'user') return m
  return 'user'
}

export const getAuthenticatedProfile = async (): Promise<{
  session: Session
  userType: UserType
  profile: UserProfileRow | null
} | null> => {
  const verified = await getVerifiedSession()
  if (!verified) return null

  const { session, user } = verified
  const supabase = await createClient()

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('user_type, full_name, phone, service_category, registration_number')
    .eq('id', user.id)
    .maybeSingle()

  const profile = profileRow as UserProfileRow | null

  const userType = resolveUserTypeFromSources(profile ?? null, user.user_metadata)
  return { session, userType, profile }
}

export const getAuthContext = async () => {
  const ctx = await getAuthenticatedProfile()
  if (!ctx) return null
  return { session: ctx.session, userType: ctx.userType }
}
