import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@components/buttons'
import bgAuth from '@assets/png/bgAuth.png'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  retryKey: number
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, retryKey: 0 }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState((prev) => ({ hasError: false, error: null, retryKey: prev.retryKey + 1 }))
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center"
          style={{ backgroundImage: `url(${bgAuth})` }}
        >
          <div className="flex flex-col items-center justify-center">
            <div className="bg-white rounded-full h-[50vh] w-[50vh] flex flex-col items-center justify-center shadow-2xl p-8">
              <h1 className="text-6xl font-bold text-blue-600 mb-4">Oops!</h1>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
                Something went wrong
              </h2>
              <p className="text-gray-600 mb-6 text-center px-4">
                An unexpected error occurred. Please try again or go back to the home page.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="primary" onClick={this.handleRetry}>
                  Try again
                </Button>
                <Link to="/auth/login">
                  <Button variant="primary">Go to Login</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return <div key={this.state.retryKey}>{this.props.children}</div>
  }
}

export default ErrorBoundary
