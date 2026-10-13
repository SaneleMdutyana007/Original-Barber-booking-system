import { Component, ReactNode } from 'react'

interface S { error: Error | null }
export default class ErrorBoundary extends Component<{ children: ReactNode }, S> {
  state: S = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  componentDidCatch(error: Error) { console.error('Boundary caught:', error) }
  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-content px-4 py-16 text-center">
          <h1 className="text-3xl font-display mb-3">Something went wrong</h1>
          <p className="text-charcoal/70 mb-6">{this.state.error.message}</p>
          <button className="text-amber-500 underline" onClick={() => location.reload()}>Reload the page</button>
        </div>
      )
    }
    return this.props.children
  }
}