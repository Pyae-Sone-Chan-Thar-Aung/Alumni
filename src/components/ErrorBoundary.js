import React from 'react';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console and potentially to a logging service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log to external service if available
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom error UI
      return (
        <div className="error-boundary">
          <div className="error-container">
            <div className="error-icon">
              <FaExclamationTriangle />
            </div>
            <h2>Something went wrong</h2>
            <p>We're sorry, but something unexpected happened.</p>
            
            <div className="error-actions">
              <button 
                onClick={this.handleReload}
                className="btn btn-primary"
              >
                <FaRedo /> Reload Page
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="error-details">
                <h3>Error Details (Development Only):</h3>
                <details style={{ whiteSpace: 'pre-wrap' }}>
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </details>
              </div>
            )}
          </div>

          <style jsx>{`
            .error-boundary {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 2rem;
              background: linear-gradient(135deg, #8B0000 0%, #660000 100%);
              color: white;
            }

            .error-container {
              text-align: center;
              max-width: 600px;
              background: rgba(255, 255, 255, 0.1);
              padding: 3rem;
              border-radius: 16px;
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .error-icon {
              font-size: 4rem;
              color: #FFD700;
              margin-bottom: 1.5rem;
            }

            .error-container h2 {
              margin-bottom: 1rem;
              font-size: 2rem;
            }

            .error-container p {
              margin-bottom: 2rem;
              opacity: 0.9;
              font-size: 1.1rem;
            }

            .error-actions {
              margin-bottom: 2rem;
            }

            .btn {
              padding: 12px 24px;
              border: none;
              border-radius: 8px;
              font-size: 1rem;
              cursor: pointer;
              transition: all 0.3s ease;
              display: inline-flex;
              align-items: center;
              gap: 8px;
            }

            .btn-primary {
              background: #FFD700;
              color: #8B0000;
              font-weight: 600;
            }

            .btn-primary:hover {
              background: #FFF8DC;
              transform: translateY(-2px);
              box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
            }

            .error-details {
              margin-top: 2rem;
              padding: 1.5rem;
              background: rgba(0, 0, 0, 0.3);
              border-radius: 8px;
              text-align: left;
              max-height: 300px;
              overflow-y: auto;
            }

            .error-details h3 {
              margin-top: 0;
              margin-bottom: 1rem;
              color: #FFD700;
            }

            details {
              font-family: 'Courier New', monospace;
              font-size: 0.9rem;
              line-height: 1.4;
            }
          `}</style>
        </div>
      );
    }

    // Render children if no error
    return this.props.children;
  }
}

export default ErrorBoundary;
