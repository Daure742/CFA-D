import { useState } from 'react';
import toast from 'react-hot-toast';
import { forgotPassword, sendVerificationCode } from '../../services/authService.js';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await forgotPassword(email);
      toast.success('Instructions envoyees si le compte existe');
    } catch {
      toast.error('Impossible d envoyer la demande pour le moment');
    }
  };

  const handleSendSmsCode = async (event) => {
    event.preventDefault();
    try {
      await sendVerificationCode({ telephone, email: email || undefined });
      toast.success('Code envoyé si le numéro est associé au compte');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible d envoyer le code');
    }
  };

  return (
    <section className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-950">Mot de passe oublie</h1>
      <p className="mt-2 text-sm text-gray-600">
        Indiquez votre email pour recevoir les instructions de reinitialisation.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="email"
          placeholder="Email"
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <button type="submit" className="w-full rounded-md bg-indigo-600 py-2 font-semibold text-white">
          Envoyer
        </button>
      </form>

      <div className="mt-6 border-t pt-4">
        <p className="text-sm text-gray-600 mb-2">Ou recevez un code sur votre téléphone :</p>
        <div className="space-y-2">
          <input value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="Numéro de téléphone (ex: +336...)" className="w-full rounded-md border border-gray-300 px-3 py-2" />
          <button onClick={handleSendSmsCode} className="w-full rounded-md bg-indigo-600 py-2 font-semibold text-white">Envoyer le code par SMS</button>
        </div>
      </div>
    </section>
  );
}
