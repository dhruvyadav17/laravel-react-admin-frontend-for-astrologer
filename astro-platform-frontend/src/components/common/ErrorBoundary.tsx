import React from "react";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error;
};

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // 🔥 future: send to Sentry / LogRocket
    console.error("App crashed:", error, info);
  }

  reload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mt-5 text-center">
          <h2 className="text-danger mb-3">
            Something went wrong 😢
          </h2>

          <p className="text-muted">
            The application crashed unexpectedly.
            <br />
            Please reload the page.
          </p>

          <button
            className="btn btn-primary mt-3"
            onClick={this.reload}
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
