'use client'

import { submitDeleteVenue } from '@/actions/venue.actions'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

type VenueDeleteDialogProps = {
	venueId: string
	venueName: string
}

export const VenueDeleteDialog = ({ venueId, venueName }: VenueDeleteDialogProps) => {
	const [open, setOpen] = useState(false)
	const [pending, startTransition] = useTransition()

	const handleDelete = () => {
		startTransition(async () => {
			const result = await submitDeleteVenue(venueId)
			if (result?.ok === false) {
				toast.error(result.error)
			}
		})
	}

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>
				<Button type='button' variant='destructive' size='sm' className='gap-1'>
					<Trash2 className='h-4 w-4' aria-hidden />
					Устгах
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Байршил устгах уу?</AlertDialogTitle>
					<AlertDialogDescription>
						<strong>{venueName}</strong> болон түүний багц, сэтгэгдэл, захиалгын өдрүүд
						бүрмөсөн устгагдана. Энэ үйлдлийг буцаах боломжгүй.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={pending}>Цуцлах</AlertDialogCancel>
					<AlertDialogAction
						onClick={(e) => {
							e.preventDefault()
							handleDelete()
						}}
						disabled={pending}
						className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
					>
						{pending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
						Тийм, устгах
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
