import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Input } from '@components/formsInput'
import { Textarea } from '@components/formsInput'
import { FileUpload } from '@components/formsInput'
import { FeaturedImageUpload } from '@components/formsInput'
import { Select } from '@components/select'
import { QuantityStepper } from '@components/formsInput'
import { Button } from '@components/buttons'
import type { SelectOption } from '@components/select'
import { useGetProductByIdQuery, useGetCategoriesQuery, useUpdateProductMutation, API_BASE_URL } from '@store/features/products/productSlice'
import type { ProductItem } from '@store/features/products/productSlice'
import { sSnack, eSnack } from '@hooks/useToast'
import { TailSpin } from 'react-loader-spinner'

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
]

function getCategoryId(cat: ProductItem['category']): string {
  if (cat == null) return ''
  if (typeof cat === 'object' && '_id' in cat) return String((cat as { _id?: string })._id ?? '')
  return String(cat)
}

const EditProduct = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data: productResponse, isLoading: isLoadingProduct } = useGetProductByIdQuery(id ?? '', { skip: !id })
  const { data: categoriesData } = useGetCategoriesQuery(undefined, { skip: !id })
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation()

  const product: ProductItem | undefined = productResponse && typeof productResponse === 'object' && 'data' in productResponse
    ? (productResponse as { data?: ProductItem }).data
    : (productResponse as ProductItem | undefined)

  const [productName, setProductName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('draft')
  const [sku, setSku] = useState('')
  const [quantity, setQuantity] = useState(0)
  const [price, setPrice] = useState('')
  const [vat, setVat] = useState('')
  const [discount, setDiscount] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [length, setLength] = useState('')
  const [width, setWidth] = useState('')
  const [newImages, setNewImages] = useState<File[]>([])

  const categoryOptions: SelectOption[] = (categoriesData?.data ?? categoriesData?.categories ?? []).map(
    (cat) => ({ value: cat._id ?? '', label: cat.name ?? cat._id ?? 'Unnamed' })
  )

  useEffect(() => {
    if (product && id) {
      setProductName(product.name ?? product.productName ?? '')
      setDescription(String(product.description ?? ''))
      setCategory(getCategoryId(product.category))
      setStatus(String(product.status ?? 'draft'))
      setSku(String(product.sku ?? ''))
      setQuantity(Number(product.stock ?? product.inventory ?? product.quantity ?? 0))
      const p = product.price
      setPrice(typeof p === 'number' ? String(p) : String(p ?? ''))
      setVat(product.vat != null ? String(product.vat) : '')
      setDiscount(product.discount != null ? String(product.discount) : '')
      const ship = (product as { shippingDetails?: { weight?: number; height?: number; width?: number; length?: number } }).shippingDetails
      setWeight(ship?.weight != null ? String(ship.weight) : '')
      setHeight(ship?.height != null ? String(ship.height) : '')
      setLength(ship?.length != null ? String(ship.length) : '')
      setWidth(ship?.width != null ? String(ship.width) : '')
    }
  }, [product, id])

  const handleCancel = () => {
    navigate(`/products/${id}`)
  }

  const handleSaveChanges = async () => {
    if (!id) return
    const form = new FormData()
    form.append('name', productName.trim())
    form.append('price', price.trim())
    form.append('stock', String(quantity))
    form.append('isActive', 'true')
    form.append('description', description.trim())
    form.append('category', category)
    form.append('sku', sku.trim())
    form.append('vat', vat.trim())
    form.append('discount', discount.trim())
    form.append('weight', weight.trim())
    form.append('height', height.trim())
    form.append('width', width.trim())
    form.append('length', length.trim())
    newImages.forEach((file) => form.append('file', file))
    try {
      await updateProduct({ id, body: form }).unwrap()
      sSnack('Product updated successfully')
      navigate(`/products/${id}`)
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string }; error?: string })?.data?.message ?? (err as { error?: string })?.error ?? 'Failed to update product'
      eSnack(msg)
    }
  }

  const statusBadgeClass: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    published: 'bg-primary text-white',
    pending: 'bg-orange-100 text-orange-700',
    suspended: 'bg-red-100 text-red-700',
  }

  // API: featureImage = single path; images = array (elements may be comma-separated paths)
  // Featured image sirf Featured Image card mein; Product Images mein sirf baaki images (feature exclude)
  const { featuredImageUrl, productImageUrls } = (() => {
    const empty = { featuredImageUrl: undefined as string | undefined, productImageUrls: [] as string[] }
    if (!product) return empty
    const featureImageRaw = (product as { featureImage?: string }).featureImage?.trim()
    const imagesRaw = (product as { images?: (string | string[])[] }).images ?? []
    const flatPaths: string[] = imagesRaw.flatMap((item) =>
      typeof item === 'string' ? item.split(',').map((s) => s.trim()).filter(Boolean) : []
    )
    const base = API_BASE_URL.replace(/\/$/, '')
    const toUrl = (path: string) => (path.startsWith('http') ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`)
    const normalizedFeature = featureImageRaw ? featureImageRaw.replace(/^\//, '') : ''
    const restPaths = flatPaths.filter((p) => p.replace(/^\//, '') !== normalizedFeature)
    const featuredImageUrl = featureImageRaw ? toUrl(featureImageRaw) : undefined
    const productImageUrls = restPaths.map(toUrl).filter(Boolean)
    return { featuredImageUrl, productImageUrls }
  })()

  if (!id) {
    return (
      <div className="space-y-4">
        <p className="text-gray-600">Invalid product ID.</p>
        <button type="button" onClick={() => navigate('/products')} className="text-primary font-Manrope">Back to Products</button>
      </div>
    )
  }

  if (isLoadingProduct || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <TailSpin visible height={60} width={60} color="#2466D0" ariaLabel="Loading product" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(`/products/${id}`)}
            className="p-1.5 -ml-1.5 text-gray-600 hover:text-primary rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Back to Product"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-ManropeBold text-gray-800">Edit Product</h1>
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-Manrope ${statusBadgeClass[status] || statusBadgeClass.draft}`}>
              {STATUS_OPTIONS.find((opt) => opt.value === status)?.label || status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isUpdating}
            className="w-[130px] h-10 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-Manrope hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
          >
            Cancel
          </button>
          <Button onClick={handleSaveChanges} className="!h-10 w-[130px] px-4 py-2 text-sm shrink-0" loader={isUpdating} disabled={isUpdating || isLoadingProduct}>
            Save Changes
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
              <Input
                label="Product Name"
                placeholder="Type product name here..."
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
              <Textarea
                label="Description"
                placeholder="Type product description here..."
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Product Images Card - sirf feature ke alawa images (feature alag Featured Image mein) */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-lg font-ManropeBold text-gray-800 mb-2">Product Images</h3>
            <div className="border-b border-gray-200 mb-4" />
            {productImageUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                {productImageUrls.map((src, i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
            <FileUpload
              multiple
              accept="image/*"
              maxSize={10}
              placeholder="Drag and drop files here, or click to browse"
              supportedFormats="Supported: JPG, PNG, JPEG (Max 10MB each)"
              onFilesChange={setNewImages}
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
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    placeholder="Base Price"
                    type="number"
                    className="pl-8"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>
              <Input
                label="VAT Amount (%)"
                placeholder="VAT Amount (%)"
                type="number"
                value={vat}
                onChange={(e) => setVat(e.target.value)}
              />
              <Input
                label="Discount Percentage (%)"
                placeholder="Discount Percentage (%)"
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
          </div>

          {/* Shipping Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-lg font-ManropeBold text-gray-800 mb-2">Shipping</h3>
            <div className="border-b border-gray-200 mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Input
                label="Weight (kg)"
                placeholder="Weight (kg)"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
              <Input
                label="Height (cm)"
                placeholder="Height (cm)"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
              <Input
                label="Length (cm)"
                placeholder="Length (cm)"
                type="number"
                value={length}
                onChange={(e) => setLength(e.target.value)}
              />
              <Input
                label="Width (cm)"
                placeholder="Width (cm)"
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
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
            <Select
              label="Product Category"
              value={category}
              onValueChange={setCategory}
              options={categoryOptions}
              placeholder="Select a Category"
              rounded="lg"
              disabled={isLoadingProduct}
            />
          </div>

          {/* Status Card - commented out, status display nahi karna edit par */}
          {/*
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-lg font-ManropeBold text-gray-800 mb-2">Status</h3>
            <div className="border-b border-gray-200 mb-4" />
            <Select
              label="Product Status"
              value={status}
              onValueChange={setStatus}
              options={STATUS_OPTIONS}
              placeholder="Select Status"
              rounded="lg"
            />
          </div>
          */}

          {/* Inventory Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-lg font-ManropeBold text-gray-800 mb-2">Inventory</h3>
            <div className="border-b border-gray-200 mb-4" />
            <div className="space-y-4">
              <Input
                label="SKU"
                placeholder="Type product SKU"
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              />
              <QuantityStepper
                label="Quantity Available (Stock)"
                value={quantity}
                onChange={setQuantity}
                min={0}
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
              currentImageUrl={featuredImageUrl}
              onFileChange={(file) => setNewImages((prev) => (file ? [...prev, file] : prev))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditProduct
