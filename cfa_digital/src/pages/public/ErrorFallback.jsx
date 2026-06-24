export default function ErrorFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0-6a4 4 0 110-8 4 4 0 010 8z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Erreur de Connexion</h1>
          <p className="text-gray-600 mb-6">
            Impossible de se connecter au serveur. Vérifiez votre configuration.
          </p>
          
          <div className="bg-gray-100 rounded p-4 mb-6 text-left text-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Points de vérification:</h3>
            <ul className="space-y-2 text-gray-700">
              <li>✓ Backend tourne on port 5000</li>
              <li>✓ MongoDB est connecté</li>
              <li>✓ CORS est configuré dans backend/.env</li>
              <li>✓ Variables d'environnement sont chargées</li>
            </ul>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            Réessayer
          </button>
        </div>
      </div>
    </div>
  );
}
