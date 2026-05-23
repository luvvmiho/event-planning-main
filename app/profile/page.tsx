import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { getAuthenticatedProfile } from '@/lib/auth/session-context'
import {
  Bookmark,
  Building2,
  Camera,
  FileText,
  Pencil,
  Receipt,
  Settings,
  User,
} from 'lucide-react'

export const metadata = { title: 'Профайл - Nairly' }

export default async function ProfilePage() {
  const ctx = await getAuthenticatedProfile()
  if (!ctx) redirect('/login?next=/profile')

  const { userType, profile: profileRow } = ctx
  const user = ctx.session.user
  const metaName = user.user_metadata?.name as string | undefined
  const metaPhone = user.user_metadata?.phone as string | undefined

  const displayName = profileRow?.full_name ?? metaName ?? 'Хэрэглэгч'
  const phone = profileRow?.phone ?? metaPhone ?? '—'

  const navTiles = [
    {
      href: '/event-plans',
      label: 'Төлөвлөгөө',
      icon: FileText,
    },
    userType === 'provider'
      ? {
          href: '/provider/venues',
          label: 'Миний газрууд',
          icon: Building2,
        }
      : {
          href: '/orders',
          label: 'Захиалгууд',
          icon: Receipt,
        },
    {
      href: '/profile/wishlist',
      label: 'Хадгалсан',
      icon: Bookmark,
    },
   
  ] as const

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-secondary/40 py-10">
        <div className="container mx-auto max-w-3xl px-4">
          <h1 className="mb-6 border-l-4 border-accent pl-4 text-3xl font-bold italic text-foreground">
            Миний профайл
          </h1>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
              <div className="flex items-center gap-2 text-foreground">
                <User className="h-5 w-5 text-accent" aria-hidden />
                <h2 className="text-lg font-semibold tracking-tight">Хувийн мэдээлэл</h2>
              </div>
              <span
                className="inline-flex items-center gap-1.5 text-sm font-medium text-accent"
                aria-label="Засварлах — удахгүй нэмэгдэнэ"
              >
                <Pencil className="h-4 w-4" aria-hidden />
                Засварлах
              </span>
            </div>

            <div className="mt-6 flex flex-col gap-8 sm:flex-row sm:items-start">
              <div className="relative mx-auto shrink-0 sm:mx-0">
                <div
                  className="flex size-28 items-center justify-center rounded-2xl border border-border bg-muted"
                  aria-hidden
                >
                  <User className="h-14 w-14 text-muted-foreground/60" />
                </div>
                <span
                  className="absolute -right-1 -top-1 flex size-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm"
                  aria-hidden
                >
                  <Camera className="h-4 w-4" />
                </span>
              </div>

              <div className="grid flex-1 gap-6 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Овог нэр
                  </p>
                  <p className="mt-1.5 text-base font-medium text-foreground">{displayName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    И-мэйл хаяг
                  </p>
                  <p className="mt-1.5 break-all text-base font-medium text-foreground">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Утасны дугаар
                  </p>
                  <p className="mt-1.5 text-base font-medium text-foreground">{phone}</p>
                </div>
              </div>
            </div>

            {userType === 'provider' && profileRow?.service_category ? (
              <p className="mt-6 text-sm text-muted-foreground">
                <span className="font-medium text-foreground/80">Үйлчилгээний чиглэл: </span>
                {profileRow.service_category}
              </p>
            ) : null}
          </section>

          <nav
            className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4"
            aria-label="Профайл цэс"
          >
            {navTiles.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-4 py-8 text-center shadow-sm transition-colors hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <Icon className="h-8 w-8 text-muted-foreground" aria-hidden />
                  <span className="mt-3 text-sm font-medium text-foreground">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </main>
      <Footer />
    </div>
  )
}
