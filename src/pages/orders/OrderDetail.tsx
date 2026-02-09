import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { OrderTrackingStepper, type OrderStatus, type OrderTrackingStep } from '@components/order'
import { Modal } from '@components/modal'

// Mock data - in real app, fetch from API
const MOCK_ORDER_DATA: Record<string, unknown> = {
  orderId: '302012',
  status: 'Processing' as OrderStatus,
  customerName: 'John Bushmill',
  customerEmail: 'Johnb@mail.com',
  customerPhone: '+1 123 123 1234',
  billingAddress: '3051 Wehner Port, New Kingcester 68500-4356',
  shippingAddress: '3051 Wehner Port, New Kingcester 68500-4356',
  orderItems: [
    { productName: 'Amoxicillin', dosage: '50 MG', sku: '302012', quantity: 1, price: '$123,000', total: '$123,000' },
    { productName: 'Amoxicillin', dosage: '50 MG', sku: '302012', quantity: 2, price: '$50,000', total: '$100,000' },
    { productName: 'Amoxicillin', dosage: '50 MG', sku: '302012', quantity: 1, price: '$123,000', total: '$123,000' },
  ],
  subtotal: '$123,000',
  vat: '$0',
  vatPercent: '0%',
  deliveryFee: '$123,000',
  trackingSteps: [
    { status: 'Order Placed', date: '12/12/2022', time: '03:00' },
    { status: 'Processing', date: '12/12/2022', time: '03:00' },
  ] as OrderTrackingStep[],
  invoice: {
    fileName: 'Invoice',
    size: '1.8 MB',
    generatedDate: 'Generated Jan 10, 2025',
  },
  deliveryProof: {
    fileName: 'Delivery Proof',
    status: 'Not Yet Submitted',
  },
}

const STATUS_PILL: Record<string, string> = {
  'Order Placed': 'bg-gray-100 text-gray-600',
  Processing: 'bg-orange-100 text-orange-600',
  Packed: 'bg-blue-100 text-blue-600',
  Shipping: 'bg-purple-100 text-purple-600',
  Delivered: 'bg-green-100 text-green-600',
  Cancelled: 'bg-red-100 text-red-600',
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

function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [updateStatusModalOpen, setUpdateStatusModalOpen] = useState(false)

  // In real app, fetch order data by id
  const orderData = MOCK_ORDER_DATA
  const status = orderData.status as OrderStatus

  const handleCancelOrder = () => {
    console.log('Cancel order:', id)
    setCancelModalOpen(false)
    // Navigate back or update status
  }

  const handleUpdateStatus = () => {
    console.log('Update status for order:', id)
    setUpdateStatusModalOpen(false)
    // Update order status
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-ManropeBold text-gray-800">#{String(orderData.orderId)}</h1>
            <span
              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-Manrope ${
                STATUS_PILL[status] ?? 'bg-gray-100 text-gray-600'
              }`}
            >
              {status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCancelModalOpen(true)}
            className="px-4 py-2 rounded-lg border border-red-500 text-red-500 text-sm font-Manrope hover:bg-red-50 transition-colors"
          >
            Cancel Order
          </button>
          <button
            type="button"
            onClick={() => setUpdateStatusModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-gray-600 text-white text-sm font-Manrope hover:bg-gray-700 transition-colors"
          >
            Update Status
          </button>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Wider */}
        <div className="lg:col-span-2 space-y-6">
          {/* Track Order Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-lg font-ManropeBold text-gray-800 mb-4">Track Order</h2>
            <OrderTrackingStepper
              currentStatus={status}
              steps={orderData.trackingSteps as OrderTrackingStep[]}
            />
          </div>

          {/* Order Items Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-lg font-ManropeBold text-gray-800 mb-4">Order Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-ManropeBold text-gray-800">Products</th>
                    <th className="text-left py-3 px-4 text-sm font-ManropeBold text-gray-800">SKU</th>
                    <th className="text-left py-3 px-4 text-sm font-ManropeBold text-gray-800">Quantity</th>
                    <th className="text-left py-3 px-4 text-sm font-ManropeBold text-gray-800">Price</th>
                    <th className="text-right py-3 px-4 text-sm font-ManropeBold text-gray-800">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(orderData.orderItems as Array<Record<string, unknown>>).map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <ProductIcon />
                          <div>
                            <p className="text-sm font-Manrope text-gray-800">{item.productName as string}</p>
                            <p className="text-xs text-gray-500">{item.dosage as string}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{item.sku as string}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{item.quantity as number}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{item.price as string}</td>
                      <td className="py-3 px-4 text-sm font-ManropeBold text-gray-800 text-right">
                        {item.total as string}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-end">
                <div className="space-y-2 text-right">
                  <div className="flex items-center gap-8">
                    <span className="text-sm text-gray-600">Subtotal</span>
                    <span className="text-sm font-ManropeBold text-gray-800 w-24">{orderData.subtotal as string}</span>
                  </div>
                  <div className="flex items-center gap-8">
                    <span className="text-sm text-gray-600">VAT ({orderData.vatPercent as string})</span>
                    <span className="text-sm font-ManropeBold text-gray-800 w-24">{orderData.vat as string}</span>
                  </div>
                  <div className="flex items-center gap-8">
                    <span className="text-sm text-gray-600">Delivery Fee</span>
                    <span className="text-sm font-ManropeBold text-gray-800 w-24">{orderData.deliveryFee as string}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Document Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-lg font-ManropeBold text-gray-800 mb-4">Document</h2>
            <div className="space-y-4">
              {/* Invoice */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="text-sm font-ManropeBold text-gray-800">
                      {(orderData.invoice as Record<string, unknown>).fileName as string}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(orderData.invoice as Record<string, unknown>).size as string} |{' '}
                      {(orderData.invoice as Record<string, unknown>).generatedDate as string}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="p-2 text-primary hover:bg-primary/10 rounded transition-colors"
                    aria-label="Refresh"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="p-2 text-primary hover:bg-primary/10 rounded transition-colors"
                    aria-label="Download"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Delivery Proof */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="text-sm font-ManropeBold text-gray-800">
                      {(orderData.deliveryProof as Record<string, unknown>).fileName as string}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(orderData.deliveryProof as Record<string, unknown>).status as string}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="p-2 text-primary hover:bg-primary/10 rounded transition-colors"
                  aria-label="Upload"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Narrower */}
        <div className="space-y-6">
          {/* Address Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-lg font-ManropeBold text-gray-800 mb-4">Address</h2>
            <div className="space-y-4">
              {/* Billing Address */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-ManropeBold text-gray-800">Billing</span>
                </div>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(orderData.billingAddress as string)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {orderData.billingAddress as string}
                </a>
              </div>

              {/* Shipping Address */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-ManropeBold text-gray-800">Shipping</span>
                </div>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(orderData.shippingAddress as string)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {orderData.shippingAddress as string}
                </a>
              </div>
            </div>
          </div>

          {/* Customer Information Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-lg font-ManropeBold text-gray-800 mb-4">Customer Information</h2>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-ManropeBold text-gray-800">{orderData.customerName as string}</p>
                    <p className="text-xs text-gray-500 mt-1">{orderData.customerPhone as string}</p>
                    <a
                      href={`mailto:${orderData.customerEmail as string}`}
                      className="text-xs text-primary hover:underline mt-1 block"
                    >
                      {orderData.customerEmail as string}
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  className="p-2 text-primary hover:bg-primary/10 rounded transition-colors"
                  aria-label="Chat"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Order"
        description="Are you sure you want to cancel this order? This action cannot be undone."
        iconType="warning"
        actions={[
          {
            label: 'Cancel',
            onClick: () => setCancelModalOpen(false),
            variant: 'secondary',
          },
          {
            label: 'Cancel Order',
            onClick: handleCancelOrder,
            variant: 'danger',
          },
        ]}
      />

      {/* Update Status Modal */}
      <Modal
        isOpen={updateStatusModalOpen}
        onClose={() => setUpdateStatusModalOpen(false)}
        title="Update Status"
        description={`Are you sure you want to update the order status? The customer, ${orderData.customerName as string}, will be notified.`}
        iconType="success"
        actions={[
          {
            label: 'Cancel',
            onClick: () => setUpdateStatusModalOpen(false),
            variant: 'secondary',
          },
          {
            label: 'Update Status',
            onClick: handleUpdateStatus,
            variant: 'primary',
          },
        ]}
      />
    </div>
  )
}

export default OrderDetail
