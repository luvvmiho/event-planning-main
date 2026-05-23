'use client';

import {
	addEventPlanServiceAction,
	patchEventPlanServiceAction,
	removeEventPlanServiceAction,
} from '@/app/event-plans/actions';
import { formatMnt } from '@/components/event-plans/event-plan-budget-bar';
import { EventPlanServiceCard } from '@/components/event-plans/event-plan-service-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getServices } from '@/lib/api';
import { SERVICE_KIND_OPTIONS, serviceKindLabelMn } from '@/lib/service-labels';
import type {
	EventPlanDetail,
	EventPlanServiceLine,
	ServiceKind,
	ServiceListItem,
} from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowLeft, ChevronRight, Loader2, Minus, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type EventPlanServicesStepProps = {
	plan: EventPlanDetail;
	busy: boolean;
	setBusy: (busy: boolean) => void;
	onUpdated: () => void;
};

const resolveLineKind = (line: EventPlanServiceLine, catalog?: ServiceListItem): ServiceKind =>
	(line.kind as ServiceKind) || catalog?.kind || 'other';

const resolveLineName = (line: EventPlanServiceLine, catalog?: ServiceListItem) =>
	line.service_name?.trim() || line.name?.trim() || catalog?.name?.trim() || 'Үйлчилгээ';

const resolveLineImage = (line: EventPlanServiceLine, catalog?: ServiceListItem) =>
	line.image_url?.trim() ||
	line.images?.[0]?.trim() ||
	catalog?.image_url?.trim() ||
	catalog?.images?.[0]?.trim() ||
	'/placeholder.svg';

