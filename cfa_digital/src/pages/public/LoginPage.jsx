import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const DEFAULT_TENANT_ID = import.meta.env.VITE_DEFAULT_TENANT_ID || '665000000000000000000001';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantId, setTenantId] = useState(DEFAULT_TENANT_ID);
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const roleHome = {
    superadmin: '/superadmin',
    admin: '/admin',
    formateur: '/formateur',
    etudiant: '/etudiant',
    tuteur: '/tuteur',
    entreprise: '/entreprise',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const authenticatedUser = await loginUser(email, password, tenantId.trim());
      toast.success('Connexion réussie');
      navigate(roleHome[authenticatedUser.role] || '/', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur de connexion');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">Connexion</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="tenantId" className="mb-1 block text-sm font-medium text-gray-700">
            ID Tenant (CFA)
          </label>
          <input
            id="tenantId"
            type="text"
            placeholder="ID Tenant (CFA)"
            required
            className="w-full rounded border px-3 py-2"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
          />
        </div>
        <input type="email" placeholder="Email" required className="w-full border px-3 py-2 rounded" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Mot de passe" required className="w-full border px-3 py-2 rounded" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Se connecter</button>
      </form>
      <div className="mt-4 text-center text-sm text-gray-600">
        Nouveau sur la plateforme ?{' '}
        <Link to="/admissions" className="font-semibold text-indigo-700 hover:text-indigo-800">
          Creer un compte etudiant
        </Link>
        <div className="mt-3">
          <Link to="/mot-de-passe-oublie" className="text-sm text-gray-600 hover:underline hover:text-indigo-700">
            Mot de passe oublié?
          </Link>
        </div>
      </div>
    </div>
  );
}
