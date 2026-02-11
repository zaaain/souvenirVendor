import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { VendorInfoCard } from '@components/card'
import type { VendorInfoCardItem } from '@components/card'
import { Modal } from '@components/modal'
import { useGetProductByIdQuery, useDeleteProductMutation, API_BASE_URL } from '@store/features/products/productSlice'
import type { ProductItem } from '@store/features/products/productSlice'
import { sSnack, eSnack } from '@hooks/useToast'
import { TailSpin } from 'react-loader-spinner'

const STATUS_PILL: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  Published: 'bg-primary text-white',
  Suspended: 'bg-red-100 text-red-700',
  Rejected: 'bg-red-100 text-red-600',
}

interface ProductDetailData {
  productName: string
  status: string
  general: VendorInfoCardItem[]
  pricing: VendorInfoCardItem[]
  shipping: VendorInfoCardItem[]
  images: string[]
}

function getCategoryName(cat: ProductItem['category']): string {
  if (cat == null) return '—'
  if (typeof cat === 'object' && 'name' in cat) return String((cat as { name?: string }).name ?? '—')
  return String(cat)
}

function toImageUrl(path: string | undefined): string {
  if (!path) return ''
  const base = API_BASE_URL.replace(/\/$/, '')
  return path.startsWith('http') ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`
}

function mapProductToDetail(p: ProductItem): ProductDetailData {
  const shipping = (p as { shippingDetails?: { weight?: number; height?: number; width?: number; length?: number } }).shippingDetails
  const weight = shipping?.weight ?? ''
  const h = shipping?.height ?? ''
  const w = shipping?.width ?? ''
  const l = shipping?.length ?? ''
  const dimensions = [h, l, w].every((x) => x !== '' && x !== undefined) ? `${h} x ${l} x ${w}` : '—'
  const priceVal = p.price
  const priceStr = typeof priceVal === 'number' ? `$${Number(priceVal).toLocaleString()}` : (priceVal ? `$${String(priceVal)}` : '—')
  const featureImage = (p as { featureImage?: string }).featureImage
  const imagesArr = (p as { images?: string[] }).images ?? []
  const allImages = [featureImage, ...imagesArr].filter(Boolean).map(toImageUrl)
  const statusRaw = p.status ?? ''
  const statusDisplay = statusRaw ? statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1).toLowerCase() : '—'
  return {
    productName: p.name ?? p.productName ?? '—',
    status: statusDisplay,
    general: [
      { label: 'Product Category', value: getCategoryName(p.category) },
      { label: 'SKU', value: String(p.sku ?? '—') },
      { label: 'Quantity Available (Stock)', value: String(p.stock ?? p.inventory ?? p.quantity ?? '—') },
      { label: 'Description', value: String(p.description ?? '—'), colSpan: 3 },
    ],
    pricing: [
      { label: 'Pricing', value: priceStr },
      { label: 'VAT Amount (%)', value: p.vat != null ? `${p.vat}%` : '—' },
      { label: 'Discount Percentage (%)', value: p.discount != null ? `${p.discount}%` : '—' },
    ],
    shipping: [
      { label: 'Weight (kg)', value: String(weight || '—') },
      { label: 'Dimensions [Height x Length x Width] (cm)', value: dimensions },
    ],
    images: allImages.length ? allImages : [],
  }
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const { data: productResponse, isLoading, isError } = useGetProductByIdQuery(id ?? '', { skip: !id })
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation()

  const product: ProductItem | undefined = productResponse && typeof productResponse === 'object' && 'data' in productResponse
    ? (productResponse as { data?: ProductItem }).data
    : (productResponse as ProductItem | undefined)
  const detail = product ? mapProductToDetail(product) : null

  const handleDelete = async () => {
    if (!id) return
    try {
      await deleteProduct(id).unwrap()
      sSnack('Product deleted successfully')
      setDeleteModalOpen(false)
      navigate('/products')
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string }; error?: string })?.data?.message ?? (err as { error?: string })?.error ?? 'Failed to delete product'
      eSnack(msg)
    }
  }

  if (!id) {
    return (
      <div className="space-y-4">
        <Link to="/products" className="inline-flex items-center gap-1 text-sm font-Manrope text-gray-600 hover:text-primary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Products
        </Link>
        <p className="text-gray-600">Invalid product ID.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <TailSpin visible height={60} width={60} color="#2466D0" ariaLabel="Loading product" />
      </div>
    )
  }

  if (isError || !detail) {
    return (
      <div className="space-y-4">
        <Link to="/products" className="inline-flex items-center gap-1 text-sm font-Manrope text-gray-600 hover:text-primary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Products
        </Link>
        <p className="text-gray-600">Product not found.</p>
      </div>
    )
  }

  const statusClass = STATUS_PILL[detail.status] ?? 'bg-gray-100 text-gray-600'
  const initial = detail.productName ? detail.productName.charAt(0).toUpperCase() : '—'

  return (
    <div className="space-y-6">
      {/* Header: Back | Avatar (first letter, same as VendorDetail) | Name + Status | Reject, Approve / Delete, Suspend / etc. */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            to="/products"
            className="shrink-0 p-1.5 -ml-1.5 text-gray-600 hover:text-primary rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Back to Products"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="shrink-0 w-[100px] h-[100px] rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-50 text-gray-600 text-3xl font-ManropeBold">
            {initial}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-ManropeBold text-gray-800">{detail.productName}</h1>
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-Manrope ${statusClass}`}>
                {detail.status}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={() => navigate(`/products/${id}/edit`)}
            className="px-4 py-2.5 rounded-lg border border-primary text-primary text-sm font-Manrope hover:bg-primary/5 transition-colors"
          >
            Edit Product
          </button>
          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="p-2.5 rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors"
            aria-label="Delete Product"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* General Information: grid + Description (normal weight) */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-base font-ManropeBold text-gray-800 mb-2">General Information</h3>
        <div className="border-b border-gray-200 mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-4">
          {detail.general.filter((i) => i.label !== 'Description').map((item, i) => (
            <div key={i}>
              <p className="text-xs font-Manrope text-gray-500">{item.label}</p>
              <p className="text-sm font-ManropeBold text-gray-800 mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
        {(() => {
          const d = detail.general.find((i) => i.label === 'Description')
          if (!d || !d.value) return null
          return (
            <div className="mt-4">
              <p className="text-xs font-Manrope text-gray-500">Description</p>
              <p className="text-sm font-Manrope text-gray-800 mt-0.5">{d.value}</p>
            </div>
          )
        })()}
      </div>
      <VendorInfoCard heading="Pricing" data={detail.pricing} />
      <VendorInfoCard heading="Shipping" data={detail.shipping} />

      {/* Product Images */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-base font-ManropeBold text-gray-800 mb-2">Product Images</h3>
        <div className="border-b border-gray-200 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {detail.images.map((src, i) => (
            <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Product"
        description="Deleting the product will permanently remove it from the catalog. This action cannot be undone."
        iconType="error"
        actions={[
          { label: 'Cancel', onClick: () => setDeleteModalOpen(false), variant: 'secondary', disabled: isDeleting },
          { label: isDeleting ? 'Deleting...' : 'Delete Product', onClick: handleDelete, variant: 'danger', disabled: isDeleting },
        ]}
      />
    </div>
  )
}

export default ProductDetail
