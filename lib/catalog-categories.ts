import { getCategories } from '@/lib/api'
import type { CatalogCategory } from '@/lib/types'

export type { CatalogCategory }

const COVER_BY_SLUG: Record<string, string> = {
  venue:
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=600&auto=format&fit=crop',
  restaurant:
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop',
  hotel:
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop',
  cafe: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop',
  hall: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop',
  outdoor:
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=600&auto=format&fit=crop',
}

export function catalogCategoryCoverUrl(slug: string): string {
  return COVER_BY_SLUG[slug] ?? COVER_BY_SLUG.venue
}

export async function getCatalogCategories(): Promise<CatalogCategory[]> {
  try {
    const { data } = await getCategories()
    return data
  } catch (err) {
    console.error('getCatalogCategories:', err)
    return []
  }
}
