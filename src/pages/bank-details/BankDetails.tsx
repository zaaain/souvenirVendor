import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Input } from '@components/formsInput'
import { Select } from '@components/select'
import { bankDetailsSchema, type BankDetailsFormData } from '@helpers/schemas'
import { useGetBankDetailsQuery, usePostBankDetailsMutation } from '@store/features/bankDetails/bankDetailsSlice'
import { sSnack, eSnack } from '@hooks/useToast'
import type { SelectOption } from '@components/select'

const ACCOUNT_TYPE_OPTIONS: SelectOption[] = [
  { value: 'savings', label: 'Savings' },
  { value: 'current', label: 'Current' },
]

const BankDetails = () => {
  const navigate = useNavigate()
  const { data: bankData, isLoading } = useGetBankDetailsQuery()
  const [postBankDetails, { isLoading: isSubmitting }] = usePostBankDetailsMutation()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BankDetailsFormData>({
    resolver: yupResolver(bankDetailsSchema),
    defaultValues: {
      bankName: '',
      accountHolderName: '',
      accountNumber: '',
      accountType: '',
    },
  })

  const apiData = bankData?.data
  useEffect(() => {
    if (!apiData) return
    reset({
      bankName: apiData.bankName ?? '',
      accountHolderName: apiData.accountHolderName ?? '',
      accountNumber: apiData.accountNumber ?? '',
      accountType: apiData.accountType ?? '',
    })
  }, [apiData, reset])

  const handleBack = () => navigate(-1)
  const handleCancel = () => navigate(-1)

  const onSave = handleSubmit(async (data) => {
    try {
      await postBankDetails({
        bankName: data.bankName.trim(),
        accountHolderName: data.accountHolderName.trim(),
        accountNumber: data.accountNumber.trim(),
        accountType: data.accountType.trim(),
      }).unwrap()
      sSnack('Bank details saved successfully')
      navigate(-1)
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'data' in err
          ? String((err as { data?: { message?: string } }).data?.message ?? 'Failed to save bank details')
          : 'Failed to save bank details'
      eSnack(msg)
    }
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 rounded-lg bg-gray-200 animate-pulse" />
        <div className="h-64 rounded-xl bg-gray-100 animate-pulse" />
      </div>
    )
  }

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
          <h1 className="text-2xl font-ManropeBold text-gray-800">Bank Details</h1>
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
            onClick={onSave}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 font-ManropeBold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Bank & Payout Details */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h2 className="text-lg font-ManropeBold text-gray-800 mb-2">Bank & Payout Details</h2>
        <div className="border-b border-gray-200 mb-4" />
        <form onSubmit={onSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="bankName"
            control={control}
            render={({ field }) => (
              <Input
                label="Bank Name"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.bankName?.message}
                className="h-10 md:h-10 rounded-lg"
                placeholder="e.g. State Bank"
              />
            )}
          />
          <Controller
            name="accountHolderName"
            control={control}
            render={({ field }) => (
              <Input
                label="Account Holder Name"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.accountHolderName?.message}
                className="h-10 md:h-10 rounded-lg"
                placeholder="e.g. Vendor Shop"
              />
            )}
          />
          <Controller
            name="accountNumber"
            control={control}
            render={({ field }) => (
              <Input
                label="Account Number"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.accountNumber?.message}
                className="h-10 md:h-10 rounded-lg"
                placeholder="e.g. 1234567890123456"
              />
            )}
          />
          <Controller
            name="accountType"
            control={control}
            render={({ field }) => (
              <Select
                label="Account Type"
                value={field.value}
                onValueChange={field.onChange}
                options={ACCOUNT_TYPE_OPTIONS}
                rounded="lg"
                error={errors.accountType?.message}
                className="[&_select]:h-10 [&_select]:md:h-10"
                placeholder="Select account type"
              />
            )}
          />
        </form>
      </div>
    </div>
  )
}

export default BankDetails
