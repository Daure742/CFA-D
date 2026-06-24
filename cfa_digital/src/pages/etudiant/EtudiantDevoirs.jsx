import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { getMesDevoirs, rendreDevoir } from '../../services/devoirService';

const formatDate = (value) => {
  if (!value) return 'Date non définie';
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

const normalizeStatus = (status) => {
  const values = {
    'à faire': 'À faire',
    a_faire: 'À faire',
    rendu: 'Rendu',
    corrigé: 'Corrigé',
    corrige: 'Corrigé',
    'en retard': 'En retard',
  };
  return values[status] || status || 'À faire';
};

export default function EtudiantDevoirs() {
  const [devoirs, setDevoirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('tous'); // 'tous', 'todo', 'submitted', 'corrected', 'late'

  // Modal de rendu
  const [showRenduModal, setShowRenduModal] = useState(false);
  const [selectedDevoir, setSelectedDevoir] = useState(null);
  const [renduFile, setRenduFile] = useState(null);
  const [renduComment, setRenduComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const stats = useMemo(
    () => ({
      todo: devoirs.filter((item) => ['à faire', 'a_faire'].includes(item.statutEtudiant)).length,
      submitted: devoirs.filter((item) => item.rendu).length,
      corrected: devoirs.filter((item) => ['corrigé', 'corrige'].includes(item.rendu?.statut)).length,
      late: devoirs.filter((item) => item.statutEtudiant === 'en retard').length,
    }),
    [devoirs]
  );

  const filteredDevoirs = useMemo(() => {
    if (filter === 'todo') return devoirs.filter((item) => ['à faire', 'a_faire'].includes(item.statutEtudiant));
    if (filter === 'submitted') return devoirs.filter((item) => item.rendu);
    if (filter === 'corrected') return devoirs.filter((item) => ['corrigé', 'corrige'].includes(item.rendu?.statut));
    if (filter === 'late') return devoirs.filter((item) => item.statutEtudiant === 'en retard');
    return devoirs;
  }, [devoirs, filter]);

  const loadDevoirs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getMesDevoirs();
      setDevoirs(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Impossible de charger les devoirs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDevoirs();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadDevoirs]);

  const openRenduModal = (devoir) => {
    setSelectedDevoir(devoir);
    setRenduFile(null);
    setRenduComment('');
    setShowRenduModal(true);
  };

  const closeRenduModal = () => {
    setShowRenduModal(false);
    setSelectedDevoir(null);
    setRenduFile(null);
    setRenduComment('');
  };

  const handleSubmitRendu = async (e) => {
    e.preventDefault();
    if (!selectedDevoir) return;
    
    // Au moins un fichier ou un commentaire est attendu pour un rendu
    if (!renduFile && !renduComment.trim()) {
      return toast.error('Veuillez joindre un fichier ou écrire un commentaire pour votre rendu.');
    }

    setSubmitting(true);
    try {
      let fichiers = [];
      if (renduFile) {
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(renduFile);
        });
        fichiers = [{ url: dataUrl, nom: renduFile.name }];
      }

      await rendreDevoir(selectedDevoir._id, {
        fichiers,
        commentaire: renduComment
      });

      toast.success('Travail rendu avec succès !');
      closeRenduModal();
      await loadDevoirs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du dépôt du devoir');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Espace étudiant</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-950">Mes devoirs</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
          Suivez les travaux publiés par vos formateurs, déposez vos rendus, et consultez vos notes et corrections.
        </p>

        <div className="mt-6 flex flex-wrap gap-2 mb-4">
           <button onClick={() => setFilter('tous')} className={`px-4 py-2 rounded-full text-sm font-medium ${filter === 'tous' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Tous les devoirs</button>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <button
            onClick={() => setFilter('todo')}
            className={`rounded-lg border p-4 text-left transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${filter === 'todo' ? 'border-amber-600 bg-amber-50' : 'border-gray-200'}`}
          >
            <p className="text-sm text-gray-500">À faire</p>
            <p className="mt-1 text-2xl font-bold text-amber-700">{stats.todo}</p>
          </button>
          <button
            onClick={() => setFilter('submitted')}
            className={`rounded-lg border p-4 text-left transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${filter === 'submitted' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
          >
            <p className="text-sm text-gray-500">Déposés</p>
            <p className="mt-1 text-2xl font-bold text-indigo-700">{stats.submitted}</p>
          </button>
          <button
            onClick={() => setFilter('corrected')}
            className={`rounded-lg border p-4 text-left transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${filter === 'corrected' ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200'}`}
          >
            <p className="text-sm text-gray-500">Corrigés</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{stats.corrected}</p>
          </button>
          <button
            onClick={() => setFilter('late')}
            className={`rounded-lg border p-4 text-left transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${filter === 'late' ? 'border-red-600 bg-red-50' : 'border-gray-200'}`}
          >
            <p className="text-sm text-gray-500">En retard</p>
            <p className="mt-1 text-2xl font-bold text-red-700">{stats.late}</p>
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-5">
          <h2 className="text-lg font-bold text-gray-950">
            {filter === 'tous' && 'Travaux de ma cohorte'}
            {filter === 'todo' && 'Devoirs à réaliser'}
            {filter === 'submitted' && 'Travaux en attente de correction'}
            {filter === 'corrected' && 'Devoirs corrigés'}
            {filter === 'late' && 'Rendus en retard'}
          </h2>
        </div>

        {loading && <p className="p-5 text-sm text-gray-500">Chargement des devoirs...</p>}

        {!loading && filteredDevoirs.length === 0 && (
          <p className="p-5 text-sm text-gray-500">Aucun devoir dans cette catégorie.</p>
        )}

        {!loading && filteredDevoirs.length > 0 && (
          <div className="divide-y divide-gray-200">
            {filteredDevoirs.map((devoir) => {
              const statusFormated = normalizeStatus(devoir.statutEtudiant);
              const isTodoOrLate = ['À faire', 'En retard'].includes(statusFormated);
              const hasRendu = !!devoir.rendu;
              
              return (
                <article key={devoir._id} className="grid gap-4 p-5 lg:grid-cols-[1fr_300px]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-950 text-lg">{devoir.titre}</h3>
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        statusFormated === 'Corrigé' ? 'bg-emerald-100 text-emerald-800' :
                        statusFormated === 'En retard' ? 'bg-red-100 text-red-800' :
                        statusFormated === 'Rendu' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {statusFormated}
                      </span>
                    </div>
                    
                    <p className="mt-2 text-sm text-gray-600 font-medium">
                      Date limite : <span className={devoir.dateLimite < new Date().toISOString() && !hasRendu ? 'text-red-600' : ''}>{formatDate(devoir.dateLimite)}</span>
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {devoir.matiere || 'Module'} | Formateur : {devoir.formateur?.prenom} {devoir.formateur?.nom}
                    </p>
                    
                    {devoir.description && (
                      <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-100">
                        {devoir.description}
                      </div>
                    )}
                    
                    {/* Fichiers joints par le formateur (Consigne) */}
                    {devoir.fichiers && devoir.fichiers.length > 0 && (
                      <div className="mt-3">
                        <span className="text-xs font-semibold uppercase text-gray-500">Fichier(s) consigne :</span>
                        <div className="mt-1 flex flex-col gap-1">
                          {devoir.fichiers.map((f, idx) => (
                            <a key={idx} href={f.url} download={f.nom} target="_blank" rel="noreferrer" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                              📄 {f.nom}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Retour formateur */}
                    {devoir.rendu?.commentaireCorrection && (
                      <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-sm text-emerald-900">
                        <span className="font-bold block mb-1">Feedback du formateur :</span>
                        {devoir.rendu.commentaireCorrection}
                      </div>
                    )}
                    {/* Fichier corrigé */}
                    {devoir.rendu?.fichierCorrige && devoir.rendu.fichierCorrige.length > 0 && (
                      <div className="mt-2 text-sm">
                        <span className="font-semibold text-emerald-800">Fichier corrigé : </span>
                        <a href={devoir.rendu.fichierCorrige[0].url} download={devoir.rendu.fichierCorrige[0].nom} className="text-indigo-600 hover:underline">
                          {devoir.rendu.fichierCorrige[0].nom}
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-3 justify-start bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="text-sm">
                      {devoir.rendu?.note !== undefined && devoir.rendu?.note !== null ? (
                        <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3 text-center">
                          <span className="block text-xs uppercase text-indigo-800 font-semibold mb-1">Note obtenue</span>
                          <span className="text-3xl font-black text-indigo-600">{devoir.rendu.note}</span>
                          <span className="text-lg font-bold text-indigo-400">/20</span>
                        </div>
                      ) : hasRendu ? (
                        <p className="rounded-lg bg-white border px-4 py-3 font-semibold text-gray-700 text-center">
                          Dépôt effectué le<br/>
                          <span className="text-xs font-normal text-gray-500">{new Date(devoir.rendu.dateRendu).toLocaleString('fr-FR')}</span>
                        </p>
                      ) : (
                        <p className="rounded-lg bg-white border px-4 py-3 font-semibold text-gray-700 text-center">
                          En attente de dépôt
                        </p>
                      )}
                    </div>
                    
                    {/* Bouton d'action principale */}
                    {(!hasRendu || isTodoOrLate) && (
                      <button 
                        className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm transition-colors"
                        onClick={() => openRenduModal(devoir)}
                      >
                        Rendre le devoir
                      </button>
                    )}
                    
                    {/* Info sur le propre fichier rendu */}
                    {hasRendu && devoir.rendu.fichiers && devoir.rendu.fichiers.length > 0 && (
                      <div className="mt-auto pt-3 border-t border-gray-200">
                        <span className="text-xs text-gray-500 block mb-1">Votre fichier rendu :</span>
                        <a href={devoir.rendu.fichiers[0].url} download={devoir.rendu.fichiers[0].nom} className="text-xs font-medium text-indigo-600 break-all hover:underline line-clamp-2">
                          📎 {devoir.rendu.fichiers[0].nom}
                        </a>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Dépôt de Rendu */}
      {showRenduModal && selectedDevoir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !submitting && closeRenduModal()} />
          <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
            <div className="p-5 border-b bg-gray-50 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Déposer mon devoir</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedDevoir.titre}</p>
              </div>
              <button disabled={submitting} className="text-gray-400 hover:text-gray-600" onClick={closeRenduModal}>✕</button>
            </div>
            
            <form onSubmit={handleSubmitRendu} className="p-5 space-y-4">
              <div className="bg-blue-50 text-blue-800 p-3 rounded text-sm border border-blue-100">
                Vous êtes sur le point de rendre ce devoir. Assurez-vous d'avoir sélectionné le bon fichier.
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Fichier de rendu (PDF, DOCX, ZIP, etc.) <span className="text-red-500">*</span></label>
                <input 
                  type="file" 
                  onChange={(e) => setRenduFile(e.target.files[0])} 
                  className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-gray-200 rounded p-1" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Commentaire pour le formateur (Optionnel)</label>
                <textarea 
                  rows={3} 
                  value={renduComment} 
                  onChange={(e) => setRenduComment(e.target.value)} 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" 
                  placeholder="Informations complémentaires, difficultés rencontrées..." 
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-3 mt-6">
                <button type="button" disabled={submitting} onClick={closeRenduModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  Annuler
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {submitting ? 'Envoi en cours...' : 'Confirmer le dépôt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
