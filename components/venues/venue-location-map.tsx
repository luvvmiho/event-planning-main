'use client'

import { ensureLeafletDefaultIcons } from '@/lib/leaflet-default-icons'
import { cn } from '@/lib/utils'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'

type VenueLocationMapProps = {
	latitude: number
	longitude: number
	venueName?: string
}

export const VenueLocationMap = ({ latitude, longitude, venueName }: VenueLocationMapProps) => {
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		ensureLeafletDefaultIcons()
		setMounted(true)
	}, [])

	const position: [number, number] = [latitude, longitude]
	const mapKey = `${latitude.toFixed(6)}-${longitude.toFixed(6)}`

	if (!mounted) {
		return (
			<div
				className='h-[280px] w-full animate-pulse rounded-t-2xl bg-muted'
				aria-hidden
			/>
		)
	}

	return (
		<MapContainer
			key={mapKey}
			center={position}
			zoom={15}
			scrollWheelZoom={false}
			className={cn(
				'z-0 h-[280px] w-full rounded-t-2xl',
				'[&_.leaflet-control-attribution]:text-[10px] [&_.leaflet-control-attribution]:leading-tight',
			)}
			aria-label='Байршлын газрын зураг'
		>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
				url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
			/>
			<Marker position={position}>
				<Popup>
					{venueName ? (
						<p className='m-0 mb-1 font-medium text-foreground'>{venueName}</p>
					) : null}
					<p className='m-0 font-mono text-xs text-muted-foreground tabular-nums'>
						{latitude.toFixed(6)}, {longitude.toFixed(6)}
					</p>
				</Popup>
			</Marker>
		</MapContainer>
	)
}
