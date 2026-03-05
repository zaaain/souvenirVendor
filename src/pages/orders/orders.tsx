import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter } from '@components/filter'
import { PaginateTable } from '@components/table'
import type { TableColumn } from '@components/table'
import { useGetVendorOrdersQuery } from '@store/features/orders/ordersSlice'

/** Order status keys used by API */
const ORDER_STATUS_VALUES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  ...ORDER_STATUS_VALUES.map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) })),
]

const STATUS_PILL: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  confirmed: 'bg-blue-100 text-blue-600',
  processing: 'bg-orange-100 text-orange-600',
  shipped: 'bg-purple-100 text-purple-600',
  delivered: 'bg-green-100 text-green-600',
  cancelled: 'bg-red-100 text-red-600',
}

function ProductIcon() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-red-200 bg-red-50 text-red-500">
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    </span>
  )
}

const ITEMS_PER_PAGE = 10

function formatOrderDate(val: string | undefined): string {
  if (!val) return '—'
  const d = new Date(val)
  if (Number.isNaN(d.getTime())) return String(val)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatAmount(val: string | number | undefined): string {
  if (val == null) return '—'
  if (typeof val === 'number') return `QAR ${Number(val).toLocaleString()}`
  return String(val)
}

function buildColumns(onView: (id: string) => void, _onEdit?: (id: string) => void): TableColumn[] {
  return [
    { key: 'rowNum', label: '#' },
    { key: 'orderId', label: 'Order ID', render: (v) => `#${String(v ?? '')}` },
    {
      key: 'productName',
      label: 'Products',
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <ProductIcon />
          <div>
            <p className="text-sm font-Manrope text-gray-800">{String(v ?? '')}</p>
            {(row.otherCount as number) > 0 && (
              <p className="text-xs text-gray-500">+{(row.otherCount as number)} other products</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'customerName',
      label: 'Customer',
      render: (v, row) => {
        const contact = String(row.customerEmail ?? '')
        const isEmail = contact.includes('@')
        const href = contact ? (isEmail ? `mailto:${contact}` : `tel:${contact}`) : undefined
        return (
          <div>
            <p className="text-sm font-Manrope text-gray-800">{String(v ?? '')}</p>
            {href && (
              <a href={href} className="text-xs text-primary hover:underline">
                {contact}
              </a>
            )}
          </div>
        )
      },
    },
    { key: 'totalAmount', label: 'Total Amount' },
    { key: 'paymentMethod', label: 'Payment Method' },
    { key: 'orderDate', label: 'Order Date' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => {
        const s = String(v ?? '')
        const display = s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '—'
        return (
          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-Manrope ${STATUS_PILL[s] ?? 'bg-gray-100 text-gray-600'}`}>
            {display}
          </span>
        )
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => {
        const id = String(row.id ?? row.orderId ?? '')
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
            {/* <button
              type="button"
              onClick={() => onEdit(id)}
              className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/5 rounded transition-colors"
              aria-label="Edit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button> */}
          </div>
        )
      },
    },
  ]
}

const Orders = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      if (search.trim()) setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading, isError, error } = useGetVendorOrdersQuery({
    page,
    limit: ITEMS_PER_PAGE,
    ...(status !== 'all' && { status }),
    ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
  })

  const apiOrders = useMemo(() => {
    const raw = data?.data?.orders ?? []
    return Array.isArray(raw) ? raw : []
  }, [data])

  const pagination = data?.data?.pagination
  const totalFromApi = pagination?.total ?? apiOrders.length

  const tableRows = useMemo(() => {
    return apiOrders.map((r, i) => {
      const id = String(r._id ?? r.orderId ?? '')
      const orderId = r.orderId ?? id
      const products = r.products ?? []
      const firstProduct = products[0]
      const productName = firstProduct?.name ?? '—'
      const otherCount = products.length > 1 ? products.length - 1 : 0
      const userId = r.userId
      const customerName = userId
        ? `${String(userId.firstname ?? '').trim()} ${String(userId.lastname ?? '').trim()}`.trim() || '—'
        : '—'
      const customerEmail = userId?.email ?? r.shippingAddress?.phone ?? '—'
      const paymentMethod = r.paymentMethod ? String(r.paymentMethod).toUpperCase() : '—'
      return {
        id,
        rowNum: (page - 1) * ITEMS_PER_PAGE + i + 1,
        orderId,
        productName,
        otherCount,
        customerName,
        customerEmail,
        totalAmount: formatAmount(r.totalAmount),
        paymentMethod,
        orderDate: formatOrderDate(r.createdAt),
        orderDateRaw: r.createdAt,
        status: r.status ?? '—',
      }
    })
  }, [apiOrders, page])

  const columns = useMemo(
    () =>
      buildColumns(
        (id) => navigate(`/orders/${id}`),
        (id) => navigate(`/orders/${id}`)
      ),
    [navigate]
  )

  const handleApply = () => setPage(1)
  const handleClearAll = () => {
    setSearch('')
    setStatus('all')
    setPage(1)
  }

  if (isError) {
    const errMsg = error && typeof error === 'object' && 'data' in error
      ? String((error as { data?: { message?: string } }).data?.message ?? 'Failed to load orders')
      : 'Failed to load orders'
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-ManropeBold text-gray-800">Orders</h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {errMsg}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-ManropeBold text-gray-800">Orders</h1>
          <p className="text-gray-500 font-Manrope mt-1">Manage your orders</p>
        </div>
        {/* <button
          type="button"
          onClick={() => console.log('Export')}
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-Manrope hover:bg-primary/5 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Export
        </button> */}
      </div>

      <Filter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by id..."
        statusValue={status}
        onStatusChange={setStatus}
        statusOptions={STATUS_OPTIONS}
        onApply={handleApply}
        onClearAll={handleClearAll}
      />

      <PaginateTable
        headers={columns}
        data={tableRows}
        currentPage={page}
        itemsPerPage={ITEMS_PER_PAGE}
        totalResults={totalFromApi}
        onPageChange={setPage}
        loading={isLoading}
      />
    </div>
  )
}

export default Orders
