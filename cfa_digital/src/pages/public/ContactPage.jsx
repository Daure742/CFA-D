import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ContactPage() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    setStatus('Votre message a bien été pris en compte. Nous revenons vers vous rapidement.');
    setMessage('');
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="mb-8 space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Contact CFA DIGITAL</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Parlez-nous de votre projet</h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Adressez-nous votre demande depuis ce formulaire. Notre équipe pédagogique vous contactera ensuite pour une réponse personnalisée.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block text-sm text-slate-700">
                Nom complet
                <input
                  type="text"
                  placeholder="Prénom Nom"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </label>
              <label className="block text-sm text-slate-700">
                E-mail
                <input
                  type="email"
                  placeholder="contact@exemple.com"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </label>
            </div>

            <label className="block text-sm text-slate-700">
              Objet
              <input
                type="text"
                placeholder="Demande d'information, inscription, support..."
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </label>

            <label className="block text-sm text-slate-700">
              Message
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows="6"
                placeholder="Expliquez votre demande en quelques lignes..."
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </label>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 transition hover:bg-indigo-700"
            >
              Envoyer ma demande
            </button>

            {status && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                {status}
              </div>
            )}
          </form>

          <aside className="rounded-3xl bg-slate-950 p-8 text-slate-100 shadow-xl sm:p-10">
            <h2 className="text-2xl font-semibold">Informations de contact</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Pour une réponse immédiate, appelez-nous ou écrivez directement à notre équipe pédagogique.
            </p>

            <div className="mt-8 space-y-6 text-sm text-slate-200">
              <div>
                <p className="font-semibold text-white">Adresse</p>
                <p>25 avenue de l'Innovation, 75000 Paris</p>
              </div>
              <div>
                <p className="font-semibold text-white">Téléphone</p>
                <a href="tel:+33789384734" className="text-indigo-300 hover:text-white">+33 7 89 38 47 34</a>
              </div>
              <div>
                <p className="font-semibold text-white">E-mail</p>
                <a href="mailto:contact@cfadigital.com" className="text-indigo-300 hover:text-white">contact@cfadigital.com</a>
              </div>
            </div>

            <div className="mt-10 rounded-3xl bg-slate-900/90 p-6 text-slate-200">
              <p className="font-semibold">Vous êtes déjà inscrit ?</p>
              <p className="mt-3 leading-7 text-slate-400">
                Accédez à votre espace personnel pour suivre vos cours, vos notes et vos messages.
              </p>
              <Link to="/connexion" className="mt-6 inline-flex rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
                Se connecter
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
