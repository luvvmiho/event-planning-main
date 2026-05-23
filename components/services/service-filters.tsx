'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SERVICE_KIND_OPTIONS } from '@/lib/service-labels'
import type { ServiceKind } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

type ServiceFiltersProps = {
	totalCount: number
	activeKind?: ServiceKind
	activeSearch?: string
}

export const ServiceFilters = ({ totalCount, activeKind, activeSearch }: ServiceFiltersProps) => {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [search, setSearch] = useState(activeSearch ?? '')

	const handleKind = (kind?: ServiceKind) => {
		const params = new URLSearchParams(searchParams.toString())
		if (kind) params.set('kind', kind)
		else params.delete('kind')
		params.delete('page')
		router.push(`/services?${params.toString()}`)
	}

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault()
		const params = new URLSearchParams(searchParams.toString())
		const q = search.trim()
		if (q) params.set('search', q)
		else params.delete('search')
		params.delete('page')
		router.push(`/services?${params.toString()}`)
	}

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='border-l-4 border-accent pl-4 text-3xl font-bold italic text-foreground'>
					Үйлчилгээнүүд
				</h1>
				<p className='mt-2 pl-5 text-muted-foreground'>
					{totalCount} үйлчилгээ олдлоо
				</p>
			</div>

			<form onSubmit={handleSearch} className='flex max-w-md gap-2'>
				<div className='relative flex-1'>
					<Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
					<Input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder='Хайх...'
						className='pl-9'
						aria-label='Үйлчилгээ хайх'
					/>
				</div>
				<Button type='submit' variant='secondary'>
					Хайх
				</Button>
			</form>

			<div className='flex flex-wrap gap-2'>
				<Button
					type='button'
					variant={activeKind ? 'outline' : 'default'}
					size='sm'
					onClick={() => handleKind(undefined)}
					className={cn(!activeKind && 'bg-accent text-accent-foreground hover:bg-accent/90')}
				>
					Бүгд
				</Button>
				{SERVICE_KIND_OPTIONS.map((opt) => (
					<Button
						key={opt.value}
						type='button'
						variant={activeKind === opt.value ? 'default' : 'outline'}
						size='sm'
						onClick={() => handleKind(opt.value)}
						className={cn(
							activeKind === opt.value && 'bg-accent text-accent-foreground hover:bg-accent/90',
						)}
					>
						{opt.label}
					</Button>
				))}
				<Button variant='ghost' size='sm' asChild>
					<Link href='/venues'>Танхимууд</Link>
				</Button>
			</div>
		</div>
	)
}
