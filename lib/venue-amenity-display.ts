import type { LucideIcon } from 'lucide-react'
import {
	Accessibility,
	Camera,
	Car,
	ConciergeBell,
	ParkingCircle,
	Users,
	Utensils,
	Video,
	Wifi,
	Wrench,
} from 'lucide-react'

export type AmenityDisplay = {
	title: string
	description: string
	icon: LucideIcon
}

const AMENITY_HINTS: { match: RegExp; title: string; description: string; icon: LucideIcon }[] = [
	{
		match: /wifi|wi-fi|интернет|сүлжээ/i,
		title: 'Free Wi-Fi',
		description: 'Өндөр хурдны утасгүй интернет',
		icon: Wifi,
	},
	{
		match: /зогсоол|parking|машин/i,
		title: 'Зогсоолтой',
		description: '200+ машины багтаамжтай',
		icon: ParkingCircle,
	},
	{
		match: /хувцас|solih|шүүгээ|dressing/i,
		title: 'Хувцас солих',
		description: 'Тусгай өрөө болон шүүгээ',
		icon: ConciergeBell,
	},
	{
		match: /vip|хүлээн|reception/i,
		title: 'VIP Танхим',
		description: 'Тусгай хүлээн авалтын өрөө',
		icon: ConciergeBell,
	},
	{
		match: /камер|хяналт|camera|cctv|security/i,
		title: 'Хяналтын камер',
		description: '24 цагийн аюулгүй байдал',
		icon: Video,
	},
	{
		match: /тэргэнцэр|wheelchair|accessibility|тусгай зам/i,
		title: 'Тусгай зам',
		description: 'Тэргэнцэртэй иргэдэд зориулсан',
		icon: Accessibility,
	},
	{
		match: /хоол|catering|ширээ|buffet/i,
		title: 'Хоол үйлчилгээ',
		description: 'Бүрэн хоолны үйлчилгээ',
		icon: Utensils,
	},
	{
		match: /дуут|төхөөрөмж|sound|audio/i,
		title: 'Дуу чимээ',
		description: 'Мэргэжлийн аудио төхөөрөмж',
		icon: Wrench,
	},
	{
		match: /зураг|photo|camera/i,
		title: 'Зураг авалт',
		description: 'Зураг авалтын боломж',
		icon: Camera,
	},
]

export const formatCapacityAmenity = (min: number, max: number): AmenityDisplay => ({
	title: 'Боломжит хүний тоо',
	description: `${min}–${max} хүн`,
	icon: Users,
})

export const parseAmenityDisplay = (raw: string): AmenityDisplay => {
	const trimmed = raw.trim()
	const dashSplit = trimmed.split(/\s[-–—]\s/)
	const title = dashSplit[0]?.trim() || trimmed
	const description = dashSplit[1]?.trim()

	for (const hint of AMENITY_HINTS) {
		if (hint.match.test(trimmed)) {
			return {
				title: description ? title : hint.title,
				description: description ?? hint.description,
				icon: hint.icon,
			}
		}
	}

	return {
		title,
		description: description ?? 'Танхимын боломж',
		icon: Car,
	}
}
