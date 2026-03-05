import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input, DateInput, FileUpload } from '@components/formsInput'
import { Select } from '@components/select'
import { SimpleTable } from '@components/table'
import type { TableColumn } from '@components/table'
import { Modal } from '@components/modal'
import { sSnack } from '@hooks/useToast'
import type { SelectOption } from '@components/select'

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
]

const LEGAL_ENTITY_OPTIONS: SelectOption[] = [
  { value: 'corporation', label: 'Corporation (C-Corp)' },
  { value: 'llc', label: 'LLC' },
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
]

const CURRENCY_OPTIONS: SelectOption[] = [
  { value: 'USD', label: 'USD' },
  { value: 'QAR', label: 'QAR' },
  { value: 'EUR', label: 'EUR' },
]

const ACCOUNT_TYPE_OPTIONS: SelectOption[] = [
  { value: 'business_checking', label: 'Business Checking' },
  { value: 'business_savings', label: 'Business Savings' },
]

interface DocumentRow {
  rowNum: number
  documentNumber: string
  link: string
  expiryDate: string
}

const defaultDocuments: DocumentRow[] = [
  { rowNum: 1, documentNumber: '1232141232121', link: 'https://veritas.com/verify/doc/...', expiryDate: 'Jan 15, 2025' },
  { rowNum: 2, documentNumber: 'DOC-9876543210', link: 'https://veritas.com/verify/doc/...', expiryDate: 'Feb 20, 2025' },
  { rowNum: 3, documentNumber: 'BRN-2847392847', link: 'https://veritas.com/verify/doc/...', expiryDate: 'Mar 10, 2025' },
]

