import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'Something went wrong.';
      try {
        const parsedError = JSON.parse(this.state.error?.message || '');
        if (parsedError.error?.includes('insufficient permissions')) {
          errorMessage = 'You do not have permission to access this data. Please check your account settings.';
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-rose-500/10 border border-rose-500/20 rounded-3xl backdrop-blur-md">
          <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
          <h2 className="text-2xl font-bold text-nudge-primary-text mb-2">Oops! Financial Data Error</h2>
          <p className="text-nudge-secondary-text max-w-md mb-6">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-rose-500 text-white rounded-full font-medium hover:bg-rose-600 transition-colors"
          >
            Refresh Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
