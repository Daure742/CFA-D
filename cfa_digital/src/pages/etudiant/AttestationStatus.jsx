import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { getAttestationStatus } from '../../services/attestationService';

export default function AttestationStatus() {
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const { data } = await getAttestationStatus(user._id);
        setStatus(data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Impossible de récupérer le statut');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (!user) return <p className="text-sm text-gray-500">Connectez-vous pour voir votre statut.</p>;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="text-lg font-semibold">Statut attestation</h3>
      {loading && <p className="text-sm text-gray-500">Chargement...</p>}
      {!loading && status && (
        <div className="mt-3 space-y-2 text-sm">
          <div>Heures suivies: <strong>{Math.round(status.attendedHours)}</strong> h</div>
          <div>Heures prévues (planning): <strong>{Math.round(status.expectedHours)}</strong> h</div>
          <div>Heures requises: <strong>{Math.round(status.requiredHours)}</strong> h</div>
          <div>Absences cumulées: <strong>{status.absentHours.toFixed(1)}</strong> h</div>
          <div>Eligibilité: <strong>{status.eligible ? 'Oui' : 'Non'}</strong></div>
          {status.needsAdminReview && (
            <div className="mt-2 rounded border-l-4 border-yellow-400 bg-yellow-50 p-2 text-yellow-800">
              Alerte: votre dossier nécessite une revue administrative. Un message a été envoyé aux responsables.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
