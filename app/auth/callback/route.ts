import { createClient } from '@/lib/supabase/server'
import {
  getAuthenticatedProfile,
  resolveUserTypeFromSources,
} from '@/lib/auth/session-context'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.session?.user) {
      if (next) return NextResponse.redirect(`${origin}${next}`)

      const fromJwt = resolveUserTypeFromSources(null, data.session.user.user_metadata)
      const ctx = await getAuthenticatedProfile()
      const destination = (ctx?.userType ?? fromJwt) === 'provider' ? '/provider' : '/'
      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
