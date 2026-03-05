import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../../index'

const API_BASE_URL = 'https://api.souvenir.live'
const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/api/`,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  const result = await baseQuery(args, api, extraOptions)
  if (result.error && (result.error.status === 401 || result.error.status === 403)) {
    window.dispatchEvent(new CustomEvent('unauthorized', { detail: { status: result.error.status } }))
  }
  return result
}

/** GET /vendor/earnings/analytics – summary (total, available, pending COD, etc.) */
export interface EarningsAnalyticsParams {
  // optional query params if API supports
}

export interface EarningsAnalyticsResponse {
  status?: number
  message?: string
  data?: {
    totalEarnings?: number
    totalEarning?: number
    total?: number
    availableBalance?: number
    availableEarning?: number
    available?: number
    pendingAmount?: number
    pendingCOD?: number
    pending?: number
    [key: string]: unknown
  }
}

/** GET /vendor/earnings/payment-history */
export interface PaymentHistoryParams {
  page?: number
  limit?: number
  status?: string
  startDate?: string
  endDate?: string
}

/** API returns data.orders[] with userId, orderId, totalAmount, etc. */
export interface PaymentHistoryItem {
  _id?: string
  orderId?: string
  totalAmount?: number
  paymentStatus?: string
  status?: string
  createdAt?: string
  deliveredAt?: string
  userId?: {
    _id?: string
    firstname?: string
    lastname?: string
    [key: string]: unknown
  }
  invoiceId?: string
  customerName?: string
  customerEmail?: string
  accountInfo?: string
  amount?: number | string
  paymentMethod?: string
  date?: string
  [key: string]: unknown
}

export interface PaymentHistoryResponse {
  status?: number
  message?: string
  data?: {
    orders?: PaymentHistoryItem[]
    payments?: PaymentHistoryItem[]
    data?: PaymentHistoryItem[]
    paymentHistory?: PaymentHistoryItem[]
    total?: number
    pagination?: { total?: number; page?: number; limit?: number; pages?: number }
    [key: string]: unknown
  }
  pagination?: { total?: number; page?: number; limit?: number; pages?: number }
}

/** GET /vendor/withdrawals */
export interface WithdrawalsParams {
  page?: number
  limit?: number
  status?: string
  startDate?: string
  endDate?: string
}

/** API returns withdrawals[] with bankDetails, amount, status, createdAt */
export interface WithdrawalItem {
  _id?: string
  vendorId?: string
  amount?: number
  status?: string
  bankDetails?: {
    accountHolderName?: string
    accountNumber?: string
    accountType?: string
    bankName?: string
    [key: string]: unknown
  }
  createdAt?: string
  updatedAt?: string
  bankAccount?: string
  accountHolder?: string
  commission?: string
  period?: string
  date?: string
  [key: string]: unknown
}

export interface WithdrawalsResponse {
  status?: number
  message?: string
  data?: {
    withdrawals?: WithdrawalItem[]
    data?: WithdrawalItem[]
    total?: number
    pagination?: { total?: number; page?: number; limit?: number; pages?: number }
    [key: string]: unknown
  }
}

/** POST /vendor/withdrawals */
export interface RequestWithdrawalPayload {
  amount: number
}

export interface RequestWithdrawalResponse {
  status?: number
  message?: string
  data?: unknown
}

export const earningsSlice = createApi({
  reducerPath: 'earningsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['EarningsAnalytics', 'PaymentHistory', 'Withdrawals'],
  endpoints: (builder) => ({
    getEarningsAnalytics: builder.query<EarningsAnalyticsResponse, EarningsAnalyticsParams | void>({
      query: () => ({ url: 'vendor/earnings/analytics' }),
      providesTags: ['EarningsAnalytics'],
    }),
    getPaymentHistory: builder.query<PaymentHistoryResponse, PaymentHistoryParams | void>({
      query: (params = {}) => ({
        url: 'vendor/earnings/payment-history',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          ...(params?.status && { status: params.status }),
          ...(params?.startDate && { startDate: params.startDate }),
          ...(params?.endDate && { endDate: params.endDate }),
        },
      }),
      providesTags: ['PaymentHistory'],
    }),
    getWithdrawals: builder.query<WithdrawalsResponse, WithdrawalsParams | void>({
      query: (params = {}) => ({
        url: 'vendor/withdrawals',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          ...(params?.status && { status: params.status }),
          ...(params?.startDate && { startDate: params.startDate }),
          ...(params?.endDate && { endDate: params.endDate }),
        },
      }),
      providesTags: ['Withdrawals'],
    }),
    requestWithdrawal: builder.mutation<RequestWithdrawalResponse, RequestWithdrawalPayload>({
      query: (body) => ({
        url: 'vendor/withdrawals',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['EarningsAnalytics', 'Withdrawals'],
    }),
  }),
})

export const {
  useGetEarningsAnalyticsQuery,
  useGetPaymentHistoryQuery,
  useGetWithdrawalsQuery,
  useRequestWithdrawalMutation,
} = earningsSlice
