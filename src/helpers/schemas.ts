import * as yup from 'yup'

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .email('Invalid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  rememberMe: yup.boolean().default(false),
})

export const registerSchema = yup.object().shape({
  firstname: yup
    .string()
    .trim()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters'),
  lastname: yup
    .string()
    .trim()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  email: yup
    .string()
    .trim()
    .email('Invalid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
})

export const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .required('Email is required')
    .email('Invalid email address'),
})

export const productSchema = yup.object().shape({
  productName: yup
    .string()
    .trim()
    .required('Product name is required')
    .min(2, 'Product name must be at least 2 characters'),
  description: yup
    .string()
    .trim()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters'),
  category: yup
    .string()
    .required('Category is required'),
  status: yup
    .string()
    .required('Status is required'),
  sku: yup
    .string()
    .trim()
    .required('SKU is required')
    .min(3, 'SKU must be at least 3 characters'),
  quantity: yup
    .number()
    .required('Quantity is required')
    .min(0, 'Quantity must be 0 or greater')
    .integer('Quantity must be a whole number'),
  price: yup
    .string()
    .required('Price is required')
    .test('is-valid-price', 'Price must be a valid number', (value) => {
      if (!value) return false
      const num = parseFloat(value)
      return !isNaN(num) && num > 0
    }),
  vat: yup
    .string()
    .default('')
    .test('is-valid-percentage', 'VAT must be a valid percentage', (value) => {
      if (!value) return true // Optional
      const num = parseFloat(value)
      return !isNaN(num) && num >= 0 && num <= 100
    }),
  discount: yup
    .string()
    .default('')
    .test('is-valid-percentage', 'Discount must be a valid percentage', (value) => {
      if (!value) return true // Optional
      const num = parseFloat(value)
      return !isNaN(num) && num >= 0 && num <= 100
    }),
  weight: yup
    .string()
    .default('')
    .test('is-valid-weight', 'Weight must be a valid number', (value) => {
      if (!value) return true // Optional
      const num = parseFloat(value)
      return !isNaN(num) && num > 0
    }),
  height: yup
    .string()
    .default('')
    .test('is-valid-height', 'Height must be a valid number', (value) => {
      if (!value) return true // Optional
      const num = parseFloat(value)
      return !isNaN(num) && num > 0
    }),
  length: yup
    .string()
    .default('')
    .test('is-valid-length', 'Length must be a valid number', (value) => {
      if (!value) return true // Optional
      const num = parseFloat(value)
      return !isNaN(num) && num > 0
    }),
  width: yup
    .string()
    .default('')
    .test('is-valid-width', 'Width must be a valid number', (value) => {
      if (!value) return true // Optional
      const num = parseFloat(value)
      return !isNaN(num) && num > 0
    }),
})

export type LoginFormData = yup.InferType<typeof loginSchema>
export type RegisterFormData = yup.InferType<typeof registerSchema>
export type ForgotPasswordFormData = yup.InferType<typeof forgotPasswordSchema>
export type ProductFormData = yup.InferType<typeof productSchema>

