"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: error.stack || error.message,
    };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error("Error Boundary caught an error:", error, errorInfo);
    this.setState({
      errorInfo: errorInfo.componentStack,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: "" });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Something went wrong
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  An unexpected error has occurred
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm font-mono text-red-600 dark:text-red-400 break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Home className="w-4 h-4" />
                Go to Homepage
              </button>
            </div>

            {process.env.NODE_ENV === "development" && this.state.errorInfo && (
              <details className="mt-4">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs font-mono bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto max-h-40">
                  {this.state.errorInfo}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
