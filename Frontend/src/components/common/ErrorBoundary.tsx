import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public props: Props;

  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className='flex flex-col items-center justify-center h-full w-full bg-gray-950 text-gray-400 p-6 text-center'>
          <div className='bg-red-500/10 p-4 rounded-full mb-4 animate-pulse'>
            <AlertOctagon size={48} className='text-red-500' />
          </div>
          <h1 className='text-xl font-bold text-white mb-2'>Something went wrong</h1>
          <p className='text-sm font-mono text-gray-500 mb-6 max-w-md'>
            {this.state.error?.message || 'An unexpected error occurred in this component.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className='flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors'
          >
            <RefreshCw size={16} />
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
