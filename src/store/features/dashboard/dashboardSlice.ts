import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../../index'

const API_BASE_URL = 'http://18.130.102.234:9078'
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

/** period for analytics/sales: day | week | month | year */
export type AnalyticsPeriod = 'day' | 'week' | 'month' | 'year'

/** Dashboard API response – matches backend: products, lowStockProducts, orders, recentOrders, revenue */
export interface DashboardResponse {
  status?: number
  message?: string
  data?: {
    products?: { total?: number; active?: number; pending?: number }
    lowStockProducts?: Array<{ _id?: string; name?: string; stock?: number }>
    orders?: { total?: number; pending?: number; processing?: number; delivered?: number }
    recentOrders?: Array<{
      _id?: string
      orderId?: string
      orderNumber?: string
      customer?: string
      customerName?: string
      product?: string
      productName?: string
      deliveryAddress?: string
      address?: string
      amount?: number | string
      total?: number
      status?: string
      date?: string
      createdAt?: string
      [key: string]: unknown
    }>
    revenue?: { total?: number; tax?: number; shipping?: number }
  }
}

/** Analytics sales API response – matches backend: salesData, topProducts, and optional analytics fields */
export interface AnalyticsSalesResponse {
  status?: number
  message?: string
  data?: {
    salesData?: Array<{
      date?: string
      day?: string
      label?: string
      total?: number
      amount?: number
      thisWeek?: number
      lastWeek?: number
      [key: string]: unknown
    }>
    topProducts?: Array<{
      _id?: string
      name?: string
      productName?: string
      quantity?: number
      total?: number
      [key: string]: unknown
    }>
    conversionRate?: number
    conversionChart?: Array<{ name?: string; value?: number; color?: string; [key: string]: unknown }>
    visitsByDevice?: Array<{ icon?: string; label?: string; percent?: string; [key: string]: unknown }>
    usersVisits?: number | string
    ageDistribution?: Array<{ name?: string; value?: number; color?: string; [key: string]: unknown }>
    categoryPerformance?: Array<{ name?: string; value?: number; color?: string; [key: string]: unknown }>
  }
}

export const dashboardSlice = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Dashboard', 'AnalyticsSales'],
  endpoints: (builder) => ({
    getDashboard: builder.query<DashboardResponse, void>({
      query: () => ({ url: 'vendor/dashboard' }),
      providesTags: ['Dashboard'],
    }),
    getAnalyticsSales: builder.query<AnalyticsSalesResponse, { period?: AnalyticsPeriod }>({
      query: ({ period = 'month' }) => ({
        url: 'vendor/analytics/sales',
        params: { period },
      }),
      providesTags: (_result, _err, { period }) => [{ type: 'AnalyticsSales', id: period }],
    }),
  }),
})

export const {
  useGetDashboardQuery,
  useLazyGetDashboardQuery,
  useGetAnalyticsSalesQuery,
  useLazyGetAnalyticsSalesQuery,
} = dashboardSlice
