import {
  Component,
  type ComponentType,
  type ErrorInfo,
  type ReactNode,
} from 'react';
import { AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';

export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  FallbackComponent?: ComponentType<ErrorFallbackProps>;
  /** Changing this clears a caught error. Pass the route to recover on navigation. */
  resetKey?: unknown;
}

interface ErrorBoundaryState {
  error: Error | null;
}

function toError(value: unknown): Error {
  if (value instanceof Error) {
    return value;
  }
  if (typeof value === 'string') {
    return new Error(value);
  }
  try {
    return new Error(JSON.stringify(value));
  } catch {
    return new Error(String(value));
  }
}

function DefaultFallback() {
  return (
    <section className="site-error-page" role="alert">
      <div className="site-error-card">
        <span className="site-error-icon"><AlertTriangle size={25} aria-hidden="true" /></span>
        <span className="site-error-code">Page unavailable</span>
        <h1>We're experiencing a technical issue. Please try again shortly.</h1>
        <p>We’re sorry for the interruption. Your information remains protected.</p>
        <div className="site-error-actions">
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            <RefreshCw size={15} aria-hidden="true" /> Try Again
          </button>
          <a className="btn btn-outline" href="/">Go to Homepage <ArrowRight size={14} aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  );
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error: toError(error) };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    console.error(
      'ErrorBoundary caught an error:',
      toError(error),
      info.componentStack,
    );
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (
      this.state.error !== null &&
      prevProps.resetKey !== this.props.resetKey
    ) {
      this.resetError();
    }
  }

  resetError = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (error === null) {
      return this.props.children;
    }
    const Fallback = this.props.FallbackComponent ?? DefaultFallback;
    return <Fallback error={error} resetError={this.resetError} />;
  }
}
