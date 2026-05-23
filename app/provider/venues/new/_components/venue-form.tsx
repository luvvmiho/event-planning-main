'use client';

import { submitCreateVenue, submitUpdateVenue } from '@/actions/venue.actions';
import { VenueEventPackagesField } from '@/components/provider/venue-event-packages-field';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	FileUpload,
	FileUploadDropzone,
	FileUploadItem,
	FileUploadItemDelete,
	FileUploadItemMetadata,
	FileUploadItemPreview,
	FileUploadItemProgress,
	FileUploadList,
	FileUploadTrigger,
	useFileUpload,
} from '@/components/ui/file-upload';
import {
	Form,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { uploadVenueImage } from '@/lib/api';
import type { Category, CreateVenueFormValues, ServiceManageDetail } from '@/lib/types';
import { cn } from '@/lib/utils';
import { createVenueSchema, editVenueFormSchema } from '@/lib/validations/venue';
import { DISTRICT_SLUG_LABELS } from '@/lib/venue-search-params';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const VenueFormMapPicker = dynamic(
	() => import('@/components/venues/venue-form-map-picker').then((m) => m.VenueFormMapPicker),
	{
		ssr: false,
		loading: () => (
			<div
				className='h-[280px] animate-pulse rounded-lg border border-foreground/15 bg-muted'
				aria-hidden
			/>
		),
	},
);

const UnderlineInput = ({
	field,
	placeholder,
	type = 'text',
	disabled,
}: {
	field: React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement> };
	placeholder?: string;
	type?: string;
	disabled?: boolean;
}) => (
	<div className='border-b border-foreground/20 pb-2 transition-colors focus-within:border-foreground'>
		<input
			{...field}
			type={type}
			placeholder={placeholder}
			disabled={disabled}
			className='w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 disabled:opacity-50'
		/>
	</div>
);

type Props = {
	categories: Category[];
	accessToken: string;
	mode?: 'create' | 'edit';
	venueId?: string;
	categoryLabel?: string;
	initialValues?: Partial<CreateVenueFormValues>;
	initialPackageIds?: string[];
	providerServices?: ServiceManageDetail[];
};

type VenueSavedImageProps = {
	url: string;
	onRemove: () => void;
	disabled?: boolean;
	label: string;
	className?: string;
};

function VenueSavedImage({ url, onRemove, disabled, label, className }: VenueSavedImageProps) {
	return (
		<div className={cn('group relative overflow-hidden rounded-lg border border-foreground/10 bg-muted', className)}>
			<img src={url} alt='' className='size-full object-cover' />
			<button
				type='button'
				onClick={onRemove}
				disabled={disabled}
				className='absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-black/65 text-white opacity-100 transition-opacity hover:bg-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50'
				aria-label={`${label} устгах`}
			>
				<X className='size-3.5' aria-hidden />
			</button>
		</div>
	);
}

type VenueImageFileListProps = {
	listClassName?: string;
};

function VenueImageFileList({ listClassName }: VenueImageFileListProps = {}) {
	const files = useFileUpload((state) => Array.from(state.files.keys()));

	return (
		<FileUploadList
			className={cn(
				'mt-2 max-h-[min(44vh,380px)] flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain',
				listClassName,
			)}
		>
			{files.map((file) => (
				<FileUploadItem
					key={`${file.name}-${file.size}-${file.lastModified}`}
					value={file}
					className='max-w-full min-w-0 overflow-hidden rounded-lg border border-foreground/10 p-2 sm:flex-row'
				>
					<FileUploadItemPreview className='size-14 shrink-0 rounded-md border border-border' />
					<div className='flex max-w-full min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
						<FileUploadItemMetadata className='max-w-full min-w-0 text-xs [&_span.text-destructive]:wrap-break-word' />
						<div className='flex w-full min-w-0 shrink-0 items-center gap-2 sm:w-auto'>
							<FileUploadItemProgress className='min-w-0 flex-1 sm:w-24' />
							<FileUploadItemDelete className='shrink-0 text-muted-foreground hover:text-destructive' />
						</div>
					</div>
				</FileUploadItem>
			))}
		</FileUploadList>
	);
}

