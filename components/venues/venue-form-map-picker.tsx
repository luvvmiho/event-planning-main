'use client'

import { ensureLeafletDefaultIcons } from '@/lib/leaflet-default-icons'
import { Button } from '@/components/ui/button'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import {
	MapContainer,
	Marker,
	TileLayer,
	useMap,
	useMapEvents,
} from 'react-leaflet'

const UB_CENTER: [number, number] = [47.9184, 106.9177]
const DEFAULT_ZOOM = 12
const PICK_ZOOM = 15

type MapClickHandlerProps = {
	disabled?: boolean
	onSelect: (lat: number, lng: number) => void
}

const MapClickHandler = ({ disabled, onSelect }: MapClickHandlerProps) => {
	useMapEvents({
		click(e) {
			if (disabled) return
			onSelect(e.latlng.lat, e.latlng.lng)
		},
	})
	return null
}

type MapViewSyncProps = {
	lat: number
	lng: number
}

const MapViewSync = ({ lat, lng }: MapViewSyncProps) => {
	const map = useMap()
	useEffect(() => {
		map.setView([lat, lng], Math.max(map.getZoom(), PICK_ZOOM), { animate: true })
	}, [lat, lng, map])
	return null
}

export type VenueFormMapPickerProps = {
	latitude: number | null
	longitude: number | null
	onChange: (lat: number, lng: number) => void
	onClear?: () => void
	disabled?: boolean
}

export const VenueFormMapPicker = ({
	latitude,
	longitude,
	onChange,
	onClear,
	disabled,
}: VenueFormMapPickerProps) => {
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		ensureLeafletDefaultIcons()
		setMounted(true)
	}, [])

	const hasMarker =
		latitude != null &&
		longitude != null &&
		Number.isFinite(latitude) &&
		Number.isFinite(longitude)

	const center: [number, number] = hasMarker ? [latitude, longitude] : UB_CENTER
	const zoom = hasMarker ? PICK_ZOOM : DEFAULT_ZOOM
	const mapKey = hasMarker
		? `${latitude.toFixed(6)}-${longitude.toFixed(6)}`
		: 'default'

	return (
		<div className='overflow-hidden rounded-lg border border-foreground/15'>
			{mounted ? (
			<MapContainer
				key={mapKey}
				center={center}
				zoom={zoom}
				scrollWheelZoom={!disabled}
				className='z-0 h-[280px] w-full [&_.leaflet-control-attribution]:text-[10px]'
				aria-label='Байршил сонгох газрын зураг'
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
					url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
				/>
				<MapClickHandler disabled={disabled} onSelect={onChange} />
				{hasMarker ? (
					<>
						<Marker position={[latitude, longitude]} />
						<MapViewSync lat={latitude} lng={longitude} />
					</>
				) : null}
			</MapContainer>
			) : (
				<div className='h-[280px] w-full animate-pulse bg-muted' aria-hidden />
			)}
			<div className='flex flex-wrap items-center justify-between gap-2 border-t border-foreground/10 bg-muted/30 px-3 py-2'>
				<p className='min-w-0 flex-1 font-mono text-[11px] text-muted-foreground tabular-nums'>
					{hasMarker
						? `Өргөрөг ${latitude.toFixed(6)} · Уртраг ${longitude.toFixed(6)}`
						: 'Газрын зураг дээр дарж координат сонгоно уу'}
				</p>
				{hasMarker && onClear && !disabled ? (
					<Button type='button' variant='ghost' size='sm' className='h-7 shrink-0 text-xs' onClick={onClear}>
						Цэвэрлэх
					</Button>
				) : null}
			</div>
		</div>
	)
}
