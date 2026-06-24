import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getSessionsOuvertes, register } from '../../services/authService.js';

const formations = [
  'Developpement web',
  'Administration systemes',
  'Gestion et relation client',
  'Parcours individualise',
];

const DEFAULT_TENANT_ID = import.meta.env.VITE_DEFAULT_TENANT_ID || '665000000000000000000001';

export default function AdmissionsPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    confirmation: '',
    formation: formations[0],
    sessionId: '',
    tenantId: DEFAULT_TENANT_ID,
  });
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessionsError, setSessionsError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === formData.sessionId),
    [sessions, formData.sessionId]
  );

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  useEffect(() => {
    const loadSessions = async () => {
      if (!formData.formation) {
        setSessions([]);
        updateField('sessionId', '');
        return;
      }

      setLoadingSessions(true);
      setSessionsError('');
      try {
        const { data } = await getSessionsOuvertes(formData.formation, formData.tenantId);
        setSessions(data);
        setFormData((current) => ({
          ...current,
          sessionId: data.some((session) => session.id === current.sessionId) ? current.sessionId : data[0]?.id || '',
        }));
      } catch (error) {
        setSessionsError(
          error.response?.data?.message ||
            'Impossible de préparer la session automatique. Vérifiez votre connexion ou contactez le CFA.'
        );
        setSessions([]);
        setFormData((current) => ({ ...current, sessionId: '' }));
      } finally {
        setLoadingSessions(false);
      }
    };
    loadSessions();
  }, [formData.formation, formData.tenantId]);
  

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.motDePasse !== formData.confirmation) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (!formData.sessionId) {
      toast.error('Choisissez une session ouverte pour finaliser votre inscription');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await register({
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        motDePasse: formData.motDePasse,
        formation: formData.formation,
        sessionId: formData.sessionId,
        tenantId: formData.tenantId,
      });
      const msg = data?.message || 'Inscription creee. Vous pouvez vous connecter.';
      toast.success(msg);
      navigate('/connexion');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Inscription impossible pour le moment');
    } finally {
      setSubmitting(false);
    }
  };

  

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Admissions</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-950">Inscription et candidature</h1>
        <p className="mt-3 text-base leading-7 text-gray-600">
          Creez votre compte etudiant en quelques etapes. La session ouverte du mois est attribuee automatiquement
          selon la formation choisie.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            ['1. Choisir une formation', 'Selectionnez le parcours qui correspond a votre objectif.'],
            ['2. Session automatique', 'La plateforme attribue la session ouverte du mois.'],
            ['3. Creer le compte', 'Renseignez vos informations et validez l inscription.'],
            ['4. Suivre le parcours', 'Accedez aux cours, devoirs, notes, documents et messages.'],
          ].map(([title, text]) => (
            <article key={title} className="rounded-lg border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
            </article>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-950">Creer un compte etudiant</h2>
        <div className="mt-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Nom"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={formData.nom}
              onChange={(event) => updateField('nom', event.target.value)}
            />
            <input
              type="text"
              placeholder="Prenom"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={formData.prenom}
              onChange={(event) => updateField('prenom', event.target.value)}
            />
          </div>
          <input
            type="email"
            placeholder="Email"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.email}
            onChange={(event) => updateField('email', event.target.value)}
          />
          <div>
            <label htmlFor="tenantId" className="mb-1 block text-sm font-medium text-gray-700">
              ID Tenant (CFA)
            </label>
            <input
              id="tenantId"
              type="text"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={formData.tenantId}
              onChange={(event) => updateField('tenantId', event.target.value)}
            />
          </div>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.formation}
            onChange={(event) => {
              setFormData((current) => ({ ...current, formation: event.target.value, sessionId: '' }));
            }}
          >
            {formations.map((formation) => (
              <option key={formation}>{formation}</option>
            ))}
          </select>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.sessionId}
            onChange={(event) => updateField('sessionId', event.target.value)}
            disabled={loadingSessions || sessions.length === 0}
            required
          >
            <option value="">
              {loadingSessions ? 'Preparation de la session...' : 'Session ouverte automatique'}
            </option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.nom} - {session.placesRestantes} places restantes
              </option>
            ))}
          </select>
          {!loadingSessions && sessionsError && (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {sessionsError}
            </p>
          )}
          {!loadingSessions && !sessionsError && sessions.length === 0 && (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Aucune session ouverte pour cette formation. Contactez l administration du CFA.
            </p>
          )}
          {selectedSession && (
            <div className="rounded-md border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
              Session selectionnee : {selectedSession.nom}. Inscrits : {selectedSession.inscrits}/
              {selectedSession.capacite}.
            </div>
          )}
          <input
            type="password"
            placeholder="Mot de passe"
            required
            minLength={8}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.motDePasse}
            onChange={(event) => updateField('motDePasse', event.target.value)}
          />
          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            required
            minLength={8}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.confirmation}
            onChange={(event) => updateField('confirmation', event.target.value)}
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {submitting ? 'Creation en cours...' : 'Creer mon compte'}
          </button>
          <p className="text-center text-sm text-gray-600">
            Deja inscrit ?{' '}
            <Link to="/connexion" className="font-semibold text-indigo-700 hover:text-indigo-800">
              Se connecter
            </Link>
          </p>
        </div>
      </form>
    </section>
  );
}
