import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { getSessionsOuvertes } from '../../services/authService';
import { updateFormateurProfile } from '../../services/formateurService';
import { WorkspacePage } from '../../components/ui/PageTemplate';

export default function FormateurDashboard() {
  const { user, updateUser } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    matieres: Array.isArray(user?.matieres) ? user.matieres.join(', ') : user?.matieres || '',
    sessionIds: user?.cohorte ? [user.cohorte] : []
  });

  useEffect(() => {
    if (!user) return;
    const loadSessions = async () => {
      setLoading(true);
      try {
        const { data } = await getSessionsOuvertes(undefined, user.tenantId);
        setSessions(data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Impossible de récupérer les sessions disponibles.');
      } finally {
        setLoading(false);
      }
    };
    loadSessions();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    queueMicrotask(() => {
      setProfileData({
        nom: user?.nom || '',
        prenom: user?.prenom || '',
        matieres: Array.isArray(user?.matieres) ? user.matieres.join(', ') : user?.matieres || '',
        sessionIds: user?.cohorte ? [user.cohorte] : []
      });
    });
  }, [user]);

  const needsOnboarding = !user?.matieres?.length || !user?.cohorte;

  const updateField = (field, value) => {
    setProfileData((current) => ({ ...current, [field]: value }));
  };

  const toggleSession = (sessionId) => {
    setProfileData((current) => {
      const selected = current.sessionIds.includes(sessionId)
        ? current.sessionIds.filter((id) => id !== sessionId)
        : [...current.sessionIds, sessionId];
      return { ...current, sessionIds: selected };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!profileData.nom || !profileData.prenom || !profileData.matieres) {
      return toast.error('Veuillez renseigner votre nom, prénom et les cours enseignés.');
    }
    if (sessions.length > 0 && profileData.sessionIds.length === 0) {
      return toast.error('Veuillez choisir au moins une session de formation.');
    }

    setSaving(true);
    try {
      const { data } = await updateFormateurProfile({
        nom: profileData.nom,
        prenom: profileData.prenom,
        matieres: profileData.matieres,
        sessionIds: profileData.sessionIds
      });
      toast.success('Profil formateur mis à jour avec succès');
      if (data?.user && typeof updateUser === 'function') {
        updateUser(data.user);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Impossible de mettre à jour le profil');
    } finally {
      setSaving(false);
    }
  };

  if (needsOnboarding) {
    return (
      <section className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Formateur</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-950">Complétez votre profil formateur</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            Avant d'accéder à votre tableau de bord, merci de renseigner vos informations de formateur et de choisir une session de formation.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Nom</span>
                <input
                  type="text"
                  value={profileData.nom}
                  onChange={(event) => updateField('nom', event.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Prénom</span>
                <input
                  type="text"
                  value={profileData.prenom}
                  onChange={(event) => updateField('prenom', event.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Cours enseignés</span>
                <input
                  type="text"
                  value={profileData.matieres}
                  onChange={(event) => updateField('matieres', event.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Ex: Javascript, React, Administration"
                />
                <p className="mt-1 text-xs text-gray-500">Séparez les matières par des virgules.</p>
              </label>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h2 className="text-lg font-semibold text-gray-950">Choisir une session</h2>
              <p className="mt-2 text-sm text-gray-600">Sélectionnez la ou les sessions de formation que vous souhaitez enseigner.</p>
              <div className="mt-4 space-y-3 max-h-72 overflow-auto">
                {loading && <p className="text-sm text-gray-500">Chargement des sessions...</p>}
                {!loading && sessions.length === 0 && (
                  <p className="text-sm text-gray-500">Aucune session disponible pour le moment.</p>
                )}
                {!loading && sessions.map((session) => (
                  <label key={session.id} className="flex items-start gap-3 rounded-md border border-gray-200 bg-white p-3">
                    <input
                      type="checkbox"
                      checked={profileData.sessionIds.includes(session.id)}
                      onChange={() => toggleSession(session.id)}
                      className="mt-1"
                    />
                    <div className="text-sm">
                      <div className="font-semibold text-gray-900">{session.nom}</div>
                      <div className="mt-1 text-gray-600">{session.formation} — {new Date(session.dateDebut).toLocaleDateString()}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer et accéder au tableau de bord'}
              </button>
            </div>
          </form>
        </div>
      </section>
    );
  }

  return (
    <WorkspacePage
      title="Tableau de bord formateur"
      description="Suivez vos classes, devoirs à corriger, notes et messages pédagogiques."
      actions={[
        { label: 'Lancer mes cours', to: '/formateur/classes', primary: true },
        { label: 'Corriger les devoirs', to: '/formateur/devoirs' },
        { label: 'Saisir les notes', to: '/formateur/notes' }
      ]}
      metrics={[
        { label: 'Classes', value: '4', to: '/formateur/classes', helper: 'Lancer une session, valider les présences et publier les replays.' },
        { label: 'Copies', value: '16', to: '/formateur/devoirs', helper: 'Ouvrir les rendus à corriger et publier les retours.' },
        { label: 'Messages', value: '5', to: '/formateur/messages', helper: 'Communiquer avec les apprenants et l administration.' }
      ]}
      tasks={[
        { title: 'Classes suivies', to: '/formateur/classes', text: 'Accéder aux cours assignés et aux actions live.' },
        { title: 'Corrections prioritaires', to: '/formateur/devoirs', text: 'Traiter les copies en attente et les retards.' },
        { title: 'Messages récents', to: '/formateur/messages', text: 'Lire et envoyer les messages pédagogiques.' },
        { title: 'Planning pédagogique', to: '/formateur/classes', text: 'Vérifier les prochaines sessions et leur statut.' }
      ]}
    />
  );
}
