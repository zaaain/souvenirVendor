import { useState, useMemo } from 'react'
import { SummaryCard } from '@components/card'
import { PaginateTable } from '@components/table'
import type { TableColumn } from '@components/table'
import { Modal } from '@components/modal'

const PAYMENT_HISTORY_DATA = [
  { id: 1, invoiceId: 'TXN-2025-48290', orderId: '#ORD-10563', customerName: 'James Patterson', customerEmail: 'j.patterson@email.com', accountInfo: '************ 1234', amount: '$123,000', paymentMethod: 'MasterCard', date: 'Jan 15, 2025', status: 'Pending' },
  { id: 2, invoiceId: 'TXN-2025-48290', orderId: '#ORD-10563', customerName: 'James Patterson', customerEmail: 'j.patterson@email.com', accountInfo: '************ 1234', amount: '$123,000', paymentMethod: 'VISA', date: 'Jan 15, 2025', status: 'Success' },
  { id: 3, invoiceId: 'TXN-2025-48290', orderId: '#ORD-10563', customerName: 'James Patterson', customerEmail: 'j.patterson@email.com', accountInfo: '************ 1234', amount: '$123,000', paymentMethod: 'COD', date: 'Jan 15, 2025', status: 'Failed' },
  { id: 4, invoiceId: 'TXN-2025-48290', orderId: '#ORD-10563', customerName: 'James Patterson', customerEmail: 'j.patterson@email.com', accountInfo: '************ 1234', amount: '$123,000', paymentMethod: 'COD', date: 'Jan 15, 2025', status: 'Success' },
  { id: 5, invoiceId: 'TXN-2025-48290', orderId: '#ORD-10563', customerName: 'James Patterson', customerEmail: 'j.patterson@email.com', accountInfo: '************ 1234', amount: '$123,000', paymentMethod: 'MasterCard', date: 'Jan 15, 2025', status: 'Success' },
  { id: 6, invoiceId: 'TXN-2025-48290', orderId: '#ORD-10563', customerName: 'James Patterson', customerEmail: 'j.patterson@email.com', accountInfo: '************ 1234', amount: '$123,000', paymentMethod: 'VISA', date: 'Jan 15, 2025', status: 'Failed' },
]

const WITHDRAWALS_HISTORY_DATA = [
  { id: 1, bankAccount: '************ 1234', accountHolder: 'Maddie Fox', amount: '$123,000', commission: '$324.00 (10%)', period: 'Jan 1-15, 2025', status: 'Processing' },
  { id: 2, bankAccount: '************ 1234', accountHolder: 'Maddie Fox', amount: '$123,000', commission: '$324.00 (10%)', period: 'Jan 1-15, 2025', status: 'Success' },
  { id: 3, bankAccount: '************ 1234', accountHolder: 'Maddie Fox', amount: '$123,000', commission: '$324.00 (10%)', period: 'Jan 1-15, 2025', status: 'Success' },
  { id: 4, bankAccount: '************ 1234', accountHolder: 'Maddie Fox', amount: '$123,000', commission: '$324.00 (10%)', period: 'Jan 1-15, 2025', status: 'Success' },
  { id: 5, bankAccount: '************ 1234', accountHolder: 'Maddie Fox', amount: '$123,000', commission: '$324.00 (10%)', period: 'Jan 1-15, 2025', status: 'Success' },
  { id: 6, bankAccount: '************ 1234', accountHolder: 'Maddie Fox', amount: '$123,000', commission: '$324.00 (10%)', period: 'Jan 1-15, 2025', status: 'Success' },
]

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-orange-100 text-orange-600',
  Success: 'bg-green-100 text-green-600',
  Failed: 'bg-red-100 text-red-600',
  Processing: 'bg-orange-100 text-orange-600',
}

const ITEMS_PER_PAGE = 10

const MyEarnings = () => {
  const [activeTab, setActiveTab] = useState<'payment' | 'withdrawals'>('payment')
  const [page, setPage] = useState(1)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')

  const paymentColumns: TableColumn[] = [
    { key: 'rowNum', label: '#' },
    { 
      key: 'invoiceId', 
      label: 'Invoice ID',
      render: (v, row) => (
        <div>
          <p className="text-sm font-ManropeBold text-gray-800">{String(v)}</p>
          <p className="text-xs text-primary font-Manrope">{String(row.orderId)}</p>
        </div>
      )
    },
    { 
      key: 'customerName', 
      label: 'Customer',
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
             <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
             </svg>
          </div>
          <div>
            <p className="text-sm font-Manrope text-gray-800">{String(v)}</p>
            <p className="text-xs text-primary font-Manrope underline cursor-pointer">{String(row.customerEmail)}</p>
          </div>
        </div>
      )
    },
    { key: 'accountInfo', label: 'Account Information' },
    { key: 'amount', label: 'Amount' },
    { key: 'paymentMethod', label: 'Payment Method' },
    { key: 'date', label: 'Date' },
    { 
      key: 'status', 
      label: 'Status',
      render: (v) => (
        <span className={`px-3 py-1 rounded-full text-xs font-ManropeMedium ${STATUS_COLORS[String(v)] || 'bg-gray-100 text-gray-600'}`}>
          {String(v)}
        </span>
      )
    },
    { 
      key: 'actions', 
      label: 'Actions',
      render: () => (
        <button className="p-1 text-gray-400 hover:text-primary transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      )
    },
  ]

  const withdrawalColumns: TableColumn[] = [
    { key: 'rowNum', label: '#' },
    { 
      key: 'bankAccount', 
      label: 'Bank Account',
      render: (v, row) => (
        <div>
          <p className="text-sm font-Manrope text-gray-800">{String(v)}</p>
          <p className="text-xs text-primary font-Manrope">{String(row.accountHolder)}</p>
        </div>
      )
    },
    { key: 'amount', label: 'Amount' },
    { key: 'commission', label: 'Commission' },
    { key: 'period', label: 'Period' },
    { 
      key: 'status', 
      label: 'Status',
      render: (v) => (
        <span className={`px-3 py-1 rounded-full text-xs font-ManropeMedium ${STATUS_COLORS[String(v)] || 'bg-gray-100 text-gray-600'}`}>
          {String(v)}
        </span>
      )
    },
  ]

  const currentData = useMemo(() => {
    const data = activeTab === 'payment' ? PAYMENT_HISTORY_DATA : WITHDRAWALS_HISTORY_DATA
    return data.map((item, index) => ({ ...item, rowNum: (page - 1) * ITEMS_PER_PAGE + index + 1 }))
  }, [activeTab, page])

  const handlePercentageClick = (percent: number) => {
    // Mock calculation based on $123,743
    const total = 123743
    const amount = Math.floor(total * (percent / 100))
    setWithdrawAmount(amount.toString())
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-ManropeBold text-gray-800">My Earnings</h1>
          <p className="text-sm font-Manrope text-gray-500">Manage your earning and withdrawals</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary/5 transition-colors font-Manrope text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Export
          </button>
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

      {/* Summary Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-ManropeBold text-gray-800">Earning Dashboard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SummaryCard 
            heading="Total Earning"
            period=""
            value="$248,592.00"
            barColor="#22D3EE" // Cyan
          />
          <SummaryCard 
            heading="Available Earning"
            period=""
            value="$123,743"
            barColor="#3B82F6" // Blue
          />
          <SummaryCard 
            heading="Pending COD"
            period=""
            value="$18,420.00"
            barColor="#10B981" // Green/Emerald
          />
        </div>
      </div>

      {/* Tabs and Table */}
      <div className="space-y-4">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => { setActiveTab('payment'); setPage(1); }}
            className={`px-6 py-3 text-sm font-ManropeMedium transition-colors relative ${
              activeTab === 'payment' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Payment History
            {activeTab === 'payment' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => { setActiveTab('withdrawals'); setPage(1); }}
            className={`px-6 py-3 text-sm font-ManropeMedium transition-colors relative ${
              activeTab === 'withdrawals' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Withdrawals History
            {activeTab === 'withdrawals' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
            )}
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
           <div className="p-5 border-b border-gray-100">
              <h3 className="text-lg font-ManropeBold text-gray-800">
                {activeTab === 'payment' ? 'Payment Records' : 'Withdrawals'}
              </h3>
           </div>
           <PaginateTable 
             headers={activeTab === 'payment' ? paymentColumns : withdrawalColumns}
             data={currentData}
             currentPage={page}
             totalResults={147}
             onPageChange={setPage}
             itemsPerPage={ITEMS_PER_PAGE}
           />
        </div>
      </div>

      {/* Withdrawal Modal */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="Request Withdrawal"
        description="Withdraw your earning directly to your bank account."
        actions={[
          {
            label: 'Cancel',
            onClick: () => setIsWithdrawModalOpen(false),
            variant: 'secondary'
          },
          {
            label: 'Request Withdrawal',
            onClick: () => {
              console.log('Requesting withdrawal for:', withdrawAmount)
              setIsWithdrawModalOpen(false)
            },
            variant: 'primary'
          }
        ]}
      >
        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-ManropeBold text-gray-700">Withdrawal Amount</label>
            <div className="relative">
               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
               </span>
               <input 
                 type="number"
                 placeholder="Enter amount to withdraw..."
                 className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-Manrope text-sm"
                 value={withdrawAmount}
                 onChange={(e) => setWithdrawAmount(e.target.value)}
               />
            </div>
            <div className="flex items-center gap-1.5 text-xs font-Manrope">
              <span className="text-gray-500">Available Earning:</span>
              <span className="text-primary font-ManropeBold">$123,743</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
             {[25, 50, 75, 100].map((percent) => (
               <button
                 key={percent}
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
