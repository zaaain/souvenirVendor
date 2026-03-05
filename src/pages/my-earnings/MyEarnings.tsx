import { useState, useMemo } from 'react'
import { SummaryCard } from '@components/card'
import { PaginateTable } from '@components/table'
import type { TableColumn } from '@components/table'
import { Modal } from '@components/modal'
import { formatCurrency } from '@constants/currency'
import {
  useGetEarningsAnalyticsQuery,
  useGetPaymentHistoryQuery,
  useGetWithdrawalsQuery,
  useRequestWithdrawalMutation,
  type PaymentHistoryItem,
  type WithdrawalItem,
} from '@store/features/earnings/earningsSlice'
import { useLazyGetVendorOrderByIdQuery } from '@store/features/orders/ordersSlice'
import { loadLogoAsDataUrl, downloadInvoicePdf } from '@helpers/invoicePdf'
import { mapOrderToUi } from '@helpers/orderInvoiceMap'
import { useAppSelector } from '@hooks/redux'
import { selectProfileData } from '@store/features/auth/authReducer'
import { sSnack, eSnack } from '@hooks/useToast'
import Logo from '@assets/svg/logo.svg'

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-orange-100 text-orange-600',
  pending: 'bg-orange-100 text-orange-600',
  Success: 'bg-green-100 text-green-600',
  success: 'bg-green-100 text-green-600',
  Failed: 'bg-red-100 text-red-600',
  failed: 'bg-red-100 text-red-600',
  Processing: 'bg-orange-100 text-orange-600',
  processing: 'bg-orange-100 text-orange-600',
  delivered: 'bg-green-100 text-green-600',
}

const ITEMS_PER_PAGE = 10

function formatDate(val: string | undefined): string {
  if (!val) return '—'
  const d = new Date(val)
  if (Number.isNaN(d.getTime())) return String(val)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const MyEarnings = () => {
  const [activeTab, setActiveTab] = useState<'payment' | 'withdrawals'>('payment')
  const [paymentPage, setPaymentPage] = useState(1)
  const [withdrawalsPage, setWithdrawalsPage] = useState(1)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')

  const profileData = useAppSelector(selectProfileData)
  const [fetchOrder] = useLazyGetVendorOrderByIdQuery()
  const { data: analyticsData } = useGetEarningsAnalyticsQuery()
  const { data: paymentData, isLoading: paymentLoading } = useGetPaymentHistoryQuery({
    page: paymentPage,
    limit: ITEMS_PER_PAGE,
  })
  const { data: withdrawalsData, isLoading: withdrawalsLoading } = useGetWithdrawalsQuery({
    page: withdrawalsPage,
    limit: ITEMS_PER_PAGE,
  })
  const [requestWithdrawal, { isLoading: isWithdrawing }] = useRequestWithdrawalMutation()

  const d = analyticsData?.data ?? {}
  const totalEarning = d.totalEarnings ?? d.totalEarning ?? d.total ?? 0
  const availableEarning = d.availableBalance ?? d.availableEarning ?? d.available ?? 0
  const pendingCOD = d.pendingAmount ?? d.pendingCOD ?? d.pending ?? 0

  const paymentList = useMemo(() => {
    const raw = paymentData?.data?.orders ?? paymentData?.data?.payments ?? paymentData?.data?.data ?? paymentData?.data?.paymentHistory ?? []
    return Array.isArray(raw) ? raw : []
  }, [paymentData])
  const paymentPagination = paymentData?.data?.pagination ?? paymentData?.pagination
  const paymentTotal = paymentPagination?.total ?? paymentData?.data?.total ?? paymentList.length

  const withdrawalsList = useMemo(() => {
    const raw = withdrawalsData?.data?.withdrawals ?? withdrawalsData?.data?.data ?? []
    return Array.isArray(raw) ? raw : []
  }, [withdrawalsData])
  const withdrawalsPagination = withdrawalsData?.data?.pagination
  const withdrawalsTotal = withdrawalsPagination?.total ?? withdrawalsData?.data?.total ?? withdrawalsList.length

  const paymentRows = useMemo(() => {
    return paymentList.map((item: PaymentHistoryItem, index: number) => {
      const amount = item.totalAmount ?? item.amount
      const amountStr = typeof amount === 'number' ? formatCurrency(amount) : (amount != null ? String(amount) : '—')
      const first = item.userId?.firstname ?? ''
      const last = item.userId?.lastname ?? ''
      const customerName = [first, last].filter(Boolean).join(' ') || (item.customerName ?? item.customer ?? '—')
      return {
        rowNum: (paymentPage - 1) * ITEMS_PER_PAGE + index + 1,
        invoiceId: item.invoiceId ?? item._id ?? '—',
        orderId: item.orderId ? `#${item.orderId}` : '—',
        orderIdForApi: item._id ?? '',
        customerName,
        customerEmail: item.customerEmail ?? item.email ?? '—',
        amount: amountStr,
        paymentMethod: 'Cod',
        date: formatDate(item.deliveredAt ?? item.date ?? item.createdAt),
        status: item.paymentStatus ?? item.status ?? '—',
      }
    })
  }, [paymentList, paymentPage])

  const withdrawalRows = useMemo(() => {
    return withdrawalsList.map((item: WithdrawalItem, index: number) => {
      const amount = item.amount
      const amountStr = typeof amount === 'number' ? formatCurrency(amount) : String(amount ?? '—')
      const bd = item.bankDetails
      const bankName = bd?.bankName ?? ''
      const accountNum = String(bd?.accountNumber ?? '')
      const accountHolder = bd?.accountHolderName ?? item.accountHolder ?? '—'
      const bankAccountDisplay = bankName && accountNum
        ? `${bankName} ••••${accountNum.slice(-4)}`
        : (bankName || accountNum || item.bankAccount) ?? '—'
      return {
        rowNum: (withdrawalsPage - 1) * ITEMS_PER_PAGE + index + 1,
        bankAccount: bankAccountDisplay === '—' ? '—' : bankAccountDisplay,
        accountHolder,
        amount: amountStr,
        period: formatDate(item.createdAt ?? item.updatedAt ?? item.date ?? item.period),
        status: item.status ?? '—',
      }
    })
  }, [withdrawalsList, withdrawalsPage])

  const handleDownloadInvoice = async (orderId: string) => {
    if (!orderId) return
    try {
      const res = await fetchOrder(orderId).unwrap()
      const orderData = mapOrderToUi(res?.data)
      const vendorName = profileData?.firstname || profileData?.lastname
        ? `${profileData?.firstname ?? ''} ${profileData?.lastname ?? ''}`.trim()
        : ''
      const vendorEmail = profileData?.email ?? ''
      let logoDataUrl = ''
      try {
        logoDataUrl = await loadLogoAsDataUrl(Logo)
      } catch {
        // use no logo
      }
      downloadInvoicePdf(orderData, vendorName, vendorEmail, logoDataUrl)
      sSnack('Invoice downloaded')
    } catch {
      eSnack('Failed to load order for invoice')
    }
  }

  const paymentColumns: TableColumn[] = useMemo(() => [
    { key: 'rowNum', label: '#' },
    {
      key: 'invoiceId',
      label: 'Invoice ID',
      render: (v, row) => (
        <div>
          <p className="text-sm font-ManropeBold text-gray-800">{String(v)}</p>
          <p className="text-xs text-primary font-Manrope">{String(row.orderId)}</p>
        </div>
      ),
    },
    {
      key: 'customerName',
      label: 'Customer',
      render: (v) => <span className="text-sm font-Manrope text-gray-800">{String(v)}</span>,
    },
    { key: 'amount', label: 'Amount' },
    { key: 'paymentMethod', label: 'Payment Method' },
    { key: 'date', label: 'Date' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => {
        const s = String(v ?? '')
        const label = s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '—'
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-ManropeMedium ${STATUS_COLORS[s] || STATUS_COLORS[label] || 'bg-gray-100 text-gray-600'}`}>
            {label}
          </span>
        )
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => {
        const orderIdForApi = row.orderIdForApi as string | undefined
        return (
          <button
            type="button"
            onClick={() => orderIdForApi && handleDownloadInvoice(orderIdForApi)}
            disabled={!orderIdForApi}
            className="p-1 text-gray-400 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Download invoice"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        )
      },
    },
  ], [handleDownloadInvoice])

  const withdrawalColumns: TableColumn[] = useMemo(() => [
    { key: 'rowNum', label: '#' },
    {
      key: 'bankAccount',
      label: 'Bank Account',
      render: (v, row) => (
        <div>
          <p className="text-sm font-Manrope text-gray-800">{String(v)}</p>
          <p className="text-xs text-primary font-Manrope">{String(row.accountHolder)}</p>
        </div>
      ),
    },
    { key: 'amount', label: 'Amount' },
    { key: 'period', label: 'Period' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => {
        const s = String(v ?? '')
        const label = s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '—'
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-ManropeMedium ${STATUS_COLORS[s] || STATUS_COLORS[label] || 'bg-gray-100 text-gray-600'}`}>
            {label}
          </span>
        )
      },
    },
  ], [])

  const handlePercentageClick = (percent: number) => {
    const total = Number(availableEarning) || 0
    const amount = Math.floor(total * (percent / 100))
    setWithdrawAmount(amount.toString())
  }

  const handleRequestWithdrawal = async () => {
    const amount = Number(withdrawAmount)
    if (!withdrawAmount.trim() || Number.isNaN(amount) || amount <= 0) {
      eSnack('Please enter a valid amount')
      return
    }
    try {
      await requestWithdrawal({ amount }).unwrap()
      sSnack('Withdrawal request submitted successfully')
      setIsWithdrawModalOpen(false)
      setWithdrawAmount('')
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'data' in err
        ? String((err as { data?: { message?: string } }).data?.message ?? 'Failed to submit withdrawal')
        : 'Failed to submit withdrawal'
      eSnack(msg)
    }
  }

  const isLoading = activeTab === 'payment' ? paymentLoading : withdrawalsLoading
  const currentPage = activeTab === 'payment' ? paymentPage : withdrawalsPage
  const setPage = activeTab === 'payment' ? setPaymentPage : setWithdrawalsPage
  const totalResults = activeTab === 'payment' ? paymentTotal : withdrawalsTotal
  const tableData = activeTab === 'payment' ? paymentRows : withdrawalRows

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-ManropeBold text-gray-800">My Earnings</h1>
          <p className="text-sm font-Manrope text-gray-500">Manage your earning and withdrawals</p>
        </div>
        <div className="flex items-center gap-3">
          {/* <button type="button" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary/5 transition-colors font-Manrope text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Export
          </button> */}
          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-ManropeBold text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Request Withdrawal
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-ManropeBold text-gray-800">Earning Dashboard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SummaryCard heading="Total Balance" period="" value={formatCurrency(totalEarning)} barColor="#22D3EE" />
          <SummaryCard heading="Available Balance" period="" value={formatCurrency(availableEarning)} barColor="#3B82F6" />
          <SummaryCard heading="Pending COD" period="" value={formatCurrency(pendingCOD)} barColor="#10B981" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => { setActiveTab('payment'); setPaymentPage(1) }}
            className={`px-6 py-3 text-sm font-ManropeMedium transition-colors relative ${activeTab === 'payment' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Payment History
            {activeTab === 'payment' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
          </button>
          <button
            onClick={() => { setActiveTab('withdrawals'); setWithdrawalsPage(1) }}
            className={`px-6 py-3 text-sm font-ManropeMedium transition-colors relative ${activeTab === 'withdrawals' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Withdrawals History
            {activeTab === 'withdrawals' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
          </button>
        </div>

        <div>
          <h3 className="text-lg font-ManropeBold text-gray-800 mb-4">
            {activeTab === 'payment' ? 'Payment Records' : 'Withdrawals'}
          </h3>
          <PaginateTable
            headers={activeTab === 'payment' ? paymentColumns : withdrawalColumns}
            data={tableData}
            currentPage={currentPage}
            totalResults={totalResults}
            onPageChange={setPage}
            itemsPerPage={ITEMS_PER_PAGE}
            loading={isLoading}
          />
        </div>
      </div>

      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="Request Withdrawal"
        description="Withdraw your earning directly to your bank account."
        actions={[
          { label: 'Cancel', onClick: () => setIsWithdrawModalOpen(false), variant: 'secondary' },
          {
            label: isWithdrawing ? 'Submitting...' : 'Request Withdrawal',
            onClick: handleRequestWithdrawal,
            variant: 'primary',
            disabled: isWithdrawing,
          },
        ]}
      >
        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-ManropeBold text-gray-700">Withdrawal Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">QAR</span>
              <input
                type="number"
                placeholder="Enter amount to withdraw..."
                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-Manrope text-sm"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs font-Manrope">
              <span className="text-gray-500">Available Balance:</span>
              <span className="text-primary font-ManropeBold">{formatCurrency(availableEarning)}</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[25, 50, 75, 100].map((percent) => (
              <button
                key={percent}
                type="button"
                onClick={() => handlePercentageClick(percent)}
                className="py-3 px-2 border border-gray-100 rounded-lg hover:border-primary hover:text-primary transition-all font-ManropeMedium text-sm text-gray-600 bg-white shadow-sm"
              >
                {percent}%
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default MyEarnings
