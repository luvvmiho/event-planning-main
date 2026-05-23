'use client'

import { submitCreateService, submitUpdateService } from '@/actions/service.actions'
import { Button } from '@/components/ui/button'
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
} from '@/components/ui/file-upload'
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { uploadVenueImage } from '@/lib/api'
import { SERVICE_KIND_OPTIONS } from '@/lib/service-labels'
import { cn } from '@/lib/utils'
import type { CreateServiceFormValues } from '@/lib/validations/service'
import { createServiceSchema, editServiceFormSchema } from '@/lib/validations/service'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, X } from 'lucide-react'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

const UnderlineInput = ({
	field,
	placeholder,
	type = 'text',
	disabled,
}: {
	field: React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement> }
	placeholder?: string
	type?: string
	disabled?: boolean
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
)

type SavedImageProps = {
	url: string
	onRemove: () => void
	disabled?: boolean
	label: string
	className?: string
}

function SavedImage({ url, onRemove, disabled, label, className }: SavedImageProps) {
	return (
		<div
			className={cn(
				'group relative overflow-hidden rounded-lg border border-foreground/10 bg-muted',
				className,
			)}
		>
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
	)
}

type ImageFileListProps = {
	listClassName?: string
}

function ImageFileList({ listClassName }: ImageFileListProps = {}) {
	const files = useFileUpload((state) => Array.from(state.files.keys()))

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
	)
}

type Props = {
	accessToken: string
	mode?: 'create' | 'edit'
	serviceId?: string
	initialValues?: Partial<CreateServiceFormValues>
}

