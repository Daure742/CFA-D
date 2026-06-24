import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { downloadAttestationPresence, downloadFeuillePresence, getPresences } from '../../services/presenceService';

const formatDate = (value) => {
  if (!value) return 'Non defini';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
};

export default function AdminRapports() {
  const [presences, setPresences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState('');

  const coursIds = useMemo(
    () => [...new Set(presences.map((presence) => presence.cours?._id).filter(Boolean))],
    [presences]
  );

  const stats = useMemo(() => ({
    presences: presences.length,
    cours: coursIds.length,
    validated: presences.filter((presence) => presence.valideFormateur).length,
    attestations: presences.filter((presence) => presence.valideFormateur && presence.statut === 'présent').length,
  }), [coursIds.length, presences]);

  useEffect(() => {
    const loadPresences = async () => {
      setLoading(true);
      try {
        const { data } = await getPresences();
        setPresences(data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Impossible de charger les presences');
      } finally {
        setLoading(false);
      }
    };

    loadPresences();
  }, []);

  const runDownload = async (id, action) => {
    setActionId(id);
    try {
      await action();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Export PDF impossible');
    } finally {
      setActionId('');
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Administration</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-950">Presence et attestations</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
          Consultez les connexions tracees, exportez les feuilles de presence et recuperez les attestations individuelles.
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Presences</p>
            <p className="mt-1 text-2xl font-bold text-gray-950">{stats.presences}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Cours suivis</p>
            <p className="mt-1 text-2xl font-bold text-indigo-700">{stats.cours}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Validees</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{stats.validated}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Attestations</p>
            <p className="mt-1 text-2xl font-bold text-amber-700">{stats.attestations}</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-5">
          <h2 className="text-lg font-bold text-gray-950">Traçabilite des connexions</h2>
        </div>
        {loading && <p className="p-5 text-sm text-gray-500">Chargement des presences...</p>}
        {!loading && presences.length === 0 && (
          <p className="p-5 text-sm text-gray-500">Aucune presence enregistree pour le moment.</p>
        )}
        {!loading && presences.length > 0 && (
          <div className="divide-y divide-gray-200">
            {presences.map((presence) => (
              <article key={presence._id} className="grid gap-4 p-5 xl:grid-cols-[1fr_260px]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-950">{presence.cours?.titre || 'Cours'}</h3>
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                      {presence.statut}
                    </span>
                    {presence.valideFormateur && (
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                        Validee
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {presence.etudiant?.prenom} {presence.etudiant?.nom} | {presence.etudiant?.email}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Cours : {formatDate(presence.cours?.dateDebut)} | Connexion : {formatDate(presence.heureDebut)} | Duree : {presence.dureeMinutes || 0} min
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                  <button
                    type="button"
                    onClick={() => runDownload(`sheet-${presence.cours?._id}`, () => downloadFeuillePresence(presence.cours?._id))}
                    disabled={!presence.cours?._id || actionId === `sheet-${presence.cours?._id}`}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                  >
                    Feuille PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => runDownload(presence._id, () => downloadAttestationPresence(presence._id))}
                    disabled={!presence.valideFormateur || actionId === presence._id}
                    className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    Attestation PDF
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
