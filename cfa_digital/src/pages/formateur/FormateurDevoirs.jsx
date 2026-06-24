import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { getFormateurDevoirs, corrigerDevoir, createDevoir } from '../../services/devoirService';
import { getCohortes } from '../../services/formateurService';

export default function FormateurDevoirs() {
  const [tab, setTab] = useState('publies'); // publies, acorriger, enretard
  const [loading, setLoading] = useState(true);
  const [devoirs, setDevoirs] = useState([]);
  const [rendus, setRendus] = useState([]);
  const [cohortes, setCohortes] = useState([]);

  // Modale de création
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDevoir, setNewDevoir] = useState({
    titre: '',
    description: '',
    matiere: '',
    dateLimite: '',
    cohorteId: ''
  });
  const [newDevoirFile, setNewDevoirFile] = useState(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [devoirRes, cohorteRes] = await Promise.all([
        getFormateurDevoirs(),
        getCohortes()
      ]);
      setDevoirs(devoirRes.data?.devoirs || []);
      setRendus(devoirRes.data?.rendus || []);
      setCohortes(cohorteRes.data || []);
      
      if (cohorteRes.data && cohorteRes.data.length > 0) {
        setNewDevoir(prev => ({ ...prev, cohorteId: cohorteRes.data[0]._id }));
      }
    } catch {
      toast.error('Impossible de charger les données');
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

  const toCorrect = useMemo(() => rendus.filter((r) => r.statut === 'rendu'), [rendus]);
  const late = useMemo(() => rendus.filter((r) => r.statut === 'en retard'), [rendus]);
  const [editingRendu, setEditingRendu] = useState(null);

  const openCorrectionModal = (rendu) => setEditingRendu(rendu);
  const closeCorrectionModal = () => setEditingRendu(null);

  const handleSubmitCorrection = async ({ renduId, note, commentaire, fichier }) => {
    try {
      let fichierCorrige = undefined;
      if (fichier) {
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(fichier);
        });
        fichierCorrige = [{ url: dataUrl, nom: fichier.name }];
      }

      await corrigerDevoir(renduId, { note, commentaire, fichierCorrige });
      toast.success('Correction enregistrée');
      await load();
      closeCorrectionModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Impossible d\'enregistrer la correction');
    }
  };

  const handleCreateDevoir = async (e) => {
    e.preventDefault();
    if (!newDevoir.titre || !newDevoir.dateLimite || !newDevoir.cohorteId) {
      return toast.error('Veuillez remplir les champs obligatoires');
    }

    setCreating(true);
    try {
      let fichiers = [];
      if (newDevoirFile) {
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(newDevoirFile);
        });
        fichiers = [{ url: dataUrl, nom: newDevoirFile.name }];
      }

      await createDevoir({
        ...newDevoir,
        cohorte: newDevoir.cohorteId,
        fichiers
      });

      toast.success('Devoir publié avec succès');
      setShowCreateModal(false);
      setNewDevoir({ titre: '', description: '', matiere: '', dateLimite: '', cohorteId: cohortes[0]?._id || '' });
      setNewDevoirFile(null);
      await load();
      setTab('publies');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création du devoir');
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm flex-grow">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Espace formateur</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-950">Gestion des devoirs</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            Gérez la publication, la correction et suivez les retards des rendus.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <button
              onClick={() => setTab('publies')}
              className={`rounded-lg border p-4 text-left transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${tab === 'publies' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
            >
              <p className="text-sm text-gray-500">Devoirs publiés</p>
              <p className="mt-1 text-2xl font-bold text-gray-950">{devoirs.length}</p>
            </button>
            <button
              onClick={() => setTab('acorriger')}
              className={`rounded-lg border p-4 text-left transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${tab === 'acorriger' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
            >
              <p className="text-sm text-gray-500">À corriger</p>
              <p className="mt-1 text-2xl font-bold text-indigo-700">{toCorrect.length}</p>
            </button>
            <button
              onClick={() => setTab('enretard')}
              className={`rounded-lg border p-4 text-left transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${tab === 'enretard' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
            >
              <p className="text-sm text-gray-500">Rendus en retard</p>
              <p className="mt-1 text-2xl font-bold text-red-700">{late.length}</p>
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setShowCreateModal(true)}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm"
        >
          + Créer un nouveau devoir
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-950">
            {tab === 'publies' && 'Tous les devoirs publiés'}
            {tab === 'acorriger' && 'Rendus en attente de correction'}
            {tab === 'enretard' && 'Étudiants en retard de dépôt'}
          </h2>
        </div>

        <div className="p-5">
          {loading && <p className="text-sm text-gray-500">Chargement des données...</p>}

          {!loading && tab === 'publies' && (
            <div className="divide-y divide-gray-200 -mx-5 px-5">
              {devoirs.length === 0 && <p className="py-4 text-sm text-gray-500">Aucun devoir publié.</p>}
              {devoirs.map((d) => (
                <div key={d._id} className="py-4 grid gap-4 lg:grid-cols-[1fr_auto]">
                  <div>
                    <h3 className="font-semibold text-gray-950">{d.titre}</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Date limite : {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(d.dateLimite))}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">{d.matiere || 'Général'} | Cohorte concernée : {cohortes.find(c => c._id === d.cohorte)?.nom || 'Inconnue'}</p>
                    {d.fichiers && d.fichiers.length > 0 && (
                      <div className="mt-2">
                        <a href={d.fichiers[0].url} download={d.fichiers[0].nom} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                          📄 Pièce jointe : {d.fichiers[0].nom}
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="text-sm">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                      Publié
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && tab === 'acorriger' && (
            <div className="divide-y divide-gray-200 -mx-5 px-5">
              {toCorrect.length === 0 && <p className="py-4 text-sm text-gray-500">Aucun rendu à corriger.</p>}
              {toCorrect.map((r) => (
                <div key={r._id} className="py-4 grid gap-4 lg:grid-cols-[1fr_auto]">
                  <div>
                    <h3 className="font-semibold text-gray-950">{r.devoir?.titre}</h3>
                    <p className="mt-1 text-sm text-gray-600">Étudiant : {r.etudiant?.prenom} {r.etudiant?.nom}</p>
                    <p className="mt-1 text-sm text-gray-500">Remis le : {new Date(r.dateRendu).toLocaleString('fr-FR')}</p>
                    
                    {r.commentaire && (
                      <p className="mt-2 text-sm italic text-gray-600">"{r.commentaire}"</p>
                    )}
                    
                    {r.fichiers && r.fichiers.length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 rounded border">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Fichier de l'étudiant</p>
                        <a href={r.fichiers[0].url} download={r.fichiers[0].nom} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 break-all">
                          📥 {r.fichiers[0].nom}
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 justify-center">
                    <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700" onClick={() => openCorrectionModal(r)}>
                      Évaluer le devoir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && tab === 'enretard' && (
            <div className="divide-y divide-gray-200 -mx-5 px-5">
              {late.length === 0 && <p className="py-4 text-sm text-gray-500">Aucun retard à signaler.</p>}
              {late.map((r) => (
                <div key={r._id} className="py-4 grid gap-4 lg:grid-cols-[1fr_auto]">
                  <div>
                    <h3 className="font-semibold text-gray-950">{r.devoir?.titre}</h3>
                    <p className="mt-1 text-sm text-gray-600">Étudiant : {r.etudiant?.prenom} {r.etudiant?.nom}</p>
                    <p className="mt-1 text-sm text-red-600 font-medium">Date limite dépassée : {new Date(r.devoir?.dateLimite).toLocaleString('fr-FR')}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 justify-center">
                     <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                      En retard
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Création de Devoir */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !creating && setShowCreateModal(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b bg-gray-50 flex items-center justify-between">
              <h3 className="font-semibold text-lg text-gray-900">Publier un nouveau devoir</h3>
              <button disabled={creating} className="text-gray-400 hover:text-gray-600" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleCreateDevoir} className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700">Titre du devoir <span className="text-red-500">*</span></label>
                <input required type="text" value={newDevoir.titre} onChange={(e) => setNewDevoir(p => ({ ...p, titre: e.target.value }))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder="Ex: Projet React Final" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description / Consigne</label>
                <textarea rows={3} value={newDevoir.description} onChange={(e) => setNewDevoir(p => ({ ...p, description: e.target.value }))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder="Détaillez le travail attendu..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Matière</label>
                  <input type="text" value={newDevoir.matiere} onChange={(e) => setNewDevoir(p => ({ ...p, matiere: e.target.value }))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder="Ex: Informatique" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date limite <span className="text-red-500">*</span></label>
                  <input required type="datetime-local" value={newDevoir.dateLimite} onChange={(e) => setNewDevoir(p => ({ ...p, dateLimite: e.target.value }))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Classe / Cohorte cible <span className="text-red-500">*</span></label>
                <select required value={newDevoir.cohorteId} onChange={(e) => setNewDevoir(p => ({ ...p, cohorteId: e.target.value }))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                  {cohortes.map(c => <option key={c._id} value={c._id}>{c.nom}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Pièce jointe (sujet, ressources)</label>
                <input type="file" onChange={(e) => setNewDevoirFile(e.target.files[0])} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button type="button" disabled={creating} onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">Annuler</button>
                <button type="submit" disabled={creating} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">{creating ? 'Publication...' : 'Publier le devoir'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Correction */}
      {editingRendu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeCorrectionModal} />
          <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b bg-gray-50 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Évaluation : {editingRendu.devoir?.titre}</h3>
                <p className="text-sm text-gray-500 mt-1">Étudiant : {editingRendu.etudiant?.prenom} {editingRendu.etudiant?.nom}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600" onClick={closeCorrectionModal}>✕</button>
            </div>
            
            <div className="p-5 space-y-5 overflow-y-auto">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Travail rendu</h4>
                {editingRendu.fichiers && editingRendu.fichiers.length > 0 ? (
                  <a href={editingRendu.fichiers[0].url} download={editingRendu.fichiers[0].nom} className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2">
                    📥 Télécharger {editingRendu.fichiers[0].nom}
                  </a>
                ) : (
                  <p className="text-sm text-gray-500 italic">Aucune pièce jointe.</p>
                )}
                {editingRendu.commentaire && (
                  <div className="mt-3 text-sm text-gray-700 bg-white p-3 rounded border">
                    <strong>Message :</strong> {editingRendu.commentaire}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Note /20 <span className="text-red-500">*</span></label>
                <div className="mt-1 flex items-center gap-2">
                  <input id="corr-note" type="number" step="0.5" min="0" max="20" defaultValue={editingRendu.note || ''} className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder="Ex: 15" />
                  <span className="text-gray-500 font-medium">/ 20</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Commentaire de correction</label>
                <textarea id="corr-comment" rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" defaultValue={editingRendu.commentaireCorrection || ''} placeholder="Feedback pour l'étudiant..." />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Fichier annoté / corrigé (optionnel)</label>
                <input id="corr-file" type="file" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
              </div>
              
              <div className="pt-4 border-t flex justify-end gap-3">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" onClick={closeCorrectionModal}>Annuler</button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" onClick={async () => {
                  const noteValue = document.getElementById('corr-note').value;
                  if (!noteValue) return toast.error('Veuillez attribuer une note');
                  
                  const note = Number(noteValue);
                  const commentaire = document.getElementById('corr-comment').value || '';
                  const fileInput = document.getElementById('corr-file');
                  const fichier = fileInput?.files?.[0] || null;
                  await handleSubmitCorrection({ renduId: editingRendu._id, note, commentaire, fichier });
                }}>
                  Valider l'évaluation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
