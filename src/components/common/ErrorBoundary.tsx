import { Component, ErrorInfo, ReactNode } from 'react';
import Button from './Button';
import { loggingService } from '../../services/loggingService';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: '',
    retryCount: 0
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { hasError: true, error, errorId };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorContext = {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: this.state.retryCount
    };

    // Log error with detailed context
    loggingService.error('ErrorBoundary caught an error', error, errorContext);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (handlerError) {
        loggingService.error('Error in custom error handler', handlerError as Error);
      }
    }

    this.setState({ errorInfo });
  }

  public componentDidUpdate(prevProps: Props) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error state if resetKeys have changed
    if (hasError && resetOnPropsChange && resetKeys) {
      const prevResetKeys = prevProps.resetKeys || [];
      const hasResetKeyChanged = resetKeys.some((key, index) => key !== prevResetKeys[index]);
      
      if (hasResetKeyChanged) {
        loggingService.info('ErrorBoundary reset due to prop change', { resetKeys });
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
          errorId: '',
          retryCount: 0
        });
      }
    }
  }

  private handleRefresh = () => {
    loggingService.info('User triggered page refresh from ErrorBoundary', { errorId: this.state.errorId });
    this.setState({ hasError: false, error: null, errorInfo: null, errorId: '', retryCount: 0 });
    window.location.reload();
  };

  private handleReset = () => {
    const newRetryCount = this.state.retryCount + 1;
    loggingService.info('User triggered error reset', { 
      errorId: this.state.errorId, 
      retryCount: newRetryCount 
    });
    
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null, 
      errorId: '', 
      retryCount: newRetryCount 
    });
  };

  private handleReportError = () => {
    const errorReport = {
      errorId: this.state.errorId,
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // In a real app, this would send to an error reporting service
    loggingService.info('Error report generated', errorReport);
    
    // Copy error details to clipboard for easy sharing
    navigator.clipboard?.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => {
        alert('Error details copied to clipboard');
      })
      .catch(() => {
        console.log('Error details:', errorReport);
        alert('Error details logged to console');
      });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorId, retryCount } = this.state;
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-boundary-header">
              <h1>Oops! Something went wrong</h1>
              {isDevelopment && errorId && (
                <div className="error-boundary-id">
                  <small>Error ID: {errorId}</small>
                </div>
              )}
            </div>
            
            <p>
              We're sorry, but something unexpected happened. You can try refreshing 
              the page or starting over.
            </p>

            {retryCount > 0 && (
              <div className="error-boundary-retry-info">
                <p><small>Retry attempts: {retryCount}</small></p>
              </div>
            )}
            
            <div className="error-boundary-actions">
              <Button onClick={this.handleReset} variant="primary">
                Try Again
              </Button>
              <Button onClick={this.handleRefresh} variant="outline">
                Refresh Page
              </Button>
              {isDevelopment && (
                <Button onClick={this.handleReportError} variant="secondary">
                  Copy Error Details
                </Button>
              )}
            </div>

            {isDevelopment && error && (
              <details className="error-boundary-details">
                <summary>Error Details (Development Only)</summary>
                <div className="error-boundary-info">
                  <div className="error-info-section">
                    <h4>Error Message:</h4>
                    <pre className="error-message">{error.message}</pre>
                  </div>
                  
                  {error.stack && (
                    <div className="error-info-section">
                      <h4>Stack Trace:</h4>
                      <pre className="error-boundary-stack">{error.stack}</pre>
                    </div>
                  )}
                  
                  {this.state.errorInfo?.componentStack && (
                    <div className="error-info-section">
                      <h4>Component Stack:</h4>
                      <pre className="error-component-stack">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                  
                  <div className="error-info-section">
                    <h4>Context:</h4>
                    <ul>
                      <li>URL: {window.location.href}</li>
                      <li>Timestamp: {new Date().toISOString()}</li>
                      <li>User Agent: {navigator.userAgent}</li>
                      <li>Retry Count: {retryCount}</li>
                    </ul>
                  </div>
                </div>
              </details>
            )}

            {!isDevelopment && (
              <div className="error-boundary-help">
                <p>
                  <small>
                    If this problem persists, please try clearing your browser cache 
                    or contact support with the error ID above.
                  </small>
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;