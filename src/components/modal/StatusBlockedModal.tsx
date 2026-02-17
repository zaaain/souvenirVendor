import { createPortal } from 'react-dom'

export type VendorStatus = 'pending' | 'rejected'

export interface StatusBlockedModalProps {
  isOpen: boolean
  status: VendorStatus
  onLogout: () => void
}

const messages: Record<VendorStatus, { heading: string; line: string }> = {
  pending: {
    heading: 'Account Pending',
    line: 'Your status is currently pending. Please wait for approval.',
  },
  rejected: {
    heading: 'Account Not Approved',
    line: 'Your status is currently rejected. Please contact support.',
  },
}

function StatusBlockedModal({ isOpen, status, onLogout }: StatusBlockedModalProps) {
  if (!isOpen) return null

  const { heading, line } = messages[status]

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-modal-title"
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
    >
      <div className="fixed inset-0 bg-black/50 cursor-default" aria-hidden />
      <div
        className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={onLogout}
            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 font-ManropeBold text-sm transition-colors"
          >
            Logout
          </button>
        </div>
        <h2 id="status-modal-title" className="text-left text-lg font-ManropeBold text-gray-800">
          {heading}
        </h2>
        <p className="mt-2 text-left text-sm font-Manrope text-gray-600">
          {line}
        </p>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}

export default StatusBlockedModal
