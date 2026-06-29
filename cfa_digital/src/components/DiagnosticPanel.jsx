import { useEffect, useState } from 'react';
import api from '../services/api';

export default function DiagnosticPanel() {
  const [status, setStatus] = useState({
    apiUrl: '',
    apiHealth: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const diagnose = async () => {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        setStatus({
          apiUrl: 'undefined',
          apiHealth: null,
          loading: false,
          error: 'VITE_API_URL n est pas défini dans le frontend.',
        });
        return;
      }

      try {
        const response = await api.get('/health');
        setStatus({
          apiUrl,
          apiHealth: response.data,
          loading: false,
          error: null,
        });
      } catch (error) {
        setStatus({
          apiUrl,
          apiHealth: null,
          loading: false,
          error: error.message || 'Cannot connect to API',
        });
      }
    };

    diagnose();
  }, []);

  if (!status.loading && status.error) {
    return (
      <div className="fixed bottom-4 right-4 max-w-sm bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-50">
        <h3 className="font-bold text-red-900 mb-2">⚠️ API Diagnostic</h3>
        <p className="text-sm text-red-700 mb-2">
          <strong>URL:</strong> {status.apiUrl}
        </p>
        <p className="text-sm text-red-700 mb-2">
          <strong>Error:</strong> {status.error}
        </p>
        <p className="text-xs text-red-600 mt-3">
          Make sure:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Backend is running on port 5000</li>
            <li>MongoDB connection is valid</li>
            <li>CORS is enabled in .env (CLIENT_URL)</li>
            <li>Environment variables are loaded</li>
          </ul>
        </p>
      </div>
    );
  }

  if (status.apiHealth) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg z-50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold text-green-900">API Connected</span>
        </div>
        <p className="text-xs text-green-700 mt-1">{status.apiUrl}</p>
      </div>
    );
  }

  return null;
}
