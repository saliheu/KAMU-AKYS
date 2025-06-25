import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { BrowserRouter } from 'react-router-dom';
import { store, persistor } from './store/store';
import App from './App';
import LoadingSpinner from './components/UI/LoadingSpinner';
import './index.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }
    
    // Here you could also log to an error reporting service
    // Example: logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#f7fafc'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '500px',
            width: '100%'
          }}>
            <h1 style={{ 
              color: '#e53e3e', 
              marginBottom: '1rem',
              fontSize: '1.5rem'
            }}>
              Bir Hata Oluştu
            </h1>
            <p style={{ 
              color: '#4a5568', 
              marginBottom: '1.5rem',
              lineHeight: '1.6'
            }}>
              Üzgünüz, beklenmeyen bir hata oluştu. Lütfen sayfayı yenilemeyi deneyin.
            </p>
            
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  backgroundColor: '#3182ce',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Sayfayı Yenile
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  backgroundColor: 'transparent',
                  color: '#3182ce',
                  border: '1px solid #3182ce',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Ana Sayfaya Dön
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ 
                marginTop: '2rem', 
                padding: '1rem',
                backgroundColor: '#f7fafc',
                borderRadius: '0.375rem',
                border: '1px solid #e2e8f0',
                textAlign: 'left'
              }}>
                <summary style={{ 
                  cursor: 'pointer',
                  fontWeight: '500',
                  color: '#4a5568'
                }}>
                  Teknik Detaylar (Geliştirici)
                </summary>
                <pre style={{
                  marginTop: '1rem',
                  fontSize: '0.75rem',
                  color: '#e53e3e',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {this.state.error && this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
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

// Loading component for PersistGate
const PersistGateLoading = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  }}>
    <LoadingSpinner 
      size="large" 
      text="Uygulama başlatılıyor..." 
    />
  </div>
);

// Get the root element
const container = document.getElementById('root');
const root = createRoot(container);

// Check for browser compatibility
const checkBrowserSupport = () => {
  const isSupported = (
    'Promise' in window &&
    'fetch' in window &&
    'localStorage' in window &&
    'sessionStorage' in window
  );

  if (!isSupported) {
    document.body.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 2rem;
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background-color: #f7fafc;
      ">
        <div style="
          background-color: white;
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          max-width: 500px;
        ">
          <h1 style="color: #e53e3e; margin-bottom: 1rem;">
            Tarayıcı Uyumsuzluğu
          </h1>
          <p style="color: #4a5568; margin-bottom: 1.5rem; line-height: 1.6;">
            Bu uygulama güncel bir tarayıcı gerektirir. Lütfen tarayıcınızı güncelleyin 
            veya modern bir tarayıcı kullanın.
          </p>
          <p style="color: #4a5568; font-size: 0.875rem;">
            Desteklenen tarayıcılar: Chrome, Firefox, Safari, Edge
          </p>
        </div>
      </div>
    `;
    return false;
  }
  return true;
};

// Initialize app if browser is supported
if (checkBrowserSupport()) {
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <Provider store={store}>
          <PersistGate 
            loading={<PersistGateLoading />} 
            persistor={persistor}
          >
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </PersistGate>
        </Provider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

// Service Worker Registration (optional)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Performance monitoring (development only)
if (process.env.NODE_ENV === 'development') {
  import('./utils/performanceMonitor').then(({ startPerformanceMonitoring }) => {
    startPerformanceMonitoring();
  }).catch(() => {
    // Performance monitoring is optional
  });
}

// Global error handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // Prevent the default behavior (console error)
  event.preventDefault();
  
  // You could also show a user-friendly error message here
  // showErrorNotification('Beklenmeyen bir hata oluştu.');
});

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  
  // You could also log to an error reporting service here
  // logErrorToService(event.error);
});

// Accessibility helpers
const addAccessibilityHelpers = () => {
  // Add skip link for keyboard navigation
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = 'Ana içeriğe geç';
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 6px;
    background: #3182ce;
    color: white;
    padding: 8px;
    text-decoration: none;
    border-radius: 4px;
    z-index: 10000;
    transition: top 0.3s;
  `;
  
  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '6px';
  });
  
  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });
  
  document.body.insertBefore(skipLink, document.body.firstChild);
  
  // Add focus-visible polyfill for older browsers
  if (!CSS.supports('selector(:focus-visible)')) {
    import('focus-visible').catch(() => {
      // Focus-visible polyfill is optional
    });
  }
};

// Initialize accessibility helpers
document.addEventListener('DOMContentLoaded', addAccessibilityHelpers);