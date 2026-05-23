'use client';

import { BundleCatalogServicePicker } from '@/components/provider/bundle-catalog-service-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import type {
	CreateVenueFormValues,
	ServiceManageDetail,
	VenueEventPackageFormServiceValues,
	VenueEventPackageFormValues,
} from '@/lib/types';
import { cn } from '@/lib/utils';
import { VENUE_PACKAGE_KIND_OPTIONS } from '@/lib/venue-package-labels';
import { Link2, PencilLine, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Control } from 'react-hook-form';
import { useFieldArray, useWatch } from 'react-hook-form';

const emptyPackage = (): VenueEventPackageFormValues => ({
	name: '',
	price_flat: 0,
	short_description: '',
	guests_min: undefined,
	guests_max: undefined,
	is_active: true,
	services: [],
});

const emptyCustomService = (): VenueEventPackageFormServiceValues => ({
	source: 'custom',
	kind: 'food',
	title: '',
	quantity: 1,
	is_included: true,
});

type UnderlineInputProps = {
	value?: string | number;
	onChange: (v: string) => void;
	onBlur?: () => void;
	name?: string;
	placeholder?: string;
	type?: string;
	disabled?: boolean;
};

const UnderlineInput = ({
	value,
	onChange,
	onBlur,
	name,
	placeholder,
	type = 'text',
	disabled,
}: UnderlineInputProps) => (
	<div className='border-b border-foreground/20 pb-2 transition-colors focus-within:border-foreground'>
		<input
			name={name}
			value={value ?? ''}
			onChange={(e) => onChange(e.target.value)}
			onBlur={onBlur}
			type={type}
			placeholder={placeholder}
			disabled={disabled}
			className='w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 disabled:opacity-50'
		/>
	</div>
);

const formatMnt = (n: number) => new Intl.NumberFormat('mn-MN').format(n) + '₮';

type PackageServicesFieldsProps = {
	control: Control<CreateVenueFormValues>;
	packageIndex: number;
	disabled?: boolean;
	providerServices: ServiceManageDetail[];
};

