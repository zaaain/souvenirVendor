import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter } from '@components/filter'
import { Modal } from '@components/modal'
import { PaginateTable } from '@components/table'
import type { TableColumn } from '@components/table'
import { useGetProductsQuery, useDeleteProductMutation } from '@store/features/products/productSlice'
import type { ProductItem, GetProductsResponse } from '@store/features/products/productSlice'
import { sSnack, eSnack } from '@hooks/useToast'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Published', label: 'Published' },
  { value: 'Suspended', label: 'Suspended' },
  { value: 'Rejected', label: 'Rejected' },
]

const STATUS_PILL: Record<string, string> = {
  Pending: 'bg-orange-100 text-orange-700',
  Published: 'bg-primary text-white',
  Suspended: 'bg-red-100 text-red-700',
  Rejected: 'bg-red-100 text-red-600',
}

function ProductIcon() {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-red-200 bg-red-50 text-red-500">
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    </span>
  )
}

const ITEMS_PER_PAGE = 10

function getCategoryName(category: ProductItem['category']): string {
  if (category == null) return ''
  if (typeof category === 'object' && 'name' in category) return String((category as { name?: string }).name ?? '')
  return String(category)
}

function capitalizeFirst(s: string): string {
  if (!s) return ''
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

function mapProductToRow(item: ProductItem, index: number, startIndex: number): Record<string, unknown> {
  const id = item._id ?? item.productId ?? ''
  const name = item.productName ?? item.name ?? ''
  const inv = item.inventory ?? item.quantity ?? 0
  const priceVal = item.price
  const priceStr = typeof priceVal === 'number' ? `$${priceVal.toLocaleString()}` : String(priceVal ?? '')
  const rawDate = item.dateAddedRaw ?? item.createdAt ?? item.dateAdded ?? ''
  const dateAdded = rawDate
    ? new Date(rawDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : ''
  const statusRaw = item.status ?? ''
  const statusDisplay = capitalizeFirst(statusRaw)
  return {
    productId: id,
    productName: name,
    sku: item.sku ?? '',
    category: getCategoryName(item.category),
    inventory: inv,
    price: priceStr,
    dateAdded,
    dateAddedRaw: rawDate,
    status: statusDisplay,
    rowNum: startIndex + index + 1,
  }
}

function buildColumns(onView: (id: string) => void, onEdit: (id: string) => void, onDelete: (id: string) => void): TableColumn[] {
  return [
    { key: 'rowNum', label: '#' },
    {
      key: 'productName',
      label: 'Product',
      render: (v) => (
        <span className="inline-flex items-center gap-2">
          <ProductIcon />
          <span>{String(v ?? '')}</span>
        </span>
      ),
    },
    { key: 'sku', label: 'SKU' },
    { key: 'category', label: 'Category' },
    { key: 'inventory', label: 'Inventory' },
    { key: 'price', label: 'Price' },
    { key: 'dateAdded', label: 'Date Added' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-Manrope ${STATUS_PILL[String(v ?? '')] ?? 'bg-gray-100 text-gray-600'}`}>
          {String(v ?? '')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => {
        const id = String(row.productId ?? '')
        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onView(id)}
              className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/5 rounded transition-colors"
              aria-label="View"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onEdit(id)}
              className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/5 rounded transition-colors"
              aria-label="Edit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onDelete(id)}
              className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              aria-label="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )
      },
    },
  ]
}

const Products = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [dateAdded, setDateAdded] = useState('')
  const [page, setPage] = useState(1)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null)
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation()

  const { data: response, isLoading } = useGetProductsQuery({
    page,
    limit: ITEMS_PER_PAGE,
  })

  const rawList = useMemo(() => {
    const d = response as GetProductsResponse | undefined
    if (!d) return []
    const data = (d as { data?: ProductItem[] | { products?: ProductItem[] } }).data
    if (Array.isArray(data)) return data
    if (data && typeof data === 'object' && Array.isArray((data as { products?: ProductItem[] }).products)) {
      return (data as { products: ProductItem[] }).products
    }
    if (Array.isArray(d.products)) return d.products
    return []
  }, [response])

  const total = useMemo(() => {
    const d = response as GetProductsResponse | undefined
    if (!d) return 0
    const data = (d as { data?: { total?: number } }).data
    const nestedTotal = data && typeof data === 'object' && 'total' in data ? (data as { total: number }).total : undefined
    return nestedTotal ?? d.total ?? d.totalCount ?? d.totalResults ?? rawList.length
  }, [response, rawList.length])

  const filtered = useMemo(() => {
    let list = rawList
    if (status !== 'all') list = list.filter((r) => capitalizeFirst(r.status ?? '') === status)
    if (search.trim()) {
      const q = search.toLowerCase()
      const name = (r: ProductItem) => String(r.productName ?? r.name ?? '').toLowerCase()
      const sku = (r: ProductItem) => String(r.sku ?? '').toLowerCase()
      const cat = (r: ProductItem) => getCategoryName(r.category).toLowerCase()
      list = list.filter((r) => name(r).includes(q) || sku(r).includes(q) || cat(r).includes(q))
    }
    if (dateAdded) {
      list = list.filter(
        (r) => (r.dateAddedRaw ?? r.createdAt ?? '').toString().slice(0, 10) === dateAdded
      )
    }
    return list
  }, [rawList, search, status, dateAdded])

  const startIndex = (page - 1) * ITEMS_PER_PAGE
  const tableData = useMemo(
    () => filtered.map((r, i) => mapProductToRow(r, i, startIndex)),
    [filtered, startIndex]
  )

  const columns = useMemo(
    () =>
      buildColumns(
        (id) => navigate(`/products/${id}`),
        (id) => navigate(`/products/${id}/edit`),
        (id) => {
          setDeleteProductId(id)
          setDeleteModalOpen(true)
        }
      ),
    [navigate]
  )

  const handleApply = () => setPage(1)
  const handleClearAll = () => {
    setSearch('')
    setStatus('all')
    setDateAdded('')
    setPage(1)
  }
  const handleExport = () => console.log('Export')

  const handleConfirmDelete = async () => {
    if (!deleteProductId) return
    try {
      await deleteProduct(deleteProductId).unwrap()
      sSnack('Product deleted successfully')
      setDeleteModalOpen(false)
      setDeleteProductId(null)
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string }; error?: string })?.data?.message ?? (err as { error?: string })?.error ?? 'Failed to delete product'
      eSnack(msg)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-ManropeBold text-gray-800">Products Portfolio</h1>
          <p className="text-gray-500 font-Manrope mt-1">Manage your products</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-Manrope hover:bg-primary/5 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Export
          </button>
          <button
            type="button"
            onClick={() => navigate('/products/add')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-ManropeBold hover:bg-primary/90 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        </div>
      </div>

      <Filter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by product name, SKU, or category..."
        statusValue={status}
        onStatusChange={setStatus}
        statusOptions={STATUS_OPTIONS}
        dateValue={dateAdded}
        onDateChange={setDateAdded}
        dateLabel="Date Added"
        datePlaceholder="Select Date"
        onApply={handleApply}
        onClearAll={handleClearAll}
      />

      <PaginateTable
        headers={columns}
        data={tableData}
        currentPage={page}
        itemsPerPage={ITEMS_PER_PAGE}
        totalResults={total}
        onPageChange={setPage}
        loading={isLoading}
      />

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeleteProductId(null) }}
        title="Delete Product"
        description="Deleting the product will permanently remove it from the catalog. This action cannot be undone."
        iconType="error"
        actions={[
          { label: 'Cancel', onClick: () => { setDeleteModalOpen(false); setDeleteProductId(null) }, variant: 'secondary', disabled: isDeleting },
          { label: isDeleting ? 'Deleting...' : 'Delete Product', onClick: handleConfirmDelete, variant: 'danger', disabled: isDeleting },
        ]}
      />
    </div>
  )
}

export default Products
