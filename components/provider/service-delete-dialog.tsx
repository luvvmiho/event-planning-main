'use client'

import { submitDeleteService } from '@/actions/service.actions'
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

type ServiceDeleteDialogProps = {
	serviceId: string
	serviceName: string
}

export const ServiceDeleteDialog = ({ serviceId, serviceName }: ServiceDeleteDialogProps) => {
	const [open, setOpen] = useState(false)
	const [pending, startTransition] = useTransition()

	const handleDelete = () => {
		startTransition(async () => {
			const result = await submitDeleteService(serviceId)
			if (result?.ok === false) {
				toast.error(result.error)
				return
			}
			setOpen(false)
		})
	}

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>
				<Button variant='destructive' size='sm' className='gap-1'>
					<Trash2 className='h-4 w-4' />
					Устгах
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Үйлчилгээ устгах уу?</AlertDialogTitle>
					<AlertDialogDescription>
						«{serviceName}» бүрмөсөн устгагдана. Энэ үйлдлийг буцаах боломжгүй.
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
						Устгах
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