const ServiceLineRow = ({
	line,
	catalog,
	busy,
	onQtyChange,
	onRemove,
	compact = false,
}: {
	line: EventPlanServiceLine;
	catalog?: ServiceListItem;
	busy: boolean;
	onQtyChange: (lineId: string, quantity: number) => void;
	onRemove: (lineId: string) => void;
	compact?: boolean;
}) => {
	const unitPrice =
		line.quantity > 0 ? Math.round(line.estimated_price / line.quantity) : line.estimated_price;
	const kind = resolveLineKind(line, catalog);
	const categoryLabel = serviceKindLabelMn(kind);
	const displayName = resolveLineName(line, catalog);
	const imageUrl = resolveLineImage(line, catalog);
	const description = line.short_description?.trim() || catalog?.short_description?.trim() || null;

	return (
		<div className={cn('rounded-xl border border-border bg-card', compact ? 'p-3' : 'p-4')}>
			<div className='flex gap-3 sm:gap-4'>
				<div className='relative size-16 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted sm:size-20'>
					<img src={imageUrl} alt={displayName} className='size-full object-cover' />
				</div>

				<div className='flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
					<div className='min-w-0 flex-1'>
						<p className='text-[11px] font-medium tracking-wide text-accent uppercase'>
							Төрөл · {categoryLabel}
						</p>
						<p className='mt-1 line-clamp-2 text-base font-semibold text-foreground'>
							{displayName}
						</p>
						{line.provider_label ? (
							<p className='mt-0.5 truncate text-xs text-muted-foreground'>
								{line.provider_label}
							</p>
						) : null}
						{description ? (
							<p className='mt-0.5 line-clamp-1 text-xs text-muted-foreground'>
								{description}
							</p>
						) : null}
						<p className='mt-1 text-xs text-muted-foreground tabular-nums'>
							{formatMnt(unitPrice)} × {line.quantity} ширхэг
						</p>
					</div>

					<div className='flex shrink-0 items-center justify-between gap-3 sm:justify-end'>
						<p className='text-lg font-bold text-foreground tabular-nums sm:min-w-[7rem] sm:text-right'>
							{formatMnt(line.estimated_price)}
						</p>

						<div className='flex items-center gap-1.5'>
							<div className='flex items-center rounded-lg border border-border bg-secondary/30 p-0.5'>
								<Button
									type='button'
									variant='ghost'
									size='icon'
									className='size-8 shrink-0'
									onClick={() => onQtyChange(line.id, line.quantity - 1)}
									disabled={busy || line.quantity <= 1}
									aria-label='Багасгах'
								>
									<Minus className='size-4' />
								</Button>
								<span className='min-w-[2rem] px-1 text-center text-sm font-semibold tabular-nums'>
									{line.quantity}
								</span>
								<Button
									type='button'
									variant='ghost'
									size='icon'
									className='size-8 shrink-0'
									onClick={() => onQtyChange(line.id, line.quantity + 1)}
									disabled={busy}
									aria-label='Нэмэх'
								>
									<Plus className='size-4' />
								</Button>
							</div>

							<Button
								type='button'
								variant='outline'
								size='icon'
								className='size-8 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive'
								onClick={() => onRemove(line.id)}
								disabled={busy}
								aria-label='Устгах'
							>
								<Trash2 className='size-4' />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export const EventPlanServicesStep = ({
	plan,
	busy,
	setBusy,
	onUpdated,
}: EventPlanServicesStepProps) => {
	const [activeKind, setActiveKind] = useState<ServiceKind | null>(null);
	const [catalog, setCatalog] = useState<ServiceListItem[]>([]);
	const [catalogLoading, setCatalogLoading] = useState(false);
	const [catalogById, setCatalogById] = useState<Map<string, ServiceListItem>>(new Map());

	const mergeCatalogItems = useCallback((items: ServiceListItem[]) => {
		if (items.length === 0) return;
		setCatalogById((prev) => {
			const next = new Map(prev);
			for (const item of items) {
				next.set(item.id, item);
			}
			return next;
		});
	}, []);

	const selectedByKind = useMemo(() => {
		const map = new Map<ServiceKind, EventPlanServiceLine[]>();
		for (const line of plan.services) {
			const existing = map.get(line.kind) ?? [];
			map.set(line.kind, [...existing, line]);
		}
		return map;
	}, [plan.services]);

	useEffect(() => {
		const kinds = [...new Set(plan.services.map((line) => line.kind))];
		if (kinds.length === 0) return;

		let cancelled = false;

		const hydrateSelectedServices = async () => {
			try {
				const results = await Promise.all(
					kinds.map((kind) => getServices({ kind, limit: 50 })),
				);
				if (cancelled) return;
				mergeCatalogItems(results.flatMap((result) => result.data));
			} catch {}
		};

		hydrateSelectedServices();
		return () => {
			cancelled = true;
		};
	}, [plan.services, mergeCatalogItems]);

	useEffect(() => {
		if (!activeKind) {
			setCatalog([]);
			return;
		}

		let cancelled = false;

		const loadCatalog = async () => {
			setCatalogLoading(true);
			try {
				const { data } = await getServices({ kind: activeKind, limit: 12 });
				if (!cancelled) {
					setCatalog(data);
					mergeCatalogItems(data);
				}
			} catch {
				if (!cancelled) setCatalog([]);
			} finally {
				if (!cancelled) setCatalogLoading(false);
			}
		};

		loadCatalog();
		return () => {
			cancelled = true;
		};
	}, [activeKind, mergeCatalogItems]);

	const handleAddService = async (service: ServiceListItem) => {
		mergeCatalogItems([service]);
		setBusy(true);
		const result = await addEventPlanServiceAction(plan.id, {
			provider_service_id: service.id,
			quantity: 1,
		});
		setBusy(false);
		if (!result.ok) {
			toast.error(result.error);
			return;
		}
		toast.success('Нэмэгдлээ');
		onUpdated();
	};

	const handleServiceQty = async (lineId: string, quantity: number) => {
		if (quantity < 1) return;
		setBusy(true);
		const result = await patchEventPlanServiceAction(plan.id, lineId, { quantity });
		setBusy(false);
		if (!result.ok) {
			toast.error(result.error);
			return;
		}
		onUpdated();
	};

	const handleRemoveService = async (lineId: string) => {
		setBusy(true);
		const result = await removeEventPlanServiceAction(plan.id, lineId);
		setBusy(false);
		if (!result.ok) {
			toast.error(result.error);
			return;
		}
		toast.success('Хасагдлаа');
		onUpdated();
	};

	const activeKindLabel = activeKind ? serviceKindLabelMn(activeKind) : '';
	const activeSelectedLines = activeKind ? (selectedByKind.get(activeKind) ?? []) : [];

	const getCatalogForLine = (line: EventPlanServiceLine) =>
		catalogById.get(line.provider_service_id);

	return (
		<div className='space-y-6'>
			<div>
				<h3 className='text-lg font-semibold text-foreground'>Нэмэлт үйлчилгээ</h3>
				<p className='mt-1 text-sm text-muted-foreground'>
					{activeKind
						? `${activeKindLabel} төрлийн үйлчилгээ сонгоно.`
						: 'Эхлээд төрөл сонгоод, дараа нь үйлчилгээ нэмнэ.'}
				</p>
			</div>

			{plan.services.length > 0 ? (
				<ul className='mt-4 space-y-3'>
					{plan.services.map((line) => (
						<li key={line.id}>
							<ServiceLineRow
								line={line}
								catalog={getCatalogForLine(line)}
								busy={busy}
								onQtyChange={handleServiceQty}
								onRemove={handleRemoveService}
							/>
						</li>
					))}
				</ul>
			) : null}

			{activeKind ? (
				<div className='space-y-4'>
					<Button
						type='button'
						variant='ghost'
						size='sm'
						className='-ml-2 gap-1.5 text-muted-foreground'
						onClick={() => setActiveKind(null)}
					>
						<ArrowLeft className='size-4' aria-hidden />
						Бүх төрөл
					</Button>

					<div className='flex flex-wrap items-center justify-between gap-2'>
						<h4 className='font-semibold text-foreground'>{activeKindLabel}</h4>
						{activeSelectedLines.length > 0 ? (
							<Badge variant='secondary'>{activeSelectedLines.length} сонгогдсон</Badge>
						) : null}
					</div>

					{activeSelectedLines.length > 0 ? (
						<ul className='space-y-3'>
							{activeSelectedLines.map((line) => (
								<li key={line.id}>
									<ServiceLineRow
										line={line}
										catalog={getCatalogForLine(line)}
										busy={busy}
										onQtyChange={handleServiceQty}
										onRemove={handleRemoveService}
										compact
									/>
								</li>
							))}
						</ul>
					) : null}

					{catalogLoading ? (
						<div className='flex justify-center py-16'>
							<Loader2 className='size-8 animate-spin text-muted-foreground' />
						</div>
					) : catalog.length === 0 ? (
						<p className='rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground'>
							{activeKindLabel} төрлийн идэвхтэй үйлчилгээ одоогоор алга.
						</p>
					) : (
						<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
							{catalog.map((service) => {
								const isAdded = plan.services.some(
									(line) => line.provider_service_id === service.id,
								);
								return (
									<EventPlanServiceCard
										key={service.id}
										service={service}
										isAdded={isAdded}
										busy={busy}
										onAdd={() => handleAddService(service)}
									/>
								);
							})}
						</div>
					)}
				</div>
			) : (
				<div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
					{SERVICE_KIND_OPTIONS.map((opt) => {
						const selectedLines = selectedByKind.get(opt.value) ?? [];
						const hasSelection = selectedLines.length > 0;

						return (
							<button
								key={opt.value}
								type='button'
								onClick={() => setActiveKind(opt.value)}
								className={cn(
									'group flex min-h-[88px] flex-col items-start rounded-xl border bg-card p-4 text-left transition-all',
									'hover:border-accent/40 hover:bg-accent/5 hover:shadow-sm',
									'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
									hasSelection ? 'border-accent/40 bg-accent/5' : 'border-border',
								)}
							>
								<div className='flex w-full items-start justify-between gap-2'>
									<span className='font-semibold text-foreground group-hover:text-accent'>
										{opt.label}
									</span>
									<ChevronRight
										className='size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-accent'
										aria-hidden
									/>
								</div>
								{hasSelection ? (
									<Badge variant='secondary' className='mt-2 text-[10px]'>
										{selectedLines.length} сонгогдсон
									</Badge>
								) : (
									<span className='mt-2 text-xs text-muted-foreground'>Сонгох</span>
								)}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
};
