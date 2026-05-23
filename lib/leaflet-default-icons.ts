import L from 'leaflet'

let didFix = false

export const ensureLeafletDefaultIcons = () => {
	if (didFix) return
	didFix = true
	const proto = L.Icon.Default.prototype as unknown as { _getIconUrl?: string }
	delete proto._getIconUrl
	L.Icon.Default.mergeOptions({
		iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
		iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
		shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
	})
}
