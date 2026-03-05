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

/** Query params for GET /vendor/orders */
export interface GetVendorOrdersParams {
  page?: number
  limit?: number
  status?: string
  search?: string
  paymentStatus?: string
  startDate?: string
  endDate?: string
}

/** User ref in order list (GET /vendor/orders) */
export interface OrderUserId {
  _id?: string
  firstname?: string
  lastname?: string
  email?: string
}

/** Product line in order list */
export interface OrderProductItem {
  productId?: string
  name?: string
  price?: number
  quantity?: number
  subtotal?: number
  _id?: string
}

/** Shipping address in order */
export interface OrderShippingAddress {
  postalCode?: string
  line1?: string
  line2?: string
  town?: string
  country?: string
  phone?: string
}

/** Single order item in list – matches GET /vendor/orders response */
export interface VendorOrderListItem {
  _id?: string
  orderId?: string
  userId?: OrderUserId
  vendorId?: string
  products?: OrderProductItem[]
  shippingAddress?: OrderShippingAddress
  totalAmount?: number
  tax?: number
  shippingCost?: number
  discount?: number
  status?: string
  paymentStatus?: string
  paymentMethod?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
  [key: string]: unknown
}

/** Pagination in list response */
export interface OrdersPagination {
  total?: number
  page?: number
  limit?: number
  pages?: number
}

/** List response – GET /vendor/orders */
export interface VendorOrdersListResponse {
  status?: number
  message?: string
  data?: {
    orders?: VendorOrderListItem[]
    pagination?: OrdersPagination
    [key: string]: unknown
  }
}

/** Product ref in order detail (products[].productId) */
export interface OrderDetailProductId {
  _id?: string
  name?: string
  images?: string[]
}

/** Product line in order detail – GET /vendor/orders/:id */
export interface OrderDetailProductItem {
  productId?: OrderDetailProductId | string
  name?: string
  price?: number
  quantity?: number
  subtotal?: number
  _id?: string
}

/** User in order detail (data.userId) */
export interface OrderDetailUserId {
  _id?: string
  phone?: string
  firstname?: string
  lastname?: string
  email?: string
}

/** Single order detail – GET /vendor/orders/:id response data */
export interface VendorOrderDetail {
  _id?: string
  orderId?: string
  userId?: OrderDetailUserId
  vendorId?: string
  products?: OrderDetailProductItem[]
  shippingAddress?: OrderShippingAddress
  totalAmount?: number
  tax?: number
  shippingCost?: number
  discount?: number
  status?: string
  paymentStatus?: string
  paymentMethod?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
  trackingSteps?: Array<{ status?: string; date?: string; time?: string; [key: string]: unknown }>
  invoice?: { fileName?: string; size?: string; generatedDate?: string; [key: string]: unknown }
  deliveryProof?: { fileName?: string; status?: string; [key: string]: unknown }
  trackingNumber?: string
  [key: string]: unknown
}

export interface VendorOrderDetailResponse {
  status?: number
  message?: string
  data?: VendorOrderDetail
}

/** Payload for PUT /vendor/orders/:id/status (as per API docs) */
export interface UpdateOrderStatusPayload {
  status: string
  trackingNumber?: string
  notes?: string
}

export const ordersSlice = createApi({
  reducerPath: 'ordersApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['VendorOrders', 'VendorOrderDetail'],
  endpoints: (builder) => ({
    getVendorOrders: builder.query<VendorOrdersListResponse, GetVendorOrdersParams | void>({
      query: (params = {}) => ({
        url: 'vendor/orders',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          ...(params?.status && params.status !== 'all' && { status: params.status }),
          ...(params?.search?.trim() && { search: params.search.trim() }),
          ...(params?.paymentStatus && { paymentStatus: params.paymentStatus }),
          ...(params?.startDate && { startDate: params.startDate }),
          ...(params?.endDate && { endDate: params.endDate }),
        },
      }),
      providesTags: (result) =>
        result?.data?.orders
          ? [
              { type: 'VendorOrders', id: 'LIST' },
              ...result.data.orders.map((o) => ({
                type: 'VendorOrderDetail' as const,
                id: String(o._id ?? o.orderId ?? ''),
              })),
            ]
          : [{ type: 'VendorOrders', id: 'LIST' }],
    }),
    getVendorOrderById: builder.query<VendorOrderDetailResponse, string>({
      query: (id) => ({ url: `vendor/orders/${id}` }),
      providesTags: (_result, _err, id) => [{ type: 'VendorOrderDetail', id }],
    }),
    updateOrderStatus: builder.mutation<
      { status?: number; message?: string; data?: unknown },
      { id: string; payload: UpdateOrderStatusPayload }
    >({
      query: ({ id, payload }) => ({
        url: `vendor/orders/${id}/status`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'VendorOrderDetail', id },
        { type: 'VendorOrders', id: 'LIST' },
      ],
    }),
    cancelOrder: builder.mutation<{ status?: number; message?: string; data?: unknown }, string>({
      query: (id) => ({
        url: `vendor/orders/${id}/cancel`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _err, id) => [
        { type: 'VendorOrderDetail', id },
        { type: 'VendorOrders', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetVendorOrdersQuery,
  useLazyGetVendorOrdersQuery,
  useGetVendorOrderByIdQuery,
  useLazyGetVendorOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
} = ordersSlice
