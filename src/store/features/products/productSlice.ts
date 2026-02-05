import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../../index'

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://18.130.102.234:9078/api/',
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

export interface ProductItem {
  _id?: string
  productId?: string
  productName?: string
  name?: string
  sku?: string
  category?: string
  inventory?: number
  quantity?: number
  price?: string | number
  dateAdded?: string
  dateAddedRaw?: string
  createdAt?: string
  status?: string
  [key: string]: unknown
}

export interface GetProductsResponse {
  data?: ProductItem[]
  products?: ProductItem[]
  total?: number
  totalCount?: number
  totalResults?: number
  page?: number
  limit?: number
  message?: string
  status?: number
}

export const productSlice = createApi({
  reducerPath: 'productApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Products'],
  endpoints: (builder) => ({
    getProducts: builder.query<GetProductsResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => ({
        url: 'vendor/products',
        params: { page, limit },
      }),
      providesTags: ['Products'],
    }),
    addProduct: builder.mutation<
      { data?: unknown; message?: string },
      FormData
    >({
      query: (body) => ({
        url: 'vendor/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Products'],
    }),
  }),
})

export const { useGetProductsQuery, useLazyGetProductsQuery, useAddProductMutation } = productSlice