const EditCompany = () => {
  const navigate = useNavigate()
  const [primaryContact, setPrimaryContact] = useState('Maddie Fox')
  const [primaryEmail, setPrimaryEmail] = useState('operations@petcare.com')
  const [primaryPhone, setPrimaryPhone] = useState('(214) 555-0123')
  const [status, setStatus] = useState('active')
  const [companyName, setCompanyName] = useState('Global Logistics Corp')
  const [legalEntityType, setLegalEntityType] = useState('corporation')
  const [businessAddress, setBusinessAddress] = useState('1234 Market Street, Suite 500, San Francisco, CA 94103')
  const [companyEmail, setCompanyEmail] = useState('operations@petcare.com')
  const [businessRegNumber, setBusinessRegNumber] = useState('BRN-2847392847')
  const [taxId, setTaxId] = useState('12-123123456')
  const [website, setWebsite] = useState('www.techgearsolutions.com')
  const [companyPhone, setCompanyPhone] = useState('(214) 555-0125')
  const [bankName, setBankName] = useState('Wells Fargo Bank')
  const [accountNumber, setAccountNumber] = useState('1234567890')
  const [currency, setCurrency] = useState('USD')
  const [accountHolderName, setAccountHolderName] = useState('PetShop')
  const [routingNumber, setRoutingNumber] = useState('121000248')
  const [accountType, setAccountType] = useState('business_checking')
  const [documents, setDocuments] = useState<DocumentRow[]>(defaultDocuments)
  const [isAddDocModalOpen, setIsAddDocModalOpen] = useState(false)
  const [docTitle, setDocTitle] = useState('')
  const [docNumber, setDocNumber] = useState('')
  const [verificationUrl, setVerificationUrl] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [docFiles, setDocFiles] = useState<File[]>([])

  const handleBack = () => navigate(-1)
  const handleCancel = () => navigate(-1)
  const handleSave = () => {
    sSnack('Company information saved successfully')
    navigate(-1)
  }

  const handleAddDocument = () => {
    if (!docTitle.trim() || !docNumber.trim()) return
    const newRow: DocumentRow = {
      rowNum: documents.length + 1,
      documentNumber: docNumber,
      link: verificationUrl || '—',
      expiryDate: expiryDate || '—',
    }
    setDocuments((prev) => [...prev, newRow])
    setDocTitle('')
    setDocNumber('')
    setVerificationUrl('')
    setExpiryDate('')
    setDocFiles([])
    setIsAddDocModalOpen(false)
    sSnack('Document added')
  }

  const documentColumns: TableColumn[] = useMemo(() => [
    { key: 'rowNum', label: '#' },
    { key: 'documentNumber', label: 'Document Number' },
    {
      key: 'link',
      label: 'Link',
      render: (v) => (
        <a href={String(v)} target="_blank" rel="noopener noreferrer" className="text-primary font-Manrope hover:underline truncate block max-w-[200px]">
          {String(v)}
        </a>
      ),
    },
    { key: 'expiryDate', label: 'Expiry Date' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button type="button" className="p-1.5 text-gray-500 hover:text-primary transition-colors" aria-label="Download">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </button>
          <button type="button" className="p-1.5 text-gray-500 hover:text-primary transition-colors" aria-label="View">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      ),
    },
  ], [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="p-1.5 -ml-1.5 text-gray-600 hover:text-primary rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Back"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-ManropeBold text-gray-800">Edit Company Information</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg border border-primary text-primary bg-white hover:bg-primary/5 font-Manrope text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 font-ManropeBold text-sm transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main form content */}
        <div className="flex-1 space-y-6">
          {/* Company Information */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-lg font-ManropeBold text-gray-800 mb-2">Company Information</h2>
            <div className="border-b border-gray-200 mb-4" />
            <div className="flex flex-col sm:flex-row gap-6 mb-6">
              <div className="flex flex-col items-start gap-2">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  <span className="text-sm font-ManropeBold text-primary">LOGISTICS</span>
                </div>
                <div>
                  <p className="text-sm font-ManropeBold text-gray-800">Profile Picture</p>
                  <p className="text-xs font-Manrope text-gray-500">Upload a photo for shipper&apos;s profile</p>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary/5 font-Manrope text-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload New Picture
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="h-10 rounded-lg" />
              <Select label="Legal Entity Type" value={legalEntityType} onValueChange={setLegalEntityType} options={LEGAL_ENTITY_OPTIONS} rounded="lg" />
              <div className="md:col-span-2">
                <Input label="Business Address" value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} className="h-10 rounded-lg" />
              </div>
              <Input label="Email" type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} className="h-10 rounded-lg" />
              <Input label="Business Registration Number" value={businessRegNumber} onChange={(e) => setBusinessRegNumber(e.target.value)} className="h-10 rounded-lg" />
              <Input label="Tax ID / EIN" value={taxId} onChange={(e) => setTaxId(e.target.value)} className="h-10 rounded-lg" />
              <Input label="Website" value={website} onChange={(e) => setWebsite(e.target.value)} className="h-10 rounded-lg" />
              <Input label="Phone" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} className="h-10 rounded-lg" />
            </div>
          </div>

          {/* Bank & Payout Details */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-lg font-ManropeBold text-gray-800 mb-2">Bank & Payout Details</h2>
            <div className="border-b border-gray-200 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Bank Name" value={bankName} onChange={(e) => setBankName(e.target.value)} className="h-10 rounded-lg" />
              <Input label="Account Holder Name" value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} className="h-10 rounded-lg" />
              <Input label="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="h-10 rounded-lg" />
              <Input label="Routing Number" value={routingNumber} onChange={(e) => setRoutingNumber(e.target.value)} className="h-10 rounded-lg" />
              <Select label="Currency" value={currency} onValueChange={setCurrency} options={CURRENCY_OPTIONS} rounded="lg" />
              <Select label="Account Type" value={accountType} onValueChange={setAccountType} options={ACCOUNT_TYPE_OPTIONS} rounded="lg" />
            </div>
          </div>

          {/* Documents & Verification */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
              <h2 className="text-lg font-ManropeBold text-gray-800">Documents & Verification</h2>
              <button
                type="button"
                onClick={() => setIsAddDocModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 font-ManropeBold text-sm transition-colors shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Document
              </button>
            </div>
            <div className="border-b border-gray-200 mb-4" />
            <SimpleTable headers={documentColumns} data={documents} />
          </div>
        </div>

        {/* Right panel - Primary Contact & Status */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-6 sticky top-6">
            <div>
              <h3 className="text-base font-ManropeBold text-gray-800 mb-2">Primary Contact</h3>
              <div className="border-b border-gray-200 mb-4" />
              <div className="space-y-3">
                <Input label="Primary Contact" value={primaryContact} onChange={(e) => setPrimaryContact(e.target.value)} className="h-10 rounded-lg" />
                <Input label="Email" type="email" value={primaryEmail} onChange={(e) => setPrimaryEmail(e.target.value)} className="h-10 rounded-lg" />
                <Input label="Phone" value={primaryPhone} onChange={(e) => setPrimaryPhone(e.target.value)} className="h-10 rounded-lg" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-ManropeBold text-gray-800 mb-2">Status</h3>
              <div className="border-b border-gray-200 mb-4" />
              <Select label="Status" value={status} onValueChange={setStatus} options={STATUS_OPTIONS} rounded="lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Add Compliance Document Modal */}
      <Modal
        isOpen={isAddDocModalOpen}
        onClose={() => setIsAddDocModalOpen(false)}
        title="Add Compliance Document"
        description="Add a new compliance document for your company."
        actions={[
          { label: 'Cancel', onClick: () => setIsAddDocModalOpen(false), variant: 'secondary' },
          { label: 'Add Document', onClick: handleAddDocument, variant: 'primary' },
        ]}
      >
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Document Title"
              placeholder="Document Title"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="h-10 rounded-lg"
            />
            <Input
              label="Document Number"
              placeholder="Document Number"
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              className="h-10 rounded-lg"
            />
          </div>
          <Input
            label="Verification URL"
            placeholder="Verification URL"
            value={verificationUrl}
            onChange={(e) => setVerificationUrl(e.target.value)}
            className="h-10 rounded-lg"
          />
          <DateInput
            label="Expiry Date"
            placeholder="Expiry Date"
            value={expiryDate}
            onChange={setExpiryDate}
            className="h-10 rounded-lg"
          />
          <FileUpload
            label="Upload Document"
            accept=".jpg,.jpeg,.png,.pdf"
            supportedFormats="Supported: JPG, PNG, JPEG, PDF (Max 10MB each)"
            placeholder="Drag and drop files here, or click to browse"
            onFilesChange={setDocFiles}
          />
        </div>
      </Modal>
    </div>
  )
}

export default EditCompany
