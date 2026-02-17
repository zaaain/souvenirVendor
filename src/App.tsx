import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { router } from './routes'
import ErrorBoundary from '@components/ErrorBoundary'
import './App.css'

function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toaster />
    </ErrorBoundary>
  )
}

export default App

