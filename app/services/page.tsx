import Link from 'next/link'
import { Suspense } from 'react'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { ServiceFilters } from '@/components/services/service-filters'
import { ServiceList } from '@/components/services/service-list'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getServices } from '@/lib/api'
import type { ServiceKind } from '@/lib/types'

const ITEMS_PER_PAGE = 12

const SERVICE_KINDS: ServiceKind[] = [
	'car',
	'cake',
	'photoshoot',
	'entertainment',
	'decoration',
	'catering',
	'other',
]

function isServiceKind(value: string | undefined): value is ServiceKind {
	return Boolean(value && SERVICE_KINDS.includes(value as ServiceKind))
}

type PageProps = {
	searchParams: Promise<{ kind?: string; search?: string; page?: string }>
}

export default async function ServicesBrowsePage({ searchParams }: PageProps) {
	const params = await searchParams
	const kind = isServiceKind(params.kind) ? params.kind : undefined
	const search = params.search?.trim() || undefined
	const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)

	let services: Awaited<ReturnType<typeof getServices>>['data'] = []
	let totalCount = 0
	let totalPages = 0

	try {
		const res = await getServices({ kind, search, page, limit: ITEMS_PER_PAGE })
		services = res.data
		totalCount = res.meta.total
		totalPages = res.meta.totalPages
	} catch {
		services = []
	}

	return (
		<div className='flex min-h-screen flex-col'>
			<Header />
			<main className='flex-1 bg-background py-12'>
				<div className='container mx-auto px-4'>
					<Suspense fallback={<Skeleton className='h-32 w-full' />}>
						<ServiceFilters totalCount={totalCount} activeKind={kind} activeSearch={search} />
					</Suspense>

					<div className='mt-8'>
						<ServiceList
							services={services}
							emptyHint={
								kind || search
									? {
											title: 'Шүүлтүүрт тохирох үйлчилгээ олдсонгүй',
											description: 'Өөр төрөл эсвэл хайлтаар дахин оролдоно уу.',
										}
									: undefined
							}
						/>
					</div>

					{totalPages > 1 ? (
						<div className='mt-8 flex justify-center gap-2'>
							{page > 1 ? (
								<Button variant='outline' asChild>
									<Link
										href={`/services?${new URLSearchParams({
											...(kind ? { kind } : {}),
											...(search ? { search } : {}),
											page: String(page - 1),
										}).toString()}`}
									>
										← Өмнөх
									</Link>
								</Button>
							) : null}
							<span className='flex items-center px-3 text-sm text-muted-foreground'>
								{page} / {totalPages}
							</span>
							{page < totalPages ? (
								<Button variant='outline' asChild>
									<Link
										href={`/services?${new URLSearchParams({
											...(kind ? { kind } : {}),
											...(search ? { search } : {}),
											page: String(page + 1),
										}).toString()}`}
									>
										Дараах →
									</Link>
								</Button>
							) : null}
						</div>
					) : null}
				</div>
			</main>
			<Footer />
		</div>
	)
}
