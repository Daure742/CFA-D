import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  archiveAdminSession,
  createAdminSession,
  deleteAdminSession,
  getAdminFormateurs,
  getAdminSessions,
  restoreAdminSession,
  updateAdminSession,
} from '../../services/adminService';

const formations = [
  'Developpement web',
  'Administration systemes',
  'Gestion et relation client',
  'Parcours individualise',
];

const statuses = ['ouverte', 'brouillon', 'complete', 'terminee', 'archivee'];

const emptyCohorteForm = {
  nom: '',
  formation: formations[0],
  annee: new Date().getFullYear(),
  mois: new Date().getMonth() + 1,
  dateDebut: '',
  dateFin: '',
  capacite: 50,
  statut: 'ouverte',
  formateurs: [],
};

const formatDate = (value) => {
  if (!value) return 'Non defini';
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
  }).format(new Date(value));
};

const getMonthDays = (month, year) => {
  const debut = new Date(year, month - 1, 1);
  const fin = new Date(year, month, 0);
  return {
    dateDebut: debut.toISOString().slice(0, 10),
    dateFin: fin.toISOString().slice(0, 10),
  };
};

export default function AdminCohortes() {
  const [sessions, setSessions] = useState([]);
  const [formateurs, setFormateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState('');
  const [filterFormation, setFilterFormation] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [cohorteForm, setCohorteForm] = useState({
    ...emptyCohorteForm,
    ...getMonthDays(new Date().getMonth() + 1, new Date().getFullYear()),
  });

  const tabDefinitions = [
    { value: 'active', label: 'Actives' },
    { value: 'archived', label: 'Archivées' },
    { value: 'deleted', label: 'Supprimées' },
  ];

  const stats = useMemo(() => {
    const open = sessions.filter((item) => item.statut === 'ouverte').length;
    const complete = sessions.filter((item) => item.statut === 'complete').length;
    return {
      total: sessions.length,
      open,
      complete,
      withFormateurs: sessions.filter((item) => item.formateurs?.length > 0).length,
    };
  }, [sessions]);

  const yearOptions = useMemo(() => {
    const years = new Set(sessions.map((session) => session.annee));
    years.add(new Date().getFullYear());
    return [...years].sort((a, b) => a - b);
  }, [sessions]);

  const filteredSessions = useMemo(
    () =>
      sessions.filter((session) => {
        if (filterFormation && session.formation !== filterFormation) return false;
        if (filterMonth && new Date(session.dateDebut).getMonth() + 1 !== Number(filterMonth)) return false;
        if (filterYear && session.annee !== Number(filterYear)) return false;
        if (searchTerm && !session.nom.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
      }),
    [sessions, filterFormation, filterMonth, filterYear, searchTerm]
  );

  const clearFilters = () => {
    setFilterFormation('');
    setFilterMonth('');
    setFilterYear('');
    setSearchTerm('');
  };

  const loadData = useCallback(async (status = 'active') => {
    setLoading(true);
    try {
      const [sessionsResponse, formateursResponse] = await Promise.all([
        getAdminSessions({ status }),
        getAdminFormateurs(),
      ]);
      setSessions(sessionsResponse.data);
      setFormateurs(formateursResponse.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Chargement des cohortes impossible');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchSessions = async () => {
      await loadData(activeTab);
    };

    fetchSessions();
  }, [activeTab, loadData]);

  const updateCohorteForm = (field, value) => {
    setCohorteForm((current) => ({ ...current, [field]: value }));
  };

  const updateMonthRange = (month, year) => {
    const dates = getMonthDays(Number(month), Number(year));
    setCohorteForm((current) => ({ ...current, mois: Number(month), annee: Number(year), ...dates }));
  };

  const handleResetForm = () => {
    setEditingSessionId('');
    setCohorteForm({
      ...emptyCohorteForm,
      ...getMonthDays(new Date().getMonth() + 1, new Date().getFullYear()),
    });
  };

  const handleEditSession = (session) => {
    setEditingSessionId(session._id || session.id);
    setCohorteForm({
      nom: session.nom,
      formation: session.formation,
      annee: session.annee,
      mois: new Date(session.dateDebut).getMonth() + 1,
      dateDebut: session.dateDebut?.slice(0, 10) || '',
      dateFin: session.dateFin?.slice(0, 10) || '',
      capacite: session.capacite,
      statut: session.statut,
      formateurs: session.formateurs?.map((formateur) => formateur._id || formateur.id) || [],
    });
  };

  const handleArchiveSession = async (sessionId) => {
    if (!window.confirm('Archiver cette cohorte ?')) return;
    setActionLoading(true);
    try {
      await archiveAdminSession(sessionId);
      toast.success('Cohorte archivée');
      await loadData(activeTab);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Archivage impossible');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Supprimer définitivement cette cohorte ?')) return;
    setActionLoading(true);
    try {
      await deleteAdminSession(sessionId);
      toast.success('Cohorte supprimée');
      await loadData(activeTab);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Suppression impossible');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestoreSession = async (sessionId) => {
    if (!window.confirm('Restaurer cette cohorte ?')) return;
    setActionLoading(true);
    try {
      await restoreAdminSession(sessionId);
      toast.success('Cohorte restaurée');
      setActiveTab('active');
      await loadData('active');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Restauration impossible');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        nom: cohorteForm.nom,
        formation: cohorteForm.formation,
        annee: Number(cohorteForm.annee),
        dateDebut: cohorteForm.dateDebut,
        dateFin: cohorteForm.dateFin,
        capacite: Number(cohorteForm.capacite),
        statut: cohorteForm.statut,
        formateurs: cohorteForm.formateurs,
      };

      if (editingSessionId) {
        await updateAdminSession(editingSessionId, payload);
        toast.success('Cohorte mise à jour');
      } else {
        await createAdminSession(payload);
        toast.success('Cohorte créée');
      }

      await loadData(activeTab);
      handleResetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Enregistrement de la cohorte impossible');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Administration</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-950">Gestion des cohortes</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
              Créez des cohortes mensuelles, affectez plusieurs formateurs par classe et gérez les entrées régulières.
            </p>
          </div>
          <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
            Entrées possibles chaque mois : définissez un mois et la plateforme calcule les dates de début et de fin.
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Cohortes</p>
            <p className="mt-1 text-2xl font-bold text-gray-950">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Ouvertes</p>
            <p className="mt-1 text-2xl font-bold text-indigo-700">{stats.open}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Complètes</p>
            <p className="mt-1 text-2xl font-bold text-amber-700">{stats.complete}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Avec formateurs</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{stats.withFormateurs}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-950">Créer / modifier une cohorte</h2>
            <div className="mt-4 space-y-3">
              <input
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Nom de la cohorte"
                value={cohorteForm.nom}
                onChange={(event) => updateCohorteForm('nom', event.target.value)}
              />
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={cohorteForm.formation}
                onChange={(event) => updateCohorteForm('formation', event.target.value)}
              >
                {formations.map((formation) => (
                  <option key={formation}>{formation}</option>
                ))}
              </select>
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  required
                  type="number"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  value={cohorteForm.annee}
                  onChange={(event) => updateMonthRange(cohorteForm.mois, event.target.value)}
                />
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  value={cohorteForm.mois}
                  onChange={(event) => updateMonthRange(event.target.value, cohorteForm.annee)}
                >
                  {[...Array(12)].map((_, index) => (
                    <option key={index + 1} value={index + 1}>
                      {new Date(0, index).toLocaleString('fr-FR', { month: 'long' })}
                    </option>
                  ))}
                </select>
                <input
                  required
                  type="number"
                  min="1"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  value={cohorteForm.capacite}
                  onChange={(event) => updateCohorteForm('capacite', event.target.value)}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  required
                  type="date"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  value={cohorteForm.dateDebut}
                  onChange={(event) => updateCohorteForm('dateDebut', event.target.value)}
                />
                <input
                  required
                  type="date"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  value={cohorteForm.dateFin}
                  onChange={(event) => updateCohorteForm('dateFin', event.target.value)}
                />
              </div>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={cohorteForm.statut}
                onChange={(event) => updateCohorteForm('statut', event.target.value)}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <label className="block text-sm font-medium text-gray-700">Formateurs (plusieurs possibles)</label>
              <select
                multiple
                className="h-40 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                value={cohorteForm.formateurs}
                onChange={(event) =>
                  updateCohorteForm(
                    'formateurs',
                    Array.from(event.target.selectedOptions, (option) => option.value)
                  )
                }
              >
                {formateurs.map((formateur) => (
                  <option key={formateur._id} value={formateur._id}>
                    {formateur.prenom} {formateur.nom}
                  </option>
                ))}
              </select>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                >
                  {saving ? 'Enregistrement...' : editingSessionId ? 'Mettre à jour la cohorte' : 'Créer la cohorte'}
                </button>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </form>

          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-950">Infos rapides</h2>
            <p className="mt-3 text-sm text-gray-600">
              Cette interface gère les cohortes mensuelles, les entrées sur des mois différents et l’affectation de plusieurs formateurs par classe.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-950">Filtres de recherche</h2>
                <p className="mt-1 text-sm text-gray-600">Affinez les cohortes par formation, mois, année ou nom.</p>
              </div>
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Réinitialiser
              </button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {tabDefinitions.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    activeTab === tab.value
                      ? 'bg-indigo-600 text-white'
                      : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              <select
                className="rounded-md border border-gray-300 px-3 py-2"
                value={filterFormation}
                onChange={(event) => setFilterFormation(event.target.value)}
              >
                <option value="">Toutes les formations</option>
                {formations.map((formation) => (
                  <option key={formation} value={formation}>
                    {formation}
                  </option>
                ))}
              </select>
              <select
                className="rounded-md border border-gray-300 px-3 py-2"
                value={filterMonth}
                onChange={(event) => setFilterMonth(event.target.value)}
              >
                <option value="">Tous les mois</option>
                {[...Array(12)].map((_, index) => (
                  <option key={index + 1} value={index + 1}>
                    {new Date(0, index).toLocaleString('fr-FR', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select
                className="rounded-md border border-gray-300 px-3 py-2"
                value={filterYear}
                onChange={(event) => setFilterYear(event.target.value)}
              >
                <option value="">Toutes les années</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Rechercher par nom"
                className="rounded-md border border-gray-300 px-3 py-2"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-950">Liste des cohortes</h2>
                <p className="mt-1 text-sm text-gray-600">{filteredSessions.length} cohorte(s) trouvée(s) dans « {tabDefinitions.find((tab) => tab.value === activeTab).label } »</p>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {loading && <p className="p-5 text-sm text-gray-500">Chargement des cohortes...</p>}
              {!loading && sessions.length === 0 && (
                <p className="p-5 text-sm text-gray-500">Aucune cohorte n’est disponible pour le moment.</p>
              )}
              {!loading && sessions.length > 0 && filteredSessions.length === 0 && (
                <p className="p-5 text-sm text-gray-500">Aucune cohorte ne correspond aux filtres appliqués.</p>
              )}
              {!loading && filteredSessions.map((session) => (
                <div key={session._id || session.id} className="p-5 lg:flex lg:items-start lg:justify-between lg:gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-950">{session.nom}</h3>
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">{session.formation}</span>
                      {activeTab === 'archived' && (
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">Archivée</span>
                      )}
                      {activeTab === 'deleted' && (
                        <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">Supprimée</span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      {formatDate(session.dateDebut)} - {formatDate(session.dateFin)} • {session.capacite} places
                    </p>
                    <p className="mt-1 text-sm text-gray-600">Statut : {session.statut}</p>
                    {session.formateurs?.length > 0 && (
                      <p className="mt-2 text-sm text-gray-600">
                        Formateurs : {session.formateurs.map((f) => `${f.prenom} ${f.nom}`).join(', ')}
                      </p>
                    )}
                    {activeTab === 'deleted' && session.deletedAt && (
                      <p className="mt-2 text-sm text-red-700">Supprimée le {formatDate(session.deletedAt)}</p>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 lg:mt-0">
                    {activeTab === 'active' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleEditSession(session)}
                          disabled={actionLoading}
                          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => handleArchiveSession(session.id || session._id)}
                          disabled={actionLoading}
                          className="rounded-md border border-amber-500 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 disabled:cursor-not-allowed"
                        >
                          Archiver
                        </button>
                      </>
                    )}
                    {(activeTab === 'active' || activeTab === 'archived') && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSession(session.id || session._id)}
                        disabled={actionLoading}
                        className="rounded-md border border-red-500 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed"
                      >
                        Supprimer
                      </button>
                    )}
                    {(activeTab === 'archived' || activeTab === 'deleted') && (
                      <button
                        type="button"
                        onClick={() => handleRestoreSession(session.id || session._id)}
                        disabled={actionLoading}
                        className="rounded-md border border-emerald-500 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed"
                      >
                        Restaurer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