export const ServiceForm = ({
	accessToken,
	mode = 'create',
	serviceId,
	initialValues,
}: Props) => {
	const [isPending, startTransition] = React.useTransition()
	const [imageUploadBusy, setImageUploadBusy] = React.useState(false)
	const [galleryUploadBusy, setGalleryUploadBusy] = React.useState(false)
	const [primaryUploadError, setPrimaryUploadError] = React.useState<string | null>(null)
	const [galleryUploadError, setGalleryUploadError] = React.useState<string | null>(null)
	const [primaryPendingFiles, setPrimaryPendingFiles] = React.useState<File[]>([])
	const [galleryPendingFiles, setGalleryPendingFiles] = React.useState<File[]>([])
	const galleryFileToUrlRef = React.useRef<Map<File, string>>(new Map())

	const form = useForm<CreateServiceFormValues>({
		resolver: zodResolver(mode === 'edit' ? editServiceFormSchema : createServiceSchema),
		defaultValues: {
			name: '',
			kind: 'other',
			price_flat: 0,
			short_description: '',
			description: '',
			location: '',
			image_url: '',
			images: [],
			sort_order: 0,
			...initialValues,
		},
	})

	const onSubmit = (values: CreateServiceFormValues) => {
		startTransition(async () => {
			if (mode === 'edit' && serviceId) {
				const result = await submitUpdateService(serviceId, values)
				if (result?.error) {
					form.setError('root', { message: result.error })
					return
				}
				toast.success('Үйлчилгээ хадгалагдлаа')
				return
			}

			const result = await submitCreateService(values)
			if (result?.error) {
				form.setError('root', { message: result.error })
			}
		})
	}

	const isEdit = mode === 'edit'
	const uploadDisabled = isPending || imageUploadBusy || galleryUploadBusy

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} noValidate className='space-y-6'>
				{form.formState.errors.root ? (
					<div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
						{form.formState.errors.root.message}
					</div>
				) : null}

				<div className='grid gap-6 lg:grid-cols-2'>
					<FormField
						control={form.control}
						name='name'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Үйлчилгээний нэр *</FormLabel>
								<FormControl>
									<UnderlineInput field={field} placeholder='Wedding car package' disabled={isPending} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name='kind'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Төрөл *</FormLabel>
								<Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder='Төрөл сонгох' />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{SERVICE_KIND_OPTIONS.map((opt) => (
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
						control={form.control}
						name='price_flat'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Нийт үнэ (₮) *</FormLabel>
								<FormControl>
									<UnderlineInput field={field} type='number' placeholder='350000' disabled={isPending} />
								</FormControl>
								<FormDescription className='text-xs'>
									Захиалгын тоогоор үржүүлнэ (price_flat × quantity)
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name='location'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Байршил</FormLabel>
								<FormControl>
									<UnderlineInput field={field} placeholder='Улаанбаатар' disabled={isPending} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name='short_description'
						render={({ field }) => (
							<FormItem className='lg:col-span-2'>
								<FormLabel>Богино тайлбар</FormLabel>
								<FormControl>
									<UnderlineInput field={field} placeholder='Mercedes S-Class' disabled={isPending} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name='description'
						render={({ field }) => (
							<FormItem className='lg:col-span-2'>
								<FormLabel>Дэлгэрэнгүй тайлбар</FormLabel>
								<FormControl>
									<Textarea {...field} rows={4} disabled={isPending} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name='sort_order'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Эрэмбэ</FormLabel>
								<FormControl>
									<UnderlineInput field={field} type='number' placeholder='0' disabled={isPending} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name='image_url'
						render={({ field }) => (
							<FormItem className='lg:col-span-2'>
								<FormLabel>Үндсэн зураг</FormLabel>
								<FormControl>
									<div className='space-y-3'>
										{field.value ? (
											<SavedImage
												url={field.value}
												label='Үндсэн зураг'
												disabled={uploadDisabled}
												onRemove={() => {
													field.onChange('')
													setPrimaryPendingFiles([])
													setPrimaryUploadError(null)
												}}
												className='aspect-video max-w-xs'
											/>
										) : null}
										<FileUpload
											value={primaryPendingFiles}
											accept='image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif'
											maxFiles={1}
											maxSize={5 * 1024 * 1024}
											disabled={uploadDisabled}
											onValueChange={(files) => {
												setPrimaryPendingFiles(files)
												if (files.length === 0) {
													setPrimaryUploadError(null)
													return
												}
												setPrimaryUploadError(null)
											}}
											onFileReject={(_file, message) => {
												const mapped =
													message === 'File too large'
														? 'Файл хэт том байна (хамгийн ихдээ 5MB)'
														: message === 'File type not accepted'
															? 'Зөвшөөрөгдөөгүй файлын төрөл'
															: message
												setPrimaryUploadError(mapped)
											}}
											onUpload={async (files, { onProgress, onSuccess, onError }) => {
												setImageUploadBusy(true)
												setPrimaryUploadError(null)
												try {
													for (const file of files) {
														try {
															const { url } = await uploadVenueImage(
																file,
																accessToken,
																(pct) => onProgress(file, pct),
															)
															field.onChange(url)
															onSuccess(file)
															setPrimaryPendingFiles([])
														} catch (err) {
															const msg =
																err instanceof Error
																	? err.message
																	: 'Ачаалахад алдаа гарлаа'
															setPrimaryUploadError(msg)
															onError(
																file,
																err instanceof Error ? err : new Error(msg),
															)
														}
													}
												} finally {
													setImageUploadBusy(false)
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
											{imageUploadBusy ? <ImageFileList /> : null}
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
							const savedImages = field.value ?? []
							const galleryAtLimit = savedImages.length >= 12
							const remainingSlots = Math.max(0, 12 - savedImages.length)

							const handleRemoveSavedImage = (url: string) => {
								field.onChange(savedImages.filter((item) => item !== url))
								for (const [file, fileUrl] of galleryFileToUrlRef.current.entries()) {
									if (fileUrl === url) galleryFileToUrlRef.current.delete(file)
								}
							}

							return (
								<FormItem className='lg:col-span-2'>
									<FormLabel>Нэмэлт зургууд</FormLabel>
									<FormControl>
										<div className='space-y-3'>
											{savedImages.length > 0 ? (
												<div className='grid grid-cols-3 gap-2 sm:grid-cols-4'>
													{savedImages.map((url) => (
														<SavedImage
															key={url}
															url={url}
															label='Нэмэлт зураг'
															disabled={uploadDisabled}
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
												disabled={uploadDisabled || galleryAtLimit}
												onValueChange={(files) => {
													setGalleryPendingFiles(files)
													const next = new Set(files)
													for (const f of [...galleryFileToUrlRef.current.keys()]) {
														if (!next.has(f)) galleryFileToUrlRef.current.delete(f)
													}
													if (files.length === 0) {
														setGalleryUploadError(null)
														return
													}
													setGalleryUploadError(null)
												}}
												onFileReject={(_file, message) => {
													const mapped = message.startsWith('Maximum')
														? 'Хамгийн ихдээ 12 зураг ачаална'
														: message === 'File too large'
															? 'Файл хэт том байна (хамгийн ихдээ 5MB)'
															: message === 'File type not accepted'
																? 'Зөвшөөрөгдөөгүй файлын төрөл'
																: message
													setGalleryUploadError(mapped)
												}}
												onUpload={async (files, { onProgress, onSuccess, onError }) => {
													setGalleryUploadBusy(true)
													setGalleryUploadError(null)
													try {
														for (const file of files) {
															const current = form.getValues('images') ?? []
															if (current.length >= 12) {
																setGalleryUploadError('Хамгийн ихдээ 12 зураг ачаална')
																onError(file, new Error('Gallery full'))
																continue
															}
															try {
																const { url } = await uploadVenueImage(
																	file,
																	accessToken,
																	(pct) => onProgress(file, pct),
																)
																galleryFileToUrlRef.current.set(file, url)
																const latest = form.getValues('images') ?? []
																if (!latest.includes(url)) {
																	field.onChange([...latest, url])
																}
																onSuccess(file)
																setGalleryPendingFiles((prev) =>
																	prev.filter((item) => item !== file),
																)
															} catch (err) {
																const msg =
																	err instanceof Error
																		? err.message
																		: 'Ачаалахад алдаа гарлаа'
																setGalleryUploadError(msg)
																onError(
																	file,
																	err instanceof Error ? err : new Error(msg),
																)
															}
														}
													} finally {
														setGalleryUploadBusy(false)
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
														JPEG, PNG, WebP, GIF · файл бүр хамгийн ихдээ 5MB · хамгийн
														ихдээ 12 зураг
														{savedImages.length > 0 ? ` · ${savedImages.length}/12` : ''}
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
													<ImageFileList listClassName='max-h-[min(52vh,480px)]' />
												) : null}
											</FileUpload>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)
						}}
					/>
				</div>

				<div className='flex justify-end gap-3'>
					<Button type='button' variant='outline' onClick={() => history.back()} disabled={isPending}>
						Цуцлах
					</Button>
					<Button type='submit' disabled={uploadDisabled}>
						{isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
						{isEdit ? 'Хадгалах' : 'Үйлчилгээ нэмэх'}
					</Button>
				</div>
			</form>
		</Form>
	)
}
