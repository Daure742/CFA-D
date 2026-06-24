import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getCohortes } from '../../services/formateurService';
import { upsertNote } from '../../services/noteService';

export default function FormateurNotes() {
  const [cohortes, setCohortes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getCohortes();
      setCohortes(data || []);
      if (data && data.length > 0) setSelected(data[0]._id);
    } catch {
      toast.error('Impossible de charger les cohortes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  const handleSaveNote = async (etudiantId, matiere, valeur) => {
    try {
      await upsertNote({ etudiantId, matiere, valeur, cohorte: selected });
      toast.success('Note enregistrée');
    } catch {
      toast.error('Impossible d enregistrer la note');
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Saisie des notes</h1>
        <p className="text-sm text-gray-600">Sélectionnez une cohorte, saisissez les évaluations et publiez-les.</p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        {loading && <p className="text-sm text-gray-500">Chargement...</p>}
        {!loading && cohortes.length === 0 && <p className="text-sm text-gray-500">Aucune cohorte disponible.</p>}
        {!loading && cohortes.length > 0 && (
          <div>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700">Choisir une cohorte</span>
              <select value={selected || ''} onChange={(e) => setSelected(e.target.value)} className="mt-1 rounded border px-3 py-2">
                {cohortes.map((c) => (<option key={c._id} value={c._id}>{c.nom}</option>))}
              </select>
            </label>

            <div className="space-y-3">
              {(cohortes.find(c => c._id === selected)?.etudiants || []).map((et) => (
                <div key={et._id} className="flex items-center justify-between border p-3 rounded">
                  <div>{et.prenom} {et.nom}</div>
                  <div className="flex items-center gap-2">
                    <input type="number" min="0" max="20" placeholder="Note" id={`note-${et._id}`} className="rounded border px-2 py-1 w-24" />
                    <button className="rounded bg-indigo-600 px-3 py-1 text-white" onClick={() => handleSaveNote(et._id, 'Evaluation', Number(document.getElementById(`note-${et._id}`).value || 0))}>Enregistrer</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
