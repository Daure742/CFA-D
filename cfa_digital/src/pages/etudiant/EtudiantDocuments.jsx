import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { getMesDocuments } from '../../services/documentService';
import { downloadAttestationPresence, getPresences } from '../../services/presenceService';
import { useAuth } from '../../hooks/useAuth';

const formatDate = (value) => {
  if (!value) return 'Non archive';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(value));
};

const hasAccepted = (document, userId) =>
  document.acceptations?.some((acceptation) => String(acceptation.etudiant) === String(userId));

export default function EtudiantDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [presences, setPresences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState('');

  const stats = useMemo(
    () => ({
      total: documents.length,
      required: documents.filter((item) => item.acceptationRequise).length,
      personal: documents.filter((item) => item.type === 'personnel').length,
      archived: documents.filter((item) => item.archive).length + presences.filter((item) => item.valideFormateur).length,
    }),
    [documents, presences]
  );

  useEffect(() => {
    const loadDocuments = async () => {
      setLoading(true);
      try {
        const [documentsResponse, presencesResponse] = await Promise.all([
          getMesDocuments(),
          getPresences(),
        ]);
        setDocuments(documentsResponse.data);
        setPresences(presencesResponse.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Impossible de charger les documents');
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);

  const handleDownloadAttestation = async (presenceId) => {
    setDownloadingId(presenceId);
    try {
      await downloadAttestationPresence(presenceId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Attestation indisponible');
    } finally {
      setDownloadingId('');
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Drive etudiant</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-950">Mes documents</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
          Retrouvez les documents du centre, documents personnels, attestations, bulletins et pieces a accepter.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Documents</p>
            <p className="mt-1 text-2xl font-bold text-gray-950">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Acceptation requise</p>
            <p className="mt-1 text-2xl font-bold text-amber-700">{stats.required}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Personnels</p>
            <p className="mt-1 text-2xl font-bold text-indigo-700">{stats.personal}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Archives</p>
            <p className="mt-1 text-2xl font-bold text-gray-700">{stats.archived}</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-5">
          <h2 className="text-lg font-bold text-gray-950">Attestations de presence</h2>
        </div>

        {loading && <p className="p-5 text-sm text-gray-500">Chargement des attestations...</p>}

        {!loading && presences.length === 0 && (
          <p className="p-5 text-sm text-gray-500">Aucune présence tracée pour le moment.</p>
        )}

        {!loading && presences.length > 0 && (
          <div className="divide-y divide-gray-200">
            {presences.map((presence) => (
              <article key={presence._id} className="grid gap-4 p-5 lg:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-950">{presence.cours?.titre || 'Cours'}</h3>
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                      {presence.statut}
                    </span>
                    {presence.valideFormateur && (
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                        Attestation disponible
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {formatDate(presence.cours?.dateDebut)} | Connexion : {formatDate(presence.heureDebut)}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Duree tracee : {presence.dureeMinutes || 0} min | Validation formateur : {presence.valideFormateur ? 'oui' : 'en attente'}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadAttestation(presence._id)}
                    disabled={!presence.valideFormateur || downloadingId === presence._id}
                    className="rounded-md bg-emerald-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {downloadingId === presence._id ? 'Generation...' : 'Attestation PDF'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-5">
          <h2 className="text-lg font-bold text-gray-950">Documents disponibles</h2>
        </div>

        {loading && <p className="p-5 text-sm text-gray-500">Chargement du drive...</p>}

        {!loading && documents.length === 0 && (
          <p className="p-5 text-sm text-gray-500">Aucun document disponible pour le moment.</p>
        )}

        {!loading && documents.length > 0 && (
          <div className="divide-y divide-gray-200">
            {documents.map((document) => (
              <article key={document._id} className="grid gap-4 p-5 lg:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-950">{document.nom}</h3>
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                      {document.type}
                    </span>
                    {document.acceptationRequise && (
                      <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                        Acceptation obligatoire
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Version {document.version || 1} | Archive : {formatDate(document.dateArchivage)}
                  </p>
                  {document.description && <p className="mt-2 text-sm text-gray-500">{document.description}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  {document.url && (
                    <a
                      href={document.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      Telecharger
                    </a>
                  )}
                  {document.acceptationRequise && (
                    <span className="text-xs font-semibold text-gray-600">
                      {hasAccepted(document, user?.id || user?._id) ? 'Accepte' : 'A verifier'}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
