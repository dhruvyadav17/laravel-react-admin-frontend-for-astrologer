//   Ab: Har route/section ka alag boundary, fallback UI with retry

import React from 'react';

interface Props {
  children:   React.ReactNode;
  fallback?:  React.ReactNode;
  section?:   string;   // e.g. "Dashboard", "Users"
}

interface State {
  hasError: boolean;
  error:    Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // TODO: send to Sentry/LogRocket in production
    console.error(`[ErrorBoundary: ${this.props.section ?? 'unknown'}]`, error, info);
  }

  retry = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="text-center" style={{ maxWidth: 380 }}>
          <div className="mb-3" style={{ fontSize: 40 }}>⚠️</div>
          <h5 className="fw-semibold mb-2">
            {this.props.section
              ? `${this.props.section} failed to load`
              : 'Something went wrong'}
          </h5>
          <p className="t-muted small mb-4">
            {import.meta.env.DEV
              ? this.state.error?.message
              : 'An unexpected error occurred. Please try again.'}
          </p>
          <div className="d-flex gap-2 justify-content-center">
            <button
              className="btn btn-primary btn-sm"
              onClick={this.retry}
            >
              <i className="fas fa-redo me-1" />Try Again
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }
}

// Convenience wrapper -- use instead of raw ErrorBoundary
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  section?: string
) {
  return function Wrapped(props: T) {
    return (
      <ErrorBoundary section={section}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

export default ErrorBoundary;
