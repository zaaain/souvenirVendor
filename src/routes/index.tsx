import { createBrowserRouter } from 'react-router-dom'
import AuthLayout from '@components/layouts/AuthLayout'
import DashboardLayout from '@components/layouts/DashboardLayout'
import Login from '@pages/auth/login'
import Register from '@pages/auth/register'
import ForgotPassword from '@pages/auth/forgot-password'
import OTP from '@pages/auth/otp'
import ResetPassword from '@pages/auth/reset-password'
import Dashboard from '@pages/dashboard/dashboard'
import Profile from '@pages/profile/profile'
import Settings from '@pages/settings/settings'
import Products from '@pages/products/products'
import Orders from '@pages/orders/orders'
import OrderDetail from '@pages/orders/OrderDetail'
import MyEarnings from '@pages/my-earnings/MyEarnings'
import NotFound from '@pages/404/NotFound'
import ProductDetail from '@pages/products/ProductDetail'
import AddProduct from '@pages/products/AddProduct'
import EditProduct from '@pages/products/EditProduct'

export const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: 'otp',
        element: <OTP />,
      },
      {
        path: 'reset-password',
        element: <ResetPassword />,
      },
    ],
  },
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
         {
        path: 'products/add',
        element: <AddProduct />,
      },
      {
        path: 'products/:id/edit',
        element: <EditProduct />,
      },
      {
        path: 'products/:id',
        element: <ProductDetail />,
      },
      {
        path: 'products',
        element: <Products />,
      },
      {
        path: 'orders/:id',
        element: <OrderDetail />,
      },
      {
        path: 'orders',
        element: <Orders />,
      },
      {
        path: 'my-earnings',
        element: <MyEarnings />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])

