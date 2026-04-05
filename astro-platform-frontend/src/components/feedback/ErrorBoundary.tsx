// PATH: src/components/feedback/ErrorBoundary.tsx
// IMPROVEMENT: Generic "app crashed" screen improve kiya
//              Reload button + go home + error details (dev mode)

import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: Error };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // TODO: Send to error monitoring (Sentry / LogRocket)
    console.error("App crashed:", error, info);
  }

  reload = () => window.location.reload();
  goHome = () => { window.location.href = "/"; };

  render() {
    if (!this.state.hasError) return this.props.children;

    const isDev = import.meta.env.DEV;

    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <div className="text-center px-4" style={{ maxWidth: 520 }}>

          <div style={{ fontSize: 64, marginBottom: 8 }}>⚠️</div>

          <h3 className="fw-bold mb-2">Something went wrong</h3>
          <p className="text-muted mb-4">
            An unexpected error occurred. Please try reloading the page.
            If the problem persists, contact support.
          </p>

          <div className="d-flex gap-2 justify-content-center mb-4">
            <button className="btn btn-primary" onClick={this.reload}>
              <i className="fas fa-redo me-2" />Reload Page
            </button>
            <button className="btn btn-outline-secondary" onClick={this.goHome}>
              <i className="fas fa-home me-2" />Go Home
            </button>
          </div>

          {/* Dev mode error details */}
          {isDev && this.state.error && (
            <details className="text-start bg-white border rounded p-3" style={{ fontSize: 12 }}>
              <summary className="fw-semibold text-danger mb-2" style={{ cursor: "pointer" }}>
                Error Details (dev only)
              </summary>
              <pre className="mb-0 text-danger overflow-auto" style={{ fontSize: 11 }}>
                {this.state.error.message}
                {"\n\n"}
                {this.state.error.stack}
              </pre>
            </details>
          )}

        </div>
      </div>
    );
  }
}
