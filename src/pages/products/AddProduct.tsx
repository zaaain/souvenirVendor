import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigate } from 'react-router-dom'
import { Input } from '@components/formsInput'
import { Textarea } from '@components/formsInput'
import { FileUpload } from '@components/formsInput'
import { FeaturedImageUpload } from '@components/formsInput'
import { Select } from '@components/select'
import { QuantityStepper } from '@components/formsInput'
import { Button } from '@components/buttons'
import { productSchema, ProductFormData } from '@helpers/schemas'
import { sSnack, eSnack } from '@hooks/useToast'
import type { SelectOption } from '@components/select'
import { useAddProductMutation } from '@store/features/products/productSlice'

const CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'medication', label: 'Medication' },
  { value: 'vitamins', label: 'Vitamins' },
  { value: 'supplements', label: 'Supplements' },
  { value: 'feed', label: 'Feed & Nutrition' },
  { value: 'animal-medicines', label: 'Animal Medicines' },
]

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'pending', label: 'Pending' },
]

function buildProductFormData(
  data: ProductFormData,
  status: string,
  productImages: File[],
  featuredImage: File[]
): FormData {
  const form = new FormData()
  form.append('productName', (data.productName ?? '').trim())
  form.append('description', (data.description ?? '').trim())
  form.append('category', data.category ?? '')
  form.append('status', status)
  form.append('sku', (data.sku ?? '').trim())
  form.append('quantity', String(data.quantity ?? 0))
  form.append('price', (data.price ?? '').trim())
  if (data.vat?.trim()) form.append('vat', data.vat.trim())
  if (data.discount?.trim()) form.append('discount', data.discount.trim())
  if (data.weight?.trim()) form.append('weight', data.weight.trim())
  if (data.height?.trim()) form.append('height', data.height.trim())
  if (data.length?.trim()) form.append('length', data.length.trim())
  if (data.width?.trim()) form.append('width', data.width.trim())
  const allImages = featuredImage.length ? [...featuredImage, ...productImages] : productImages
  allImages.forEach((file) => form.append('images', file))
  return form
}

const AddProduct = () => {
  const navigate = useNavigate()
  const [addProduct, { isLoading: isAdding }] = useAddProductMutation()
  const [productImages, setProductImages] = useState<File[]>([])
  const [featuredImage, setFeaturedImage] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProductFormData>({
    resolver: yupResolver(productSchema),
    mode: 'onChange',
    defaultValues: {
      productName: '',
      description: '',
      category: '',
      status: 'draft',
      sku: '',
      quantity: 0,
      price: '',
      vat: '',
      discount: '',
      weight: '',
      height: '',
      length: '',
      width: '',
    },
  })

  const status = watch('status')

  const handleSaveDraft = handleSubmit(async (data) => {
    setIsSubmitting(true)
    try {
      const formData = buildProductFormData(data, 'draft', productImages, featuredImage)
      const result = await addProduct(formData).unwrap()
      sSnack(result?.message ?? 'Product saved as draft successfully')
      navigate('/products')
    } catch (err: unknown) {
      const message = (err as { data?: { message?: string }; error?: string })?.data?.message
        ?? (err as { error?: string })?.error
        ?? 'Failed to save product as draft'
      eSnack(message)
    } finally {
      setIsSubmitting(false)
    }
  })

  const handleCancel = () => {
    navigate('/products')
  }

  const handlePublish = handleSubmit(async (data) => {
    setIsSubmitting(true)
    try {
      const formData = buildProductFormData(data, 'published', productImages, featuredImage)
      const result = await addProduct(formData).unwrap()
      sSnack(result?.message ?? 'Product published successfully')
      navigate('/products')
    } catch (err: unknown) {
      const message = (err as { data?: { message?: string }; error?: string })?.data?.message
        ?? (err as { error?: string })?.error
        ?? 'Failed to publish product'
      eSnack(message)
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <form onSubmit={handlePublish} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="p-1.5 -ml-1.5 text-gray-600 hover:text-primary rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Back to Products"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-ManropeBold text-gray-800">Add New Product</h1>
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-Manrope ${
              status === 'draft' ? 'bg-gray-100 text-gray-700' :
              status === 'published' ? 'bg-primary text-white' :
              'bg-orange-100 text-orange-700'
            }`}>
              {STATUS_OPTIONS.find(opt => opt.value === status)?.label || 'Draft'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-2 text-primary text-sm font-Manrope hover:underline"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg border border-primary text-primary text-sm font-Manrope hover:bg-primary/5 transition-colors"
          >
            Cancel
          </button>
          <Button onClick={handlePublish} className="px-4 py-2" loader={isSubmitting || isAdding} disabled={isSubmitting || isAdding}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Publish Product
          </Button>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Wider (8 cols on md+) */}
        <div className="col-span-12 md:col-span-8 space-y-6">
          {/* General Information Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-lg font-ManropeBold text-gray-800 mb-2">General Information</h3>
            <div className="border-b border-gray-200 mb-4" />
            <div className="space-y-4">
              <Controller
                name="productName"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Product Name"
                    placeholder="Type product name here..."
                    type="text"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.productName?.message}
                  />
                )}
              />
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea
                    label="Description"
                    placeholder="Type product description here..."
                    rows={6}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.description?.message}
                  />
                )}
              />
            </div>
          </div>

          {/* Product Images Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-lg font-ManropeBold text-gray-800 mb-4">Product Images</h3>
            <FileUpload
              multiple
              accept="image/*"
              maxSize={10}
              placeholder="Drag and drop files here, or click to browse"
              supportedFormats="Supported: JPG, PNG, JPEG (Max 10MB each)"
              onFilesChange={setProductImages}
            />
          </div>

          {/* Pricing Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-lg font-ManropeBold text-gray-800 mb-2">Pricing</h3>
            <div className="border-b border-gray-200 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1 font-ManropeBold">
                  Pricing
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10">$</span>
                  <Controller
                    name="price"
                    control={control}
                    render={({ field }) => (
                      <Input
                        placeholder="Base Price"
                        type="number"
                        className="pl-8"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={errors.price?.message}
                      />
                    )}
                  />
                </div>
              </div>
              <Controller
                name="vat"
                control={control}
                render={({ field }) => (
                  <Input
                    label="VAT Amount (%)"
                    placeholder="VAT Amount (%)"
                    type="number"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.vat?.message}
                  />
                )}
              />
              <Controller
                name="discount"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Discount Percentage (%)"
                    placeholder="Discount Percentage (%)"
                    type="number"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.discount?.message}
                  />
                )}
              />
            </div>
          </div>

          {/* Shipping Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-lg font-ManropeBold text-gray-800 mb-2">Shipping</h3>
            <div className="border-b border-gray-200 mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Controller
                name="weight"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Weight (kg)"
                    placeholder="Weight (kg)"
                    type="number"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.weight?.message}
                  />
                )}
              />
              <Controller
                name="height"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Height (cm)"
                    placeholder="Height (cm)"
                    type="number"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.height?.message}
                  />
                )}
              />
              <Controller
                name="length"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Length (cm)"
                    placeholder="Length (cm)"
                    type="number"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.length?.message}
                  />
                )}
              />
              <Controller
                name="width"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Width (cm)"
                    placeholder="Width (cm)"
                    type="number"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.width?.message}
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Narrower (4 cols on md+) */}
        <div className="col-span-12 md:col-span-4 space-y-6">
          {/* Category Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-lg font-ManropeBold text-gray-800 mb-2">Category</h3>
            <div className="border-b border-gray-200 mb-4" />
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <div>
                  <Select
                    label="Product Category"
                    value={field.value}
                    onValueChange={field.onChange}
                    options={CATEGORY_OPTIONS}
                    placeholder="Select a Category"
                    rounded="lg"
                  />
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-500 font-Manrope">{errors.category.message}</p>
                  )}
                </div>
              )}
            />
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-lg font-ManropeBold text-gray-800 mb-2">Status</h3>
            <div className="border-b border-gray-200 mb-4" />
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <div>
                  <Select
                    label="Product Status"
                    value={field.value}
                    onValueChange={field.onChange}
                    options={STATUS_OPTIONS}
                    placeholder="Select Status"
                    rounded="lg"
                  />
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-500 font-Manrope">{errors.status.message}</p>
                  )}
                </div>
              )}
            />
          </div>

          {/* Inventory Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-lg font-ManropeBold text-gray-800 mb-2">Inventory</h3>
            <div className="border-b border-gray-200 mb-4" />
            <div className="space-y-4">
              <Controller
                name="sku"
                control={control}
                render={({ field }) => (
                  <Input
                    label="SKU"
                    placeholder="Type product SKU"
                    type="text"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.sku?.message}
                  />
                )}
              />
              <Controller
                name="quantity"
                control={control}
                render={({ field }) => (
                  <div>
                    <QuantityStepper
                      label="Quantity Available (Stock)"
                      value={field.value}
                      onChange={field.onChange}
                      min={0}
                    />
                    {errors.quantity && (
                      <p className="mt-1 text-sm text-red-500 font-Manrope">{errors.quantity.message}</p>
                    )}
                  </div>
                )}
              />
            </div>
          </div>

          {/* Featured Image Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-lg font-ManropeBold text-gray-800 mb-2">Featured Image</h3>
            <div className="border-b border-gray-200 mb-4" />
            <FeaturedImageUpload
              accept="image/*"
              maxSize={10}
              placeholder="Drag and drop files here, or click to browse"
              supportedFormats="Supported: JPG, PNG, JPEG (Max 10MB each)"
              onFileChange={(file) => setFeaturedImage(file ? [file] : [])}
            />
          </div>
        </div>
      </div>
    </form>
  )
}

export default AddProduct
