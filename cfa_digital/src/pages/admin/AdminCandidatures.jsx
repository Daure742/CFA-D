import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { getAdminCandidatures, getAdminCandidaturesSummary, getAdminSessions } from '../../services/adminService';

const statusFilters = [
  { key: 'all', label: 'Toutes' },
  { key: 'nouvelle', label: 'Nouvelles' },
  { key: 'en_revision', label: 'À compléter' },
  { key: 'acceptee', label: 'Validées' }
];

const statusLabels = {
  nouvelle: 'Nouvelle',
  en_revision: 'À compléter',
  acceptee: 'Validée',
  refusee: 'Refusée'
};

export default function AdminCandidatures() {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [candidatures, setCandidatures] = useState([]);
  const [summary, setSummary] = useState({ nouvelles: 0, aCompleter: 0, validees: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    try {
      const res = await getAdminSessions({ status: 'active' });
      setSessions(res.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible de charger les sessions');
    }
  }, []);

  const buildQuery = useCallback(() => {
    const params = {};
    if (selectedStatus !== 'all') params.statut = selectedStatus;
    if (selectedSessionId) params.sessionId = selectedSessionId;
    if (search) params.search = search;
    return params;
  }, [selectedSessionId, selectedStatus, search]);

  const loadCandidatures = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminCandidatures(buildQuery());
      setCandidatures(res.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible de charger les candidatures');
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const params = {};
      if (selectedSessionId) params.sessionId = selectedSessionId;
      const res = await getAdminCandidaturesSummary(params);
      setSummary(res.data || { nouvelles: 0, aCompleter: 0, validees: 0 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible de charger les statistiques');
    } finally {
      setSummaryLoading(false);
    }
  }, [selectedSessionId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSessions();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadSessions]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSummary();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadSummary]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCandidatures();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadCandidatures]);

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selectedSessionId) || null,
    [sessions, selectedSessionId]
  );

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-950">Candidatures</h1>
        <p className="mt-2 text-sm text-gray-600">Traitez les candidatures, dossiers incomplets et décisions d'admission.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {statusFilters.map((filter) => {
          const value =
            filter.key === 'all'
              ? summary.nouvelles + summary.aCompleter + summary.validees
              : filter.key === 'nouvelle'
              ? summary.nouvelles
              : filter.key === 'en_revision'
              ? summary.aCompleter
              : summary.validees;
          const active = selectedStatus === filter.key;
          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => setSelectedStatus(filter.key)}
              className={`rounded-lg border p-5 text-left transition ${
                active ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-gray-200 bg-white hover:border-indigo-200'
              }`}
            >
              <p className="text-sm font-medium text-gray-500">{filter.label}</p>
              <p className="mt-3 text-3xl font-bold text-gray-950">{summaryLoading ? '...' : value}</p>
              <p className="mt-2 text-sm text-gray-500">Cliquez pour filtrer cette vue.</p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <label className="block text-sm font-medium text-gray-700">Session de formation</label>
          <select
            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={selectedSessionId}
            onChange={(event) => setSelectedSessionId(event.target.value)}
          >
            <option value="">Toutes les sessions</option>
            {sessions.map((session) => (
              <option key={session.id || session._id} value={session.id || session._id}>
                {session.nom} — {session.formation}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 rounded-lg border border-gray-200 bg-white p-4">
          <label className="block text-sm font-medium text-gray-700">Recherche</label>
          <input
            type="search"
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Rechercher une candidature par nom, prénom ou email"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {selectedSession && (
            <p className="mt-3 text-sm text-gray-500">
              Filtre actif : session « {selectedSession.nom} » pour la formation « {selectedSession.formation} ».
            </p>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-semibold text-gray-950">Liste des candidatures</h2>
          <p className="mt-1 text-sm text-gray-600">{loading ? 'Chargement des candidatures...' : `${candidatures.length} candidature(s) affichée(s)`}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Nom</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Formation</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Reçu le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {!loading && candidatures.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-sm text-gray-500">
                    Aucune candidature trouvée pour ces critères.
                  </td>
                </tr>
              ) : (
                candidatures.map((item) => (
                  <tr key={item._id || item.id}>
                    <td className="px-4 py-4 text-sm text-gray-900">{item.prenom} {item.nom}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{item.email}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{item.formation}</td>
                    <td className="px-4 py-4 text-sm">
                      <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-800">
                        {statusLabels[item.statut] || item.statut}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
