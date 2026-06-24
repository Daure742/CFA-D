import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getAttestationStatus, postAdminDecision } from '../../services/attestationService';
import { getUsers } from '../../services/adminService';

export default function AdminAttestations() {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getUsers({ role: 'etudiant' });
        setStudents(data || []);
      } catch {
        // ignore
      }
    })();
  }, []);

  const loadStatus = async (etudiantId) => {
    setLoading(true);
    try {
      const { data } = await getAttestationStatus(etudiantId);
      setStatus(data);
      setSelected(etudiantId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible de charger le statut');
    } finally {
      setLoading(false);
    }
  };

  const sendDecision = async (allow) => {
    if (!selected) return;
    try {
      await postAdminDecision(selected, { allowContinue: allow, comment: allow ? 'Poursuite autorisée' : 'Poursuite refusée' });
      toast.success('Décision enregistrée');
      setStatus(null);
      setSelected(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la décision');
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Revue alertes d'absence</h1>
        <p className="text-sm text-gray-600">Sélectionnez un étudiant pour consulter son statut d'attestation et décider.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="font-semibold">Étudiants</h3>
          <div className="mt-3 space-y-2 max-h-96 overflow-auto">
            {students.map((s) => (
              <button
                key={s.id || s._id}
                className={`w-full text-left rounded p-2 hover:bg-gray-50 ${selected === (s.id || s._id) ? 'bg-indigo-50 text-indigo-800' : ''}`}
                onClick={() => loadStatus(s.id || s._id)}
              >
                {s.prenom} {s.nom} — {s.email}
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 rounded-lg border border-gray-200 bg-white p-4">
          {loading && <p className="text-sm text-gray-500">Chargement du statut...</p>}
          {!status && <p className="text-sm text-gray-500">Sélectionnez un étudiant pour voir les détails.</p>}
          {!loading && status && (
            <div>
              <p>Heures suivies: <strong>{Math.round(status.attendedHours)}</strong> h</p>
              <p>Heures prévues: <strong>{Math.round(status.expectedHours)}</strong> h</p>
              <p>Heures requises: <strong>{Math.round(status.requiredHours)}</strong> h</p>
              <p>Absences: <strong>{status.absentHours.toFixed(1)}</strong> h</p>
              <div className="mt-4 flex gap-2">
                <button className="rounded bg-emerald-600 px-4 py-2 text-white" onClick={() => sendDecision(true)}>Accepter la poursuite</button>
                <button className="rounded bg-red-600 px-4 py-2 text-white" onClick={() => sendDecision(false)}>Refuser la poursuite</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