export const VenueForm = ({
	categories,
	accessToken,
	mode = 'create',
	venueId,
	categoryLabel,
	initialValues,
	initialPackageIds = [],
	providerServices = [],
}: Props) => {
	const router = useRouter();
	const [isPending, startTransition] = React.useTransition();
	const [imageUploadBusy, setImageUploadBusy] = React.useState(false);
	const [galleryUploadBusy, setGalleryUploadBusy] = React.useState(false);
	const [primaryUploadError, setPrimaryUploadError] = React.useState<string | null>(null);
	const [galleryUploadError, setGalleryUploadError] = React.useState<string | null>(null);
	const [primaryPendingFiles, setPrimaryPendingFiles] = React.useState<File[]>([]);
	const [galleryPendingFiles, setGalleryPendingFiles] = React.useState<File[]>([]);
	const [activeTab, setActiveTab] = React.useState('details');
	const galleryFileToUrlRef = React.useRef<Map<File, string>>(new Map());
	const initialPackageIdsRef = React.useRef(initialPackageIds);

	const form = useForm<CreateVenueFormValues>({
		resolver: zodResolver(mode === 'edit' ? editVenueFormSchema : createVenueSchema),
		defaultValues: {
			name: '',
			short_description: '',
			description: '',
			category_id: '',
			location: '',
			district: '',
			address: '',
			capacity_min: 10,
			capacity_max: 100,
			price_per_person: 0,
			contact_phone: '',
			contact_email: '',
			website: '',
			amenities: '',
			image_url: '',
			images: [],
			event_packages: [],
			...initialValues,
		},
	});

	const mapLat = form.watch('lat');
	const mapLong = form.watch('long');
	const eventPackages = form.watch('event_packages') ?? [];
	const packageCount = eventPackages.length;
	const hasPackageErrors = Boolean(form.formState.errors.event_packages);

	const onSubmit = (values: CreateVenueFormValues) => {
		startTransition(async () => {
			if (mode === 'edit' && venueId) {
				const currentIds = new Set(
					(values.event_packages ?? [])
						.map((pkg) => pkg.id)
						.filter((id): id is string => Boolean(id)),
				);
				const removedCount = initialPackageIdsRef.current.filter((id) => !currentIds.has(id)).length;
				if (removedCount > 0) {
					const confirmed = window.confirm(
						`${removedCount} багц хадгалахад серверээс бүрмөсөн устгагдана. Үргэлжлүүлэх үү?`,
					);
					if (!confirmed) return;
				}

				const result = await submitUpdateVenue(venueId, values);
				if (result?.error) {
					form.setError('root', { message: result.error });
					return;
				}
				initialPackageIdsRef.current = [...currentIds];
				router.refresh();
				toast.success('Байршил хадгалагдлаа');
				return;
			}

			const result = await submitCreateVenue(values);
			if (result?.error) {
				form.setError('root', { message: result.error });
			}
		});
	};

	const onInvalid = () => {
		if (form.formState.errors.event_packages) {
			setActiveTab('packages');
		}
	};

	const isEdit = mode === 'edit';

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit, onInvalid)} noValidate>
				{form.formState.errors.root && (
					<div className='mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
						{form.formState.errors.root.message}
					</div>
				)}

				<Tabs value={activeTab} onValueChange={setActiveTab} className='flex flex-col gap-6'>
					<TabsList className='h-auto w-full flex-wrap justify-start gap-1 bg-muted/60 p-1'>
						<TabsTrigger value='details' className='gap-2 px-4'>
							Мэдээлэл
						</TabsTrigger>
						<TabsTrigger value='packages' className='gap-2 px-4'>
							Багцууд
							{packageCount > 0 ? (
								<Badge variant='secondary' className='h-5 min-w-5 px-1.5 text-[10px]'>
									{packageCount}
								</Badge>
							) : null}
							{hasPackageErrors ? (
								<span className='size-2 rounded-full bg-destructive' aria-label='Алдаатай' />
							) : null}
						</TabsTrigger>
					</TabsList>

					<TabsContent value='details' className='mt-0'>
				<div className='grid min-w-0 gap-8 lg:grid-cols-2'>
					<div className='min-w-0 space-y-6'>
						<section>
							<h2 className='mb-4 text-xs font-semibold tracking-widest text-muted-foreground uppercase'>
								Үндсэн мэдээлэл
							</h2>
							<div className='space-y-5'>
								<FormField
									control={form.control}
									name='name'
									render={({ field }) => (
										<FormItem>
											<FormLabel className='text-sm text-foreground/80'>
												Байршлын нэр *
											</FormLabel>
											<FormControl>
												<UnderlineInput
													field={field}
													placeholder='Байршлын нэрийг оруулна уу'
													disabled={isPending}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name='category_id'
									render={({ field }) => (
										<FormItem>
											<FormLabel className='text-sm text-foreground/80'>
												Ангилал *
											</FormLabel>
											{isEdit ? (
												<p className='border-b border-foreground/20 pb-2 text-sm text-foreground'>
													{categoryLabel ?? '—'}
												</p>
											) : (
												<Select
													value={field.value}
													onValueChange={field.onChange}
													disabled={isPending}
												>
													<FormControl>
														<SelectTrigger className='rounded-none border-0 border-b border-foreground/20 bg-transparent px-0 shadow-none focus:ring-0'>
															<SelectValue placeholder='Ангилал сонгоно уу' />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{categories.map((cat) => (
															<SelectItem key={cat.id} value={cat.id}>
																{cat.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											)}
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name='short_description'
									render={({ field }) => (
										<FormItem>
											<FormLabel className='text-sm text-foreground/80'>
												Богино тайлбар
											</FormLabel>
											<FormControl>
												<UnderlineInput
													field={field}
													placeholder='1–2 өгүүлбэрт байршлаа тайлбарлана уу'
													disabled={isPending}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name='description'
									render={({ field }) => (
										<FormItem>
											<FormLabel className='text-sm text-foreground/80'>
												Дэлгэрэнгүй тайлбар
											</FormLabel>
											<FormControl>
												<Textarea
													{...field}
													placeholder='Байршлын дэлгэрэнгүй мэдээлэл...'
													disabled={isPending}
													rows={4}
													className='resize-none rounded-none border-0 border-b border-foreground/20 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0'
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name='image_url'
									render={({ field }) => (
										<FormItem>
											<FormLabel className='text-sm text-foreground/80'>
												Үндсэн зураг
											</FormLabel>
											<FormControl>
												<div className='space-y-3'>
													{field.value ? (
														<VenueSavedImage
															url={field.value}
															label='Үндсэн зураг'
															disabled={isPending || imageUploadBusy || galleryUploadBusy}
															onRemove={() => {
																field.onChange('');
																setPrimaryPendingFiles([]);
																setPrimaryUploadError(null);
															}}
															className='aspect-video max-w-xs'
														/>
													) : null}
													<FileUpload
														value={primaryPendingFiles}
														accept='image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif'
														maxFiles={1}
														maxSize={5 * 1024 * 1024}
														disabled={isPending || imageUploadBusy || galleryUploadBusy}
														onValueChange={(files) => {
															setPrimaryPendingFiles(files);
															if (files.length === 0) {
																setPrimaryUploadError(null);
																return;
															}
															setPrimaryUploadError(null);
														}}
														onFileReject={(_file, message) => {
															const mapped =
																message === 'File too large'
																	? 'Файл хэт том байна (хамгийн ихдээ 5MB)'
																	: message === 'File type not accepted'
																		? 'Зөвшөөрөгдөөгүй файлын төрөл'
																		: message;
															setPrimaryUploadError(mapped);
														}}
														onUpload={async (
															files,
															{ onProgress, onSuccess, onError },
														) => {
															setImageUploadBusy(true);
															setPrimaryUploadError(null);
															try {
																for (const file of files) {
																	try {
																		const { url } = await uploadVenueImage(
																			file,
																			accessToken,
																			(pct) => onProgress(file, pct),
																		);
																		field.onChange(url);
																		onSuccess(file);
																		setPrimaryPendingFiles([]);
																	} catch (err) {
																		const msg =
																			err instanceof Error
																				? err.message
																				: 'Ачаалахад алдаа гарлаа';
																		setPrimaryUploadError(msg);
																		onError(
																			file,
																			err instanceof Error ? err : new Error(msg),
																		);
																	}
																}
															} finally {
																setImageUploadBusy(false);
															}
														}}
														className='w-full max-w-full min-w-0'
													>
														<FileUploadDropzone className='min-h-[132px] rounded-none border-dashed border-foreground/20 bg-transparent hover:bg-foreground/3'>
															<p className='text-xs text-muted-foreground'>
																{field.value
																	? 'Шинэ зураг солихын тулд энд чирж тавина уу'
																	: 'Зургийг энд чирж тавина уу'}
															</p>
															<FileUploadTrigger className='text-xs font-medium text-foreground underline underline-offset-2'>
																эсвэл сонгох
															</FileUploadTrigger>
															<p className='text-[11px] text-muted-foreground/80'>
																JPEG, PNG, WebP, GIF · хамгийн ихдээ 5MB
															</p>
														</FileUploadDropzone>
														{primaryUploadError ? (
															<p
																className='mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive'
																role='alert'
															>
																{primaryUploadError}
															</p>
														) : null}
														{imageUploadBusy ? <VenueImageFileList /> : null}
													</FileUpload>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name='images'
									render={({ field }) => {
										const savedImages = field.value ?? [];
										const galleryAtLimit = savedImages.length >= 12;
										const remainingSlots = Math.max(0, 12 - savedImages.length);

										const handleRemoveSavedImage = (url: string) => {
											field.onChange(savedImages.filter((item) => item !== url));
											for (const [file, fileUrl] of galleryFileToUrlRef.current.entries()) {
												if (fileUrl === url) galleryFileToUrlRef.current.delete(file);
											}
										};

										return (
											<FormItem>
												<FormLabel className='text-sm text-foreground/80'>
													Нэмэлт зургууд
												</FormLabel>
												<FormControl>
													<div className='space-y-3'>
														{savedImages.length > 0 ? (
															<div className='grid grid-cols-3 gap-2 sm:grid-cols-4'>
																{savedImages.map((url) => (
																	<VenueSavedImage
																		key={url}
																		url={url}
																		label='Нэмэлт зураг'
																		disabled={
																			isPending || imageUploadBusy || galleryUploadBusy
																		}
																		onRemove={() => handleRemoveSavedImage(url)}
																		className='aspect-square'
																	/>
																))}
															</div>
														) : null}
														<FileUpload
															value={galleryPendingFiles}
															accept='image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif'
															maxFiles={remainingSlots || 1}
															maxSize={5 * 1024 * 1024}
															multiple
															disabled={
																isPending ||
																imageUploadBusy ||
																galleryUploadBusy ||
																galleryAtLimit
															}
															onValueChange={(files) => {
																setGalleryPendingFiles(files);
																const next = new Set(files);
																for (const f of [...galleryFileToUrlRef.current.keys()]) {
																	if (!next.has(f)) galleryFileToUrlRef.current.delete(f);
																}
																if (files.length === 0) {
																	setGalleryUploadError(null);
																	return;
																}
																setGalleryUploadError(null);
															}}
															onFileReject={(_file, message) => {
																const mapped = message.startsWith('Maximum')
																	? 'Хамгийн ихдээ 12 зураг ачаална'
																	: message === 'File too large'
																		? 'Файл хэт том байна (хамгийн ихдээ 5MB)'
																		: message === 'File type not accepted'
																			? 'Зөвшөөрөгдөөгүй файлын төрөл'
																			: message;
																setGalleryUploadError(mapped);
															}}
															onUpload={async (
																files,
																{ onProgress, onSuccess, onError },
															) => {
																setGalleryUploadBusy(true);
																setGalleryUploadError(null);
																try {
																	for (const file of files) {
																		const current = form.getValues('images') ?? [];
																		if (current.length >= 12) {
																			setGalleryUploadError('Хамгийн ихдээ 12 зураг ачаална');
																			onError(file, new Error('Gallery full'));
																			continue;
																		}
																		try {
																			const { url } = await uploadVenueImage(
																				file,
																				accessToken,
																				(pct) => onProgress(file, pct),
																			);
																			galleryFileToUrlRef.current.set(file, url);
																			const latest = form.getValues('images') ?? [];
																			if (!latest.includes(url)) {
																				field.onChange([...latest, url]);
																			}
																			onSuccess(file);
																			setGalleryPendingFiles((prev) =>
																				prev.filter((item) => item !== file),
																			);
																		} catch (err) {
																			const msg =
																				err instanceof Error
																					? err.message
																					: 'Ачаалахад алдаа гарлаа';
																			setGalleryUploadError(msg);
																			onError(
																				file,
																				err instanceof Error ? err : new Error(msg),
																			);
																		}
																	}
																} finally {
																	setGalleryUploadBusy(false);
																}
															}}
															className='w-full max-w-full min-w-0'
														>
															<FileUploadDropzone className='min-h-[132px] rounded-none border-dashed border-foreground/20 bg-transparent hover:bg-foreground/3'>
																<p className='text-xs text-muted-foreground'>
																	{galleryAtLimit
																		? 'Хамгийн ихдээ 12 зураг байна'
																		: 'Олон зураг нэгэн зэрэг эсвэл дараалан ачаална уу'}
																</p>
																{!galleryAtLimit ? (
																	<FileUploadTrigger className='text-xs font-medium text-foreground underline underline-offset-2'>
																		эсвэл сонгох
																	</FileUploadTrigger>
																) : null}
																<p className='text-[11px] text-muted-foreground/80'>
																	JPEG, PNG, WebP, GIF · файл бүр хамгийн ихдээ 5MB ·
																	хамгийн ихдээ 12 зураг
																	{savedImages.length > 0
																		? ` · ${savedImages.length}/12`
																		: ''}
																</p>
															</FileUploadDropzone>
															{galleryUploadError ? (
																<p
																	className='mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive'
																	role='alert'
																>
																	{galleryUploadError}
																</p>
															) : null}
															{galleryUploadBusy ? (
																<VenueImageFileList listClassName='max-h-[min(52vh,480px)]' />
															) : null}
														</FileUpload>
													</div>
												</FormControl>
												<FormDescription className='text-xs text-muted-foreground'>
													Энд ачаалсан зургууд байршлын цомогт харагдана. Зөвхөн олон
													зураг ачаалбал эхнийх нь үндсэн зураг болно.
												</FormDescription>
												<FormMessage />
											</FormItem>
										);
									}}
								/>
							</div>
						</section>

						<section>
							<h2 className='mb-4 text-xs font-semibold tracking-widest text-muted-foreground uppercase'>
								Нэмэлт мэдээлэл
							</h2>
							<div className='space-y-5'>
								<FormField
									control={form.control}
									name='amenities'
									render={({ field }) => (
										<FormItem>
											<FormLabel className='text-sm text-foreground/80'>
												Тохиромж (таслалаар тусгаарлана)
											</FormLabel>
											<FormControl>
												<UnderlineInput
													field={field}
													placeholder='Зогсоол, Wifi, Чийдэн, Дэлгэц...'
													disabled={isPending}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</section>
					</div>

					<div className='min-w-0 space-y-6'>
						<section>
							<h2 className='mb-4 text-xs font-semibold tracking-widest text-muted-foreground uppercase'>
								Байршил
							</h2>
							<div className='space-y-5'>
								<FormField
									control={form.control}
									name='location'
									render={({ field }) => (
										<FormItem>
											<FormLabel className='text-sm text-foreground/80'>
												Байршил *
											</FormLabel>
											<FormControl>
												<UnderlineInput
													field={field}
													placeholder='Хан-Уул дүүрэг, Улаанбаатар'
													disabled={isPending}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name='district'
									render={({ field }) => (
										<FormItem>
											<FormLabel className='text-sm text-foreground/80'>
												Дүүрэг (Улаанбаатар)
											</FormLabel>
											<Select
												value={field.value ? field.value : undefined}
												onValueChange={field.onChange}
												disabled={isPending}
											>
												<FormControl>
													<SelectTrigger className='rounded-none border-0 border-b border-foreground/20 bg-transparent px-0 shadow-none focus:ring-0'>
														<SelectValue placeholder='Дүүрэг сонгоно уу' />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{Object.entries(DISTRICT_SLUG_LABELS).map(
														([slug, label]) => (
															<SelectItem key={slug} value={slug}>
																{label}
															</SelectItem>
														),
													)}
												</SelectContent>
											</Select>
											<FormDescription className='text-xs text-muted-foreground'>
												Сүхбаатар, Чингэлтэй, Баянзүрх гэх мэт — түгээмэл дүүргүүд
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name='lat'
									render={() => (
										<FormItem>
											<FormLabel className='text-sm text-foreground/80'>
												Байршлын цэг (газрын зураг) *
											</FormLabel>
											<FormControl>
												<VenueFormMapPicker
													latitude={mapLat ?? null}
													longitude={mapLong ?? null}
													disabled={isPending}
													onChange={(la, lo) => {
														form.setValue('lat', la, {
															shouldValidate: true,
															shouldDirty: true,
														});
														form.setValue('long', lo, {
															shouldValidate: true,
															shouldDirty: true,
														});
													}}
													onClear={() => {
														form.setValue('lat', undefined, { shouldValidate: true });
														form.setValue('long', undefined, {
															shouldValidate: true,
														});
													}}
												/>
											</FormControl>
											<FormDescription className='text-xs text-muted-foreground'>
												Зургийг томруулах, сонирхолтой газар дээр дарна уу (Өргөрөг,
												уртраг автоматаар орно)
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name='address'
									render={({ field }) => (
										<FormItem>
											<FormLabel className='text-sm text-foreground/80'>
												Дэлгэрэнгүй хаяг
											</FormLabel>
											<FormControl>
												<UnderlineInput
													field={field}
													placeholder='Гудамж, байр, тоот'
													disabled={isPending}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</section>

						<section>
							<h2 className='mb-4 text-xs font-semibold tracking-widest text-muted-foreground uppercase'>
								Хүчин чадал ба үнэ
							</h2>
							<div className='grid grid-cols-2 gap-4'>
								<FormField
									control={form.control}
									name='capacity_min'
									render={({ field }) => (
										<FormItem>
											<FormLabel className='text-sm text-foreground/80'>
												Хамгийн бага хүн *
											</FormLabel>
											<FormControl>
												<UnderlineInput
													field={field}
													type='number'
													placeholder='10'
													disabled={isPending}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name='capacity_max'
									render={({ field }) => (
										<FormItem>
											<FormLabel className='text-sm text-foreground/80'>
												Хамгийн их хүн *
											</FormLabel>
											<FormControl>
												<UnderlineInput
													field={field}
													type='number'
													placeholder='200'
													disabled={isPending}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name='price_per_person'
									render={({ field }) => (
										<FormItem className='col-span-2'>
											<FormLabel className='text-sm text-foreground/80'>
												Үнэ / хүн (₮) *
											</FormLabel>
											<FormControl>
												<UnderlineInput
													field={field}
													type='number'
													placeholder='50000'
													disabled={isPending}
												/>
											</FormControl>
											<FormDescription className='text-xs text-muted-foreground'>
												Багцгүй захиалгад хэрэглэгдэнэ. Багцын үнэ тусад нь тооцогдоно.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</section>

						<section>
							<h2 className='mb-4 text-xs font-semibold tracking-widest text-muted-foreground uppercase'>
								Холбоо барих
							</h2>
							<div className='space-y-5'>
								<FormField
									control={form.control}
									name='contact_phone'
									render={({ field }) => (
										<FormItem>
											<FormLabel className='text-sm text-foreground/80'>Утас</FormLabel>
											<FormControl>
												<UnderlineInput
													field={field}
													type='tel'
													placeholder='+976 9900 0000'
													disabled={isPending}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name='contact_email'
									render={({ field }) => (
										<FormItem>
											<FormLabel className='text-sm text-foreground/80'>
												И-мэйл
											</FormLabel>
											<FormControl>
												<UnderlineInput
													field={field}
													type='email'
													placeholder='venue@example.mn'
													disabled={isPending}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name='website'
									render={({ field }) => (
										<FormItem>
											<FormLabel className='text-sm text-foreground/80'>
												Веб сайт
											</FormLabel>
											<FormControl>
												<UnderlineInput
													field={field}
													placeholder='https://example.mn'
													disabled={isPending}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</section>
					</div>
				</div>
					</TabsContent>

					<TabsContent value='packages' className='mt-0'>
						<VenueEventPackagesField
							control={form.control}
							disabled={isPending || imageUploadBusy || galleryUploadBusy}
							isEdit={isEdit}
							providerServices={providerServices}
						/>
					</TabsContent>
				</Tabs>

				<div className='mt-10 flex justify-end gap-3'>
					<Button
						type='button'
						variant='outline'
						onClick={() => history.back()}
						disabled={isPending}
					>
						Цуцлах
					</Button>
					<Button
						type='submit'
						disabled={isPending || imageUploadBusy || galleryUploadBusy}
						className='rounded-lg bg-foreground px-8 text-xs font-semibold tracking-[0.15em] text-background uppercase hover:bg-foreground/90'
					>
						{isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
						{isEdit ? 'Хадгалах' : 'Байршил нэмэх'}
					</Button>
				</div>
			</form>
		</Form>
	);
};
