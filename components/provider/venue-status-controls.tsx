'use client';

import { submitUpdateVenueStatus } from '@/actions/venue.actions';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import type { VenueStatus } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

const STATUS_LABELS: Record<VenueStatus, string> = {
	draft: 'Ноорог',
	published: 'Нийтэлсэн',
	archived: 'Архивласан',
};

const statusBadgeClass = (status: VenueStatus) => {
	if (status === 'published') return 'bg-emerald-100 text-emerald-800';
	if (status === 'draft') return 'bg-amber-100 text-amber-800';
	return 'bg-muted text-muted-foreground';
};

type VenueStatusControlsProps = {
	venueId: string;
	initialStatus: VenueStatus;
};

export const VenueStatusControls = ({ venueId, initialStatus }: VenueStatusControlsProps) => {
	const router = useRouter();
	const [status, setStatus] = useState<VenueStatus>(initialStatus);
	const [pending, startTransition] = useTransition();

	const handleStatusChange = (next: VenueStatus) => {
		setStatus(next);
		startTransition(async () => {
			const result = await submitUpdateVenueStatus(venueId, next);
			if (!result.ok) {
				setStatus(initialStatus);
				toast.error(result.error);
				return;
			}
			toast.success('Төлөв шинэчлэгдлээ');
			router.refresh();
		});
	};

	return (
		<div className='flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4'>
			<div className='flex items-center gap-2'>
				<span className='text-sm text-muted-foreground'>Төлөв:</span>
			</div>
			<Select
				value={status}
				onValueChange={(v) => handleStatusChange(v as VenueStatus)}
				disabled={pending}
			>
				<SelectTrigger className='h-9 w-[200px]' aria-label='Байршлын төлөв'>
					<SelectValue placeholder='Төлөв сонгох' />
				</SelectTrigger>
				<SelectContent>
					{(Object.keys(STATUS_LABELS) as VenueStatus[]).map((key) => (
						<SelectItem key={key} value={key}>
							{STATUS_LABELS[key]}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{pending ? <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' /> : null}
		</div>
	);
};
