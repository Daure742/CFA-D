import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { getMesBulletins, getMesNotes } from '../../services/noteService';

const formatDate = (value) => {
  if (!value) return 'Date non definie';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(value));
};

export default function EtudiantNotes() {
  const [notes, setNotes] = useState([]);
  const [bulletins, setBulletins] = useState([]);
  const [loading, setLoading] = useState(true);

  const moyenne = useMemo(() => {
    if (notes.length === 0) return null;
    const totalCoef = notes.reduce((sum, note) => sum + (note.coefficient || 1), 0);
    const total = notes.reduce((sum, note) => sum + note.valeur * (note.coefficient || 1), 0);
    return totalCoef ? (total / totalCoef).toFixed(2) : null;
  }, [notes]);

  const byMatiere = useMemo(
    () =>
      notes.reduce((groups, note) => {
        const key = note.matiere || 'Module';
        return {
          ...groups,
          [key]: [...(groups[key] || []), note],
        };
      }, {}),
    [notes]
  );

  useEffect(() => {
    const loadNotes = async () => {
      setLoading(true);
      try {
        const [notesResponse, bulletinsResponse] = await Promise.all([getMesNotes(), getMesBulletins()]);
        setNotes(notesResponse.data);
        setBulletins(bulletinsResponse.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Impossible de charger les notes');
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, []);

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Espace etudiant</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-950">Notes et bulletins</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
          Consultez vos evaluations, moyennes, commentaires pedagogiques et bulletins publies.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Evaluations</p>
            <p className="mt-1 text-2xl font-bold text-gray-950">{notes.length}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Moyenne</p>
            <p className="mt-1 text-2xl font-bold text-indigo-700">{moyenne || '-'}/20</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Bulletins</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{bulletins.length}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-5">
            <h2 className="text-lg font-bold text-gray-950">Evaluations par matiere</h2>
          </div>

          {loading && <p className="p-5 text-sm text-gray-500">Chargement des notes...</p>}

          {!loading && notes.length === 0 && (
            <p className="p-5 text-sm text-gray-500">Aucune note publiee pour le moment.</p>
          )}

          {!loading && notes.length > 0 && (
            <div className="divide-y divide-gray-200">
              {Object.entries(byMatiere).map(([matiere, matiereNotes]) => (
                <section key={matiere} className="p-5">
                  <h3 className="font-semibold text-gray-950">{matiere}</h3>
                  <div className="mt-3 space-y-3">
                    {matiereNotes.map((note) => (
                      <article key={note._id} className="rounded-lg border border-gray-200 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-gray-900">{note.periode}</p>
                          <p className="text-lg font-bold text-indigo-700">{note.valeur}/20</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          Coefficient {note.coefficient || 1} | {formatDate(note.dateEvaluation || note.createdAt)}
                        </p>
                        {note.commentaire && <p className="mt-2 text-sm text-gray-500">{note.commentaire}</p>}
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        <aside className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-5">
            <h2 className="text-lg font-bold text-gray-950">Bulletins</h2>
          </div>
          {bulletins.length === 0 ? (
            <p className="p-5 text-sm text-gray-500">Aucun bulletin genere pour le moment.</p>
          ) : (
            <div className="divide-y divide-gray-200">
              {bulletins.map((bulletin) => (
                <article key={bulletin._id} className="p-5">
                  <p className="font-semibold text-gray-950">{bulletin.periode}</p>
                  <p className="mt-1 text-sm text-gray-600">Moyenne generale : {bulletin.moyenneGenerale?.toFixed?.(2) || bulletin.moyenneGenerale}/20</p>
                  <p className="mt-1 text-sm text-gray-600">Decision : {bulletin.decision || 'En cours'}</p>
                  {bulletin.fichierPDF && (
                    <a
                      href={bulletin.fichierPDF}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      Telecharger
                    </a>
                  )}
                </article>
              ))}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