const PackageServicesFields = ({
	control,
	packageIndex,
	disabled,
	providerServices,
}: PackageServicesFieldsProps) => {
	const [pickerOpen, setPickerOpen] = useState(false);
	const { fields, append, remove } = useFieldArray({
		control,
		name: `event_packages.${packageIndex}.services`,
	});

	const watchedServices =
		useWatch({
			control,
			name: `event_packages.${packageIndex}.services`,
		}) ?? [];

	const catalogIds = watchedServices
		.filter((s): s is Extract<VenueEventPackageFormServiceValues, { source: 'catalog' }> =>
			Boolean(s && s.source === 'catalog' && s.provider_service_id),
		)
		.map((s) => s.provider_service_id);

	const handleSelectCatalog = (service: ServiceManageDetail) => {
		append({
			source: 'catalog',
			provider_service_id: service.id,
			catalogName: service.name,
			catalogPriceFlat: service.price_flat,
			quantity: 1,
			is_included: true,
		});
	};

	return (
		<div className='space-y-3'>
			<div className='flex flex-wrap items-center justify-between gap-2'>
				<div>
					<p className='text-sm font-medium text-foreground/80'>Багцад багтсан зүйлс</p>
					<p className='text-xs text-muted-foreground'>
						Каталог эсвэл гараар — холбосон үйлчилгээний үнэ зөвхөн лавлагаа.
					</p>
				</div>
				<div className='flex flex-wrap gap-2'>
					<Button
						type='button'
						variant='outline'
						size='sm'
						disabled={disabled || providerServices.length === 0}
						onClick={() => setPickerOpen(true)}
						className='h-8 gap-1 text-xs'
					>
						<Link2 className='h-3.5 w-3.5' aria-hidden />
						Миний үйлчилгээнээс
					</Button>
					<Button
						type='button'
						variant='outline'
						size='sm'
						disabled={disabled}
						onClick={() => append(emptyCustomService())}
						className='h-8 gap-1 text-xs'
					>
						<PencilLine className='h-3.5 w-3.5' aria-hidden />
						Гараар нэмэх
					</Button>
				</div>
			</div>

			{providerServices.length === 0 ? (
				<p className='text-xs text-muted-foreground'>
					Каталог сонгохын тулд эхлээд{' '}
					<Link
						href='/provider/services/new'
						className='text-accent underline underline-offset-2'
					>
						үйлчилгээ үүсгэнэ
					</Link>{' '}
					үү.
				</p>
			) : null}

			{fields.length === 0 ? (
				<p className='text-xs text-muted-foreground'>Заавал биш — хоосон багц ч болно.</p>
			) : (
				<ul className='space-y-3'>
					{fields.map((field, serviceIndex) => {
						const line = watchedServices[serviceIndex];
						const isCatalog = line?.source === 'catalog';

						return (
							<li
								key={field.id}
								className={cn(
									'rounded-lg border p-3',
									isCatalog
										? 'border-accent/25 bg-accent/5'
										: 'border-foreground/10 bg-secondary/20',
								)}
							>
								<div className='mb-3 flex items-center justify-between gap-2'>
									<div className='flex flex-wrap items-center gap-2'>
										<span className='text-xs font-medium text-muted-foreground'>
											#{serviceIndex + 1}
										</span>
										{isCatalog ? (
											<Badge
												variant='outline'
												className='border-accent/40 text-[10px] text-accent'
											>
												Каталог
											</Badge>
										) : (
											<Badge variant='secondary' className='text-[10px]'>
												Гараар
											</Badge>
										)}
										{isCatalog && line?.catalogName ? (
											<span className='text-sm font-medium text-foreground'>
												{line.catalogName}
											</span>
										) : null}
									</div>
									<Button
										type='button'
										variant='ghost'
										size='sm'
										disabled={disabled}
										onClick={() => remove(serviceIndex)}
										className='h-8 px-2 text-destructive hover:text-destructive'
										aria-label='Мөр устгах'
									>
										<Trash2 className='h-4 w-4' />
									</Button>
								</div>

								{isCatalog && line?.catalogPriceFlat != null ? (
									<p className='mb-3 text-xs text-muted-foreground'>
										Каталогын үнэ:{' '}
										<span className='font-medium text-foreground tabular-nums'>
											{formatMnt(line.catalogPriceFlat)}
										</span>
									</p>
								) : null}

								<div className='grid gap-3 sm:grid-cols-2'>
									{!isCatalog ? (
										<>
											<FormField
												control={control}
												name={`event_packages.${packageIndex}.services.${serviceIndex}.kind`}
												render={({ field: kindField }) => (
													<FormItem>
														<FormLabel className='text-xs text-foreground/80'>
															Төрөл
														</FormLabel>
														<Select
															value={kindField.value}
															onValueChange={kindField.onChange}
															disabled={disabled}
														>
															<FormControl>
																<SelectTrigger className='h-9 rounded-none border-0 border-b border-foreground/20 bg-transparent px-0 shadow-none'>
																	<SelectValue />
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																{VENUE_PACKAGE_KIND_OPTIONS.map((opt) => (
																	<SelectItem key={opt.value} value={opt.value}>
																		{opt.label}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={control}
												name={`event_packages.${packageIndex}.services.${serviceIndex}.title`}
												render={({ field: titleField }) => (
													<FormItem>
														<FormLabel className='text-xs text-foreground/80'>
															Нэр *
														</FormLabel>
														<FormControl>
															<UnderlineInput
																value={titleField.value}
																onChange={titleField.onChange}
																onBlur={titleField.onBlur}
																name={titleField.name}
																placeholder='Буфет хоол'
																disabled={disabled}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</>
									) : null}

									<FormField
										control={control}
										name={`event_packages.${packageIndex}.services.${serviceIndex}.description`}
										render={({ field: descField }) => (
											<FormItem className={isCatalog ? 'sm:col-span-2' : undefined}>
												<FormLabel className='text-xs text-foreground/80'>
													Нэмэлт тайлбар
												</FormLabel>
												<FormControl>
													<UnderlineInput
														value={descField.value ?? ''}
														onChange={descField.onChange}
														onBlur={descField.onBlur}
														name={descField.name}
														placeholder='Заавал биш'
														disabled={disabled}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={control}
										name={`event_packages.${packageIndex}.services.${serviceIndex}.quantity`}
										render={({ field: qtyField }) => (
											<FormItem>
												<FormLabel className='text-xs text-foreground/80'>
													Тоо
												</FormLabel>
												<FormControl>
													<UnderlineInput
														value={qtyField.value}
														onChange={qtyField.onChange}
														onBlur={qtyField.onBlur}
														name={qtyField.name}
														type='number'
														placeholder='1'
														disabled={disabled}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={control}
										name={`event_packages.${packageIndex}.services.${serviceIndex}.is_included`}
										render={({ field: incField }) => (
											<FormItem className='flex items-end gap-2 pb-2'>
												<FormControl>
													<Checkbox
														checked={incField.value}
														onCheckedChange={incField.onChange}
														disabled={disabled}
													/>
												</FormControl>
												<FormLabel className='!mt-0 text-xs font-normal'>
													Багтаж байна
												</FormLabel>
											</FormItem>
										)}
									/>
								</div>
							</li>
						);
					})}
				</ul>
			)}

			<BundleCatalogServicePicker
				open={pickerOpen}
				onOpenChange={setPickerOpen}
				services={providerServices}
				excludeIds={catalogIds}
				onSelect={handleSelectCatalog}
			/>
		</div>
	);
};

type PackageEditorPanelProps = {
	control: Control<CreateVenueFormValues>;
	packageIndex: number;
	disabled?: boolean;
	providerServices: ServiceManageDetail[];
	onRemove: () => void;
};

const PackageEditorPanel = ({
	control,
	packageIndex,
	disabled,
	providerServices,
	onRemove,
}: PackageEditorPanelProps) => (
	<div className='rounded-xl border border-foreground/15 bg-card p-5 shadow-sm'>
		<div className='mb-4 flex items-center justify-between gap-2'>
			<p className='text-sm font-semibold text-foreground'>Багц #{packageIndex + 1}</p>
			<Button
				type='button'
				variant='ghost'
				size='sm'
				disabled={disabled}
				onClick={onRemove}
				className='text-destructive hover:text-destructive'
			>
				<Trash2 className='mr-1 h-4 w-4' aria-hidden />
				Устгах
			</Button>
		</div>

		<div className='grid gap-5 lg:grid-cols-2'>
			<FormField
				control={control}
				name={`event_packages.${packageIndex}.name`}
				render={({ field: nameField }) => (
					<FormItem>
						<FormLabel className='text-sm text-foreground/80'>Багцын нэр *</FormLabel>
						<FormControl>
							<UnderlineInput
								value={nameField.value}
								onChange={nameField.onChange}
								onBlur={nameField.onBlur}
								name={nameField.name}
								placeholder='Төрсөн өдрийн стандарт багц'
								disabled={disabled}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={control}
				name={`event_packages.${packageIndex}.price_flat`}
				render={({ field: priceField }) => (
					<FormItem>
						<FormLabel className='text-sm text-foreground/80'>
							Багцын нийт үнэ (₮) *
						</FormLabel>
						<FormControl>
							<UnderlineInput
								value={priceField.value}
								onChange={priceField.onChange}
								onBlur={priceField.onBlur}
								name={priceField.name}
								type='number'
								placeholder='1850000'
								disabled={disabled}
							/>
						</FormControl>
						<FormDescription className='text-xs'>
							Нэг захиалгын мөрний нийт дүн (каталогын үнэ автоматаар нэмэгдэхгүй)
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={control}
				name={`event_packages.${packageIndex}.short_description`}
				render={({ field: descField }) => (
					<FormItem>
						<FormLabel className='text-sm text-foreground/80'>Богино тайлбар</FormLabel>
						<FormControl>
							<UnderlineInput
								value={descField.value ?? ''}
								onChange={descField.onChange}
								onBlur={descField.onBlur}
								name={descField.name}
								placeholder='40–80 зочин'
								disabled={disabled}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={control}
				name={`event_packages.${packageIndex}.guests_min`}
				render={({ field: minField }) => (
					<FormItem>
						<FormLabel className='text-sm text-foreground/80'>Зочид (min)</FormLabel>
						<FormControl>
							<UnderlineInput
								value={minField.value ?? ''}
								onChange={minField.onChange}
								onBlur={minField.onBlur}
								name={minField.name}
								type='number'
								placeholder='40'
								disabled={disabled}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={control}
				name={`event_packages.${packageIndex}.guests_max`}
				render={({ field: maxField }) => (
					<FormItem>
						<FormLabel className='text-sm text-foreground/80'>Зочид (max)</FormLabel>
						<FormControl>
							<UnderlineInput
								value={maxField.value ?? ''}
								onChange={maxField.onChange}
								onBlur={maxField.onBlur}
								name={maxField.name}
								type='number'
								placeholder='80'
								disabled={disabled}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={control}
				name={`event_packages.${packageIndex}.is_active`}
				render={({ field: activeField }) => (
					<FormItem className='flex items-center gap-2 lg:col-span-2'>
						<FormControl>
							<Checkbox
								checked={activeField.value}
								onCheckedChange={activeField.onChange}
								disabled={disabled}
							/>
						</FormControl>
						<FormLabel className='!mt-0 text-sm font-normal'>
							Идэвхтэй (үйлчлүүлэгчид харагдана)
						</FormLabel>
					</FormItem>
				)}
			/>
		</div>

		<div className='mt-5 border-t border-foreground/10 pt-5'>
			<PackageServicesFields
				control={control}
				packageIndex={packageIndex}
				disabled={disabled}
				providerServices={providerServices}
			/>
		</div>
	</div>
);

const formatGuestRange = (min?: number | null, max?: number | null) => {
	if (min != null && max != null) return `${min}–${max}`;
	if (min != null) return `${min}+`;
	if (max != null) return `≤${max}`;
	return '—';
};

type VenueEventPackagesFieldProps = {
	control: Control<CreateVenueFormValues>;
	disabled?: boolean;
	isEdit?: boolean;
	providerServices?: ServiceManageDetail[];
};

export const VenueEventPackagesField = ({
	control,
	disabled,
	isEdit = false,
	providerServices = [],
}: VenueEventPackagesFieldProps) => {
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'event_packages',
	});
	const watchedPackages = useWatch({ control, name: 'event_packages' }) ?? [];
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	useEffect(() => {
		if (selectedIndex != null && selectedIndex >= fields.length) {
			setSelectedIndex(fields.length > 0 ? fields.length - 1 : null);
		}
	}, [fields.length, selectedIndex]);

	useEffect(() => {
		if (fields.length > 0 && selectedIndex === null) {
			setSelectedIndex(0);
		}
	}, [fields.length, selectedIndex]);

	const handleAddPackage = () => {
		append(emptyPackage());
		setSelectedIndex(fields.length);
	};

	const handleRemovePackage = (index: number) => {
		remove(index);
		if (selectedIndex === index) {
			setSelectedIndex(fields.length > 1 ? Math.max(0, index - 1) : null);
		} else if (selectedIndex != null && selectedIndex > index) {
			setSelectedIndex(selectedIndex - 1);
		}
	};

	return (
		<div className='flex flex-col gap-6'>
			<div className='flex flex-wrap items-start justify-end gap-4'>
				<Button
					type='button'
					variant='outline'
					disabled={disabled || fields.length >= 30}
					onClick={handleAddPackage}
					className='gap-1 text-xs'
				>
					<Plus className='h-4 w-4' aria-hidden />
					Багц нэмэх
				</Button>
			</div>

			{fields.length === 0 ? (
				<p className='rounded-lg border border-dashed border-foreground/15 px-4 py-8 text-center text-sm text-muted-foreground'>
					{isEdit
						? 'Одоогоор багц байхгүй. «Багц нэмэх» дарж нэмнэ үү.'
						: 'Одоогоор багц нэмээгүй. Хүсвэл «Багц нэмэх» дарж нэмнэ үү.'}
				</p>
			) : (
				<>
					{selectedIndex != null && fields[selectedIndex] ? (
						<PackageEditorPanel
							control={control}
							packageIndex={selectedIndex}
							disabled={disabled}
							providerServices={providerServices}
							onRemove={() => handleRemovePackage(selectedIndex)}
						/>
					) : (
						<p className='rounded-lg border border-dashed border-foreground/15 px-4 py-6 text-center text-sm text-muted-foreground'>
							Засах багцаа жагсаалтаас сонгоно уу.
						</p>
					)}
				</>
			)}
		</div>
	);
};
