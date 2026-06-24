import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getAdminSessions, getCohorteWaitlist, removeCohorteWaitlistEntry, promoteCohorteWaitlistEntry } from '../../services/adminService';

export default function AdminWaitlists() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminSessions({ status: 'active' });
      setSessions(res.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible de charger les sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchSessions = async () => {
      if (cancelled) return;
      await loadSessions();
    };
    fetchSessions();
    return () => {
      cancelled = true;
    };
  }, [loadSessions]);

  const loadWaitlist = async (sessionId) => {
    if (!sessionId) return setWaitlist([]);
    setLoading(true);
    try {
      const res = await getCohorteWaitlist(sessionId);
      setSelectedSession({ id: res.data.id, nom: res.data.nom });
      setWaitlist(res.data.waitlist || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible de charger la liste d attente');
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (entryId) => {
    if (!selectedSession) return;
    if (!window.confirm('Promouvoir cet étudiant dans la cohorte ?')) return;
    setActionLoading(true);
    try {
      await promoteCohorteWaitlistEntry(selectedSession.id, entryId);
      toast.success('Étudiant promu');
      await loadWaitlist(selectedSession.id);
      await loadSessions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Promotion impossible');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async (entryId) => {
    if (!selectedSession) return;
    if (!window.confirm('Supprimer de la liste d attente ?')) return;
    setActionLoading(true);
    try {
      await removeCohorteWaitlistEntry(selectedSession.id, entryId);
      toast.success('Supprimé de la liste d attente');
      await loadWaitlist(selectedSession.id);
      await loadSessions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Suppression impossible');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Gestion des listes d'attente</h1>
        <p className="mt-2 text-sm text-gray-600">Consultez et gérez les listes d'attente par cohorte.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="font-semibold">Sélectionner une cohorte</h2>
            <div className="mt-3">
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                onChange={(e) => loadWaitlist(e.target.value)}
                defaultValue=""
              >
                <option value="">-- Choisir une cohorte --</option>
                {sessions.map((s) => (
                  <option key={s.id || s._id} value={s.id || s._id}>
                    {s.nom} — {s.formation}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="font-semibold">Liste d'attente {selectedSession ? `: ${selectedSession.nom}` : ''}</h2>
            <div className="mt-4">
              {loading ? (
                <p>Chargement...</p>
              ) : waitlist.length === 0 ? (
                <p className="text-sm text-gray-500">Aucune entrée sur la liste d'attente</p>
              ) : (
                <ul className="space-y-2">
                  {waitlist.map((entry) => (
                    <li key={entry._id} className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <div className="font-medium">{entry.nom} {entry.prenom}</div>
                        <div className="text-sm text-gray-500">{entry.email}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePromote(entry._id)}
                          disabled={actionLoading}
                          className="rounded-md bg-emerald-600 px-3 py-1 text-sm font-semibold text-white"
                        >
                          Promouvoir
                        </button>
                        <button
                          onClick={() => handleRemove(entry._id)}
                          disabled={actionLoading}
                          className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-semibold text-gray-700"
                        >
                          Supprimer
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
