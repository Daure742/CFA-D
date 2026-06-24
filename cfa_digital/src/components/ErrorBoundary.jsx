import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ [ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v2m0-6a4 4 0 110-8 4 4 0 010 8z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Oups! Une erreur s'est produite</h1>
              <p className="text-gray-600 mb-6">
                L'application a rencontré une erreur inattendue.
              </p>
              
              {import.meta.env.DEV && this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded p-4 mb-6 text-left text-xs text-red-700 max-h-40 overflow-y-auto">
                  <p className="font-semibold mb-2">Détails de l'erreur:</p>
                  <p className="break-words">{this.state.error.toString()}</p>
                </div>
              )}

              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
