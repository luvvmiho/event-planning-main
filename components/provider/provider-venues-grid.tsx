import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, MapPin, Pencil, PlusCircle, Users } from 'lucide-react'
import type { VenueListItem, VenueStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

const STATUS_LABELS: Record<VenueStatus, string> = {
	draft: 'Ноорог',
	published: 'Нийтэлсэн',
	archived: 'Архив',
}

const statusBadgeClass = (status?: VenueStatus) => {
	if (status === 'published') return 'bg-emerald-100 text-emerald-800'
	if (status === 'draft') return 'bg-amber-100 text-amber-800'
	if (status === 'archived') return 'bg-muted text-muted-foreground'
	return 'bg-secondary text-secondary-foreground'
}

type Props = {
  venues: VenueListItem[]
  emptyCtaHref: string
}

export const ProviderVenuesGrid = ({ venues, emptyCtaHref }: Props) => {
  if (venues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-[#f5f3ef]/50 py-16 text-center">
        <Building2 className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h2 className="text-lg font-medium text-foreground">Байршил байхгүй байна</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Эхний байршлаа нэмж эхлээрэй
        </p>
        <Button asChild className="mt-6">
          <Link href={emptyCtaHref}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Байршил нэмэх
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {venues.map((venue) => (
        <div key={venue.id} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {venue.image_url ? (
            <img src={venue.image_url} alt={venue.name} className="h-40 w-full object-cover" />
          ) : (
            <div className="flex h-40 w-full items-center justify-center bg-secondary/30">
              <Building2 className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}
          <div className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-foreground">{venue.name}</h3>
              {venue.status ? (
                <Badge className={cn('text-[10px] font-medium', statusBadgeClass(venue.status))}>
                  {STATUS_LABELS[venue.status]}
                </Badge>
              ) : null}
            </div>
            {venue.short_description && (
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{venue.short_description}</p>
            )}
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {venue.location}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {venue.capacity_min}–{venue.capacity_max}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-foreground">
                {venue.price_per_person.toLocaleString()}₮
                <span className="text-xs font-normal text-muted-foreground"> / хүн</span>
              </span>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/provider/venues/${venue.id}/edit`}>
                    <Pencil className="mr-1 h-3.5 w-3.5" aria-hidden />
                    Засах
                  </Link>
                </Button>
                {venue.status === 'published' ? (
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/venues/${venue.slug}`}>Харах</Link>
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
