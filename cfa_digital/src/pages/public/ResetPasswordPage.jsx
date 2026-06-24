import { useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { resetPassword } from '../../services/authService.js';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await resetPassword(token, password);
      toast.success('Mot de passe reinitialise');
    } catch {
      toast.error('Lien invalide ou expire');
    }
  };

  return (
    <section className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-950">Reinitialiser le mot de passe</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          required
          minLength={8}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button type="submit" className="w-full rounded-md bg-indigo-600 py-2 font-semibold text-white">
          Valider
        </button>
      </form>
    </section>
  );
}
