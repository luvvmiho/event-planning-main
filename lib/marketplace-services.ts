import type { MarketplaceServiceSlug, ServiceDetail } from '@/lib/types'

export type { MarketplaceServiceSlug, ServiceDetail }

export const MARKETPLACE_SERVICE_SLUGS = [
  'venues',
  'catering',
  'decoration',
  'photography',
  'transportation',
  'bakery',
  'entertainment',
  'others',
  'flowers',
  'cake',
] as const

export function isMarketplaceServiceSlug(s: string): s is MarketplaceServiceSlug {
  return (MARKETPLACE_SERVICE_SLUGS as readonly string[]).includes(s)
}

export const MARKETPLACE_SERVICE_DETAILS: Record<MarketplaceServiceSlug, ServiceDetail> = {
  venues: {
    title: 'Байршил & Танхим',
    lede: 'Зочид буудал, ресторан, танхим, гадаа талбай',
    body: 'Арга хэмжээний танхим, зочид буудал, ресторан зэрэг байршлуудыг хайж олно уу.',
  },
  catering: {
    title: 'Хоол үйлчилгээ',
    lede: 'Кейтеринг, хоолны үйлчилгээ',
    body: 'Арга хэмжээний хоол үйлчилгээг мэргэжлийн багаар хангана.',
  },
  decoration: {
    title: 'Цэцэг засал & Чимэглэл',
    lede: 'Танхим чимэглэл, цэцэг засал',
    body: 'Арга хэмжээнийхээ орчинг гоёж чимэглэхэд туслана.',
  },
  photography: {
    title: 'Зураг авалт',
    lede: 'Фото, видео авалт',
    body: 'Мэргэжлийн гэрэл зурагчид болон видео операторуудыг олно уу.',
  },
  transportation: {
    title: 'Тээврийн үйлчилгээ',
    lede: 'Зорчигч, VIP тээвэр',
    body: 'Зочдоо тусгай тээвэрт суулган хүргэх үйлчилгээ.',
  },
  bakery: {
    title: 'Бялуу & Нарийн боов',
    lede: 'Бялуу, солодко, кондитер',
    body: 'Өвөрмөц загварын бялуу болон амттанг захиалж болно.',
  },
  entertainment: {
    title: 'Тоглоом үзвэр',
    lede: 'DJ, тоглоом, дуу хөгжим',
    body: 'Арга хэмжээндээ сонирхолтой тоглоом, үзвэр нэмнэ үү.',
  },
  others: {
    title: 'Бусад үйлчилгээ',
    lede: 'Нэмэлт үйлчилгээнүүд',
    body: 'Арга хэмжээний бусад дэмжлэгийн үйлчилгээнүүд.',
  },
  flowers: {
    title: 'Цэцэг',
    lede: 'Цэцгийн чимэглэл, бэлэг',
    body: 'Арга хэмжээний цэцгийн чимэглэл болон бэлэг цэцэг.',
  },
  cake: {
    title: 'Торт',
    lede: 'Тусгай загварын торт',
    body: 'Өвөрмөц загварын торт болон амттан захиалах.',
  },
}
