'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedProfile } from '@/lib/auth/session-context'
import type { AuthActionState, LoginFormValues, RegisterFormValues } from '@/lib/types'

export async function signIn(values: LoginFormValues): Promise<AuthActionState> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: values.email,
    password: values.password,
  })

  if (error) return { error: error.message }

  const ctx = await getAuthenticatedProfile()
  if (ctx?.userType === 'provider') redirect('/provider')

  redirect('/')
}

export async function signUp(values: RegisterFormValues): Promise<AuthActionState> {
  if (!values.acceptTerms) {
    return { error: 'Үйлчилгээний нөхцөлийг зөвшөөрнө үү' }
  }

  const headersList = await headers()
  const origin = headersList.get('origin') ?? 'http://localhost:3000'
  const redirectTo =
    process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${origin}/auth/callback`

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      emailRedirectTo: redirectTo,
      data: {
        name: values.name,
        phone: values.phone,
        user_type: values.userType,
        service_category: values.userType === 'provider' ? (values.serviceCategory ?? null) : null,
        registration_number:
          values.userType === 'provider' ? (values.registrationNumber ?? null) : null,
      },
    },
  })

  if (error) return { error: error.message }

  redirect('/register/success')
}
