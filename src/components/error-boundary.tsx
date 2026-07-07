import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  info: ErrorInfo | null;
}

// Last line of defense: without this, an uncaught render/effect error
// unmounts the entire tree (React 19 default) and leaves a fully blank
// window with no trace of what happened.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] uncaught error", error, info.componentStack);
    this.setState({ info });
  }

  render() {
    const { error, info } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex flex-col h-full bg-base-200 text-base-content">
        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto flex flex-col gap-4">
            <h1 className="text-lg font-semibold text-error">Something crashed</h1>
            <p className="text-sm text-base-content/70">
              {error.message || String(error)}
            </p>
            <pre className="text-xs text-base-content/50 whitespace-pre-wrap bg-base-300 rounded-lg p-4 overflow-x-auto">
              {error.stack}
              {info?.componentStack}
            </pre>
            <button
              className="btn btn-sm btn-primary self-start"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }
}
