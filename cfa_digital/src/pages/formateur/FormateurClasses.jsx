import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { getFormateurCours } from '../../services/formateurService';
import { shareDocument } from '../../services/documentService';
import { downloadFeuillePresence, getPresencesCours, downloadAttestationPresence } from '../../services/presenceService';
import { lancerCours, terminerCours, validerEmargement, publishReplay } from '../../services/coursService';

const formatDate = (value) => {
  if (!value) return 'Non défini';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
};

function FormateurClasses() {
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState('');
  const [replayByCours, setReplayByCours] = useState({});
  const [filter, setFilter] = useState('tous'); // 'tous', 'en_cours', 'replays'
  const [now, setNow] = useState(new Date());

  // Modal partage de document
  const [showShareModal, setShowShareModal] = useState(false);
  const [docFile, setDocFile] = useState(null);
  const [docName, setDocName] = useState('');
  const [docCoursId, setDocCoursId] = useState('');

  const isReadyToLaunch = (item) => {
    const start = new Date(item.dateDebut);
    const end = new Date(item.dateFin);
    return item.statut !== 'en_cours' && item.statut !== 'terminé' && start <= now && end >= now;
  };

  const isStartingSoon = (item) => {
    const start = new Date(item.dateDebut);
    const soon = new Date(now.getTime() + 15 * 60 * 1000);
    return item.statut !== 'en_cours' && item.statut !== 'terminé' && start > now && start <= soon;
  };

  const findCoursToStart = () => cours.find(isReadyToLaunch) || cours.find(isStartingSoon);

  const stats = useMemo(() => ({
    total: cours.length,
    live: cours.filter((item) => item.statut === 'en_cours').length,
    replays: cours.filter((item) => item.replayUrl).length,
  }), [cours]);

  const filteredCours = useMemo(() => {
    if (filter === 'en_cours') return cours.filter((item) => item.statut === 'en_cours');
    if (filter === 'replays') return cours.filter((item) => item.replayUrl);
    return cours;
  }, [cours, filter]);

  const loadCours = async () => {
    setLoading(true);
    try {
      const { data } = await getFormateurCours();
      setCours(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Impossible de charger vos cours');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(loadCours);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 15 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleValidatePresenceGlobal = async () => {
    const live = cours.filter((c) => c.statut === 'en_cours');
    const ready = cours.filter(isReadyToLaunch);
    const target = live[0] || ready[0];
    if (!target) {
      toast.error('Aucun cours en direct ou prêt à valider à cette heure');
      return;
    }
    await openPresences(target._id);
  };

  const handleCoursDirectGlobal = async () => {
    const live = cours.find((c) => c.statut === 'en_cours');
    if (live) {
      if (live.lienVisio) {
        window.open(live.lienVisio, '_blank');
        toast.success('Cours en direct — lien ouvert');
      } else {
        toast.error('Cours en cours mais aucun lien disponible');
      }
      return;
    }

    // Allow formateur to start a course at any time after confirmation
    const nextCourse = findCoursToStart() || cours[0];
    if (!nextCourse) {
      toast.error('Aucun cours disponible pour démarrer');
      return;
    }

    const confirmMsg = `Vous acceptez le commencement de ce cours direct: "${nextCourse.titre}" ?`;
    const ok = window.confirm(confirmMsg);
    if (!ok) return;

    try {
      await handleLancerCours(nextCourse._id, true);
    } catch {
      // handleLancerCours shows toasts on error
    }
  };

  const handleCoursDirect = async (item) => {
    if (item.statut === 'en_cours' && item.lienVisio) {
      window.open(item.lienVisio, '_blank');
      toast.success('Cours en direct — lien ouvert');
      return;
    }

    // Ask confirmation and allow starting even if outside scheduled time
    const confirmMsg = `Vous acceptez le commencement de ce cours direct: "${item.titre}" ?`;
    const ok = window.confirm(confirmMsg);
    if (!ok) return;

    try {
      await handleLancerCours(item._id, true);
    } catch {
      // handleLancerCours shows toasts on error
    }
  };

  const handleLancerCours = async (coursId, openLink = true) => {
    setActionId(coursId);
    try {
      const res = await lancerCours(coursId);
      const coursRes = res?.data || res;
      toast.success('Session lancée');
      await loadCours();
      const lien = coursRes?.lienVisio || (coursRes?.cours && coursRes.cours.lienVisio) || null;
      if (openLink && lien) {
        window.open(lien, '_blank');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Impossible de lancer la session');
    } finally {
      setActionId('');
    }
  };

  const runAction = async (coursId, action, successMessage) => {
    setActionId(coursId);
    try {
      await action();
      toast.success(successMessage);
      await loadCours();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action impossible');
    } finally {
      setActionId('');
    }
  };

  const handlePublishReplay = async (coursId) => {
    const url = replayByCours[coursId];
    if (!url) return toast.error('Veuillez entrer un lien replay valide');
    runAction(coursId, () => publishReplay(coursId, url), 'Replay publié avec succès');
  };

  const handleShareDocument = async (e) => {
    e.preventDefault();
    if (!docName || !docFile || !docCoursId) return toast.error('Veuillez remplir tous les champs');

    const selectedCours = cours.find(c => c._id === docCoursId);
    if (!selectedCours) return toast.error('Cours invalide');

    setActionId('share_doc');
    try {
      const formData = new FormData();
      formData.append('nom', docName);
      formData.append('fichier', docFile);
      formData.append('coursId', docCoursId);
      formData.append('cohorteId', selectedCours.cohorte?._id || selectedCours.cohorte);

      await shareDocument(formData);
      toast.success('Document partagé avec succès');
      setShowShareModal(false);
      setDocName('');
      setDocFile(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du partage');
    } finally {
      setActionId('');
    }
  };

  const handleDownloadSheet = async (coursId) => {
    setActionId(coursId);
    try {
      await downloadFeuillePresence(coursId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Export PDF impossible');
    } finally {
      setActionId('');
    }
  };

  const [openPresencesFor, setOpenPresencesFor] = useState(null);
  const [presencesList, setPresencesList] = useState([]);

  const openPresences = async (coursId) => {
    setActionId(coursId);
    try {
      const { data } = await getPresencesCours(coursId);
      setPresencesList(data || []);
      setOpenPresencesFor(coursId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Impossible de charger les presences');
    } finally {
      setActionId('');
    }
  };

  const handleValidateAll = async (coursId) => {
    setActionId(coursId);
    try {
      await validerEmargement(coursId);
      toast.success('Présences validées');
      setOpenPresencesFor(null);
      await loadCours();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Validation impossible');
    } finally {
      setActionId('');
    }
  };

  const handleDownloadAttestation = async (presenceId) => {
    setActionId(presenceId);
    try {
      await downloadAttestationPresence(presenceId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Impossible de télécharger l attestation');
    } finally {
      setActionId('');
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm flex-grow">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Espace formateur</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-950">Cours live et presences</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            Lancez vos sessions, validez les presences et ajoutez le lien replay apres le cours.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <button
              onClick={() => setFilter('tous')}
              className={`rounded-lg border p-4 text-left transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${filter === 'tous' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
            >
              <p className="text-sm text-gray-500">Cours assignes</p>
              <p className="mt-1 text-2xl font-bold text-gray-950">{stats.total}</p>
            </button>
            <button
              onClick={() => setFilter('en_cours')}
              className={`rounded-lg border p-4 text-left transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${filter === 'en_cours' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
            >
              <p className="text-sm text-gray-500">En direct</p>
              <p className="mt-1 text-2xl font-bold text-indigo-700">{stats.live}</p>
            </button>
            <button
              onClick={() => setFilter('replays')}
              className={`rounded-lg border p-4 text-left transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${filter === 'replays' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
            >
              <p className="text-sm text-gray-500">Replays publies</p>
              <p className="mt-1 text-2xl font-bold text-emerald-700">{stats.replays}</p>
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end items-center gap-3">
        <button
          onClick={handleValidatePresenceGlobal}
          className="rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-900 shadow-sm"
        >
          Valider Présence
        </button>

        <button
          onClick={handleCoursDirectGlobal}
          className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm"
        >
          Cours Direct
        </button>

        <button
          onClick={() => setShowShareModal(true)}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm"
        >
          Partager un document (PDF/DOC)
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-5 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-950">
            {filter === 'tous' && 'Tous mes cours'}
            {filter === 'en_cours' && 'Cours en direct'}
            {filter === 'replays' && 'Cours avec replay'}
          </h2>
        </div>
        {loading && <p className="p-5 text-sm text-gray-500">Chargement des sessions...</p>}
        {!loading && filteredCours.length === 0 && (
          <p className="p-5 text-sm text-gray-500">Aucun cours ne correspond à ce filtre.</p>
        )}
        {!loading && filteredCours.length > 0 && (
          <div className="divide-y divide-gray-200">
            {filteredCours.map((item) => (
              <article key={item._id} className="grid gap-4 p-5 xl:grid-cols-[1fr_320px]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-950">{item.titre}</h3>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${item.statut === 'en_cours' ? 'bg-indigo-100 text-indigo-800' : item.statut === 'terminé' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>
                      {item.statut}
                    </span>
                    {item.cohorte?.nom && (
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                        {item.cohorte.nom}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {formatDate(item.dateDebut)} - {formatDate(item.dateFin)}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {item.matiere || 'Module'} | {item.modalite}{item.salle ? ` | ${item.salle}` : ''}
                  </p>
                  
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {isReadyToLaunch(item) && (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
                        Prêt à démarrer maintenant
                      </span>
                    )}
                    {isStartingSoon(item) && (
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                        Démarre bientôt
                      </span>
                    )}
                    {item.statut === 'en_cours' && (
                      <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-800">
                        En direct
                      </span>
                    )}
                  </div>

                  {item.lienVisio && (
                    <div className="mt-3 flex flex-col items-start gap-1 p-3 rounded bg-blue-50 border border-blue-100">
                      <span className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Lien Google Meet de la session</span>
                      <a href={item.lienVisio} target="_blank" rel="noreferrer" className="inline-flex text-sm font-semibold text-indigo-600 hover:text-indigo-800 break-all">
                        {item.lienVisio}
                      </a>
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-gray-50 rounded border flex items-center gap-2">
                    <input
                      className="flex-grow rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white"
                      placeholder={item.replayUrl || 'https://lien-vers-le-replay...'}
                      value={replayByCours[item._id] !== undefined ? replayByCours[item._id] : (item.replayUrl || '')}
                      onChange={(event) => setReplayByCours((current) => ({ ...current, [item._id]: event.target.value }))}
                    />
                    <button
                      type="button"
                      onClick={() => handlePublishReplay(item._id)}
                      disabled={actionId === item._id || !replayByCours[item._id] || replayByCours[item._id] === item.replayUrl}
                      className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      Publier Replay
                    </button>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                  <button
                    type="button"
                    onClick={() => handleCoursDirect(item)}
                    disabled={actionId === item._id}
                    className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {item.statut === 'en_cours' ? 'Ouvrir Cours Direct' : 'Cours Direct'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLancerCours(item._id)}
                    disabled={actionId === item._id || item.statut === 'en_cours'}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    Lancer la session
                  </button>
                  <button
                    type="button"
                    onClick={() => openPresences(item._id)}
                    disabled={actionId === item._id}
                    className="rounded-md bg-gray-950 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    Valider presences
                  </button>
                  <button
                    type="button"
                    onClick={() => runAction(item._id, () => terminerCours(item._id, {}), 'Session terminee')}
                    disabled={actionId === item._id || item.statut === 'terminé'}
                    className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    Terminer le cours
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadSheet(item._id)}
                    disabled={actionId === item._id}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                  >
                    Feuille PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => openPresences(item._id)}
                    className="rounded-md border border-indigo-600 text-indigo-600 px-4 py-2 text-sm font-semibold hover:bg-indigo-50"
                  >
                    Voir présences
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowShareModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded shadow-lg overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
              <h3 className="font-semibold text-lg">Partager un document</h3>
              <button className="text-gray-500 hover:text-gray-800" onClick={() => setShowShareModal(false)}>✕</button>
            </div>
            <form onSubmit={handleShareDocument} className="p-4 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Cours / Session</span>
                <select 
                  required
                  value={docCoursId}
                  onChange={(e) => setDocCoursId(e.target.value)}
                  className="mt-1 block w-full rounded border-gray-300 py-2 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Sélectionnez un cours</option>
                  {cours.map(c => (
                    <option key={c._id} value={c._id}>{c.titre} ({c.cohorte?.nom})</option>
                  ))}
                </select>
              </label>
              
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Titre du document</span>
                <input
                  required
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="mt-1 block w-full rounded border-gray-300 py-2 px-3 text-sm border focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Ex: Support de cours - React JS"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Fichier (PDF, DOC)</span>
                <input
                  required
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setDocFile(e.target.files[0])}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </label>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowShareModal(false)} className="rounded px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">
                  Annuler
                </button>
                <button disabled={actionId === 'share_doc'} type="submit" className="rounded bg-indigo-600 px-4 py-2 text-sm text-white font-semibold hover:bg-indigo-700 disabled:opacity-50">
                  {actionId === 'share_doc' ? 'Envoi...' : 'Partager aux étudiants'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {openPresencesFor && (
        <PresencesPanel
          coursId={openPresencesFor}
          presences={presencesList}
          onClose={() => setOpenPresencesFor(null)}
          onValidateAll={handleValidateAll}
          onDownloadAttestation={handleDownloadAttestation}
        />
      )}
    </section>
  );
}

export function PresencesPanel({ coursId, presences = [], onClose, onValidateAll, onDownloadAttestation }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white rounded shadow-lg overflow-auto" style={{ maxHeight: '80vh' }}>
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Feuille de présence - {coursId}</h3>
          <div className="flex gap-2">
            <button className="rounded bg-emerald-600 px-3 py-1 text-white" onClick={() => onValidateAll(coursId)}>Valider toutes</button>
            <button className="rounded bg-gray-200 px-3 py-1" onClick={onClose}>Fermer</button>
          </div>
        </div>
        <div className="p-4 space-y-2">
          {presences.length === 0 && <p className="text-sm text-gray-500">Aucune présence enregistrée.</p>}
          {presences.map((p) => (
            <div key={p._id} className="flex items-center justify-between border p-3 rounded">
              <div>
                <div className="font-semibold">{p.etudiant?.prenom} {p.etudiant?.nom}</div>
                <div className="text-sm text-gray-600">Statut: {p.statut} — Validé formateur: {p.valideFormateur ? 'Oui' : 'Non'}</div>
              </div>
              <div className="flex gap-2">
                <button
                  disabled={p.valideFormateur}
                  onClick={async () => {
                    try {
                      await import('../../services/presenceService').then((m) => m.updatePresence(p._id, { valideFormateur: true }));
                      toast.success('Présence validée');
                      onValidateAll(p.cours || p.coursId || p.coursId);
                    } catch (err) {
                      console.error(err);
                      toast.error('Erreur lors de la validation');
                    }
                  }}
                  className="rounded bg-indigo-600 px-3 py-1 text-white disabled:opacity-50"
                >
                  Valider
                </button>
                <button disabled={!p.valideFormateur} onClick={() => onDownloadAttestation(p._id)} className="rounded border px-3 py-1 text-sm disabled:opacity-50">Télécharger attestation</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FormateurClasses;
