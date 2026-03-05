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

const baseQueryWithReauth = async (args: Parameters<typeof baseQuery>[0], api: Parameters<typeof baseQuery>[1], extraOptions: Parameters<typeof baseQuery>[2]) => {
  const result = await baseQuery(args, api, extraOptions)
  const err = result.error as { status?: number } | undefined
  if (err && (err.status === 401 || err.status === 403)) {
    window.dispatchEvent(new CustomEvent('unauthorized', { detail: { status: err.status } }))
  }
  return result
}

/** GET /vendor/bank-details – response data */
export interface BankDetailsData {
  bankName?: string
  accountHolderName?: string
  accountNumber?: string
  accountType?: string
  [key: string]: unknown
}

export interface GetBankDetailsResponse {
  status?: number
  message?: string
  data?: BankDetailsData
}

/** POST /vendor/bank-details – request body (payload) */
export interface PostBankDetailsPayload {
  bankName: string
  accountHolderName: string
  accountNumber: string
  accountType: string
}

export interface PostBankDetailsResponse {
  status?: number
  message?: string
  data?: unknown
}

export const bankDetailsSlice = createApi({
  reducerPath: 'bankDetailsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['BankDetails'],
  endpoints: (builder) => ({
    getBankDetails: builder.query<GetBankDetailsResponse, void>({
      query: () => ({ url: 'vendor/bank-details' }),
      providesTags: ['BankDetails'],
    }),
    postBankDetails: builder.mutation<PostBankDetailsResponse, PostBankDetailsPayload>({
      query: (body) => ({
        url: 'vendor/bank-details',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['BankDetails'],
    }),
  }),
})

export const {
  useGetBankDetailsQuery,
  usePostBankDetailsMutation,
} = bankDetailsSlice
