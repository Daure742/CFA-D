import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import DiagnosticPanel from './components/DiagnosticPanel';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { NotifProvider } from './context/NotifContext';
import { Toaster } from 'react-hot-toast';

// Log au démarrage
console.log('🚀 [Main] Application démarrage...');
console.log('📦 [Main] Variables d\'environnement:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  MODE: import.meta.env.MODE,
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('❌ Élément root non trouvé dans index.html');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <NotifProvider>
            <App />
            <DiagnosticPanel />
            <Toaster position="top-right" />
          </NotifProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

console.log('✅ [Main] Application montée avec succès');
