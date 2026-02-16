import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../../index'

export const API_BASE_URL = 'https://api.souvenir.live'
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

// API response: { status, message, data: [{ _id, name, description }] }; payload mein category = selected _id
export interface CategoryItem {
  _id?: string
  name?: string
  description?: string
  [key: string]: unknown
}

export interface GetCategoriesResponse {
  data?: CategoryItem[]
  categories?: CategoryItem[]
  message?: string
  status?: number
}

export const productSlice = createApi({
  reducerPath: 'productApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Products', 'Categories'],
  endpoints: (builder) => ({
    getCategories: builder.query<GetCategoriesResponse, void>({
      query: () => ({ url: 'vendor/categories' }),
      providesTags: ['Categories'],
    }),
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
    getProductById: builder.query<
      { data?: ProductItem; message?: string } | ProductItem,
      string
    >({
      query: (id) => ({ url: `vendor/products/${id}` }),
      providesTags: (_result, _err, id) => [{ type: 'Products', id }],
    }),
    updateProduct: builder.mutation<
      { data?: unknown; message?: string },
      { id: string; body: FormData }
    >({
      query: ({ id, body }) => ({
        url: `vendor/products/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => ['Products', { type: 'Products', id }],
    }),
    deleteProduct: builder.mutation<
      { message?: string },
      string
    >({
      query: (id) => ({
        url: `vendor/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Products'],
    }),
  }),
})

export const {
  useGetProductsQuery,
  useLazyGetProductsQuery,
  useGetCategoriesQuery,
  useGetProductByIdQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productSlice
