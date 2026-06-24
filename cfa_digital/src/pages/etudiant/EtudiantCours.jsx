import { useEffect, useMemo, useState, useContext } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { NotifContext } from '../../context/notif-context.js';
import { emarger, getCoursByCohorte } from '../../services/coursService';
import { getCoursDocuments } from '../../services/documentService';

const formatDate = (value) => {
  if (!value) return 'Non défini';
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
};

const getCourseStatus = (item) => {
  const now = new Date();
  if (item.statut === 'annulé') return 'Annulé';
  if (new Date(item.dateDebut) <= now && new Date(item.dateFin) >= now) return 'En direct';
  if (item.statut === 'terminé') return 'Terminé';
  return 'Planifié';
};

export default function EtudiantCours() {
  const { user } = useAuth();
  const { socket } = useContext(NotifContext);
  const [cours, setCours] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState('');
  const [filter, setFilter] = useState('tous'); // 'tous', 'live', 'replay', 'avenir'

  const stats = useMemo(() => {
    const live = cours.filter((item) => getCourseStatus(item) === 'En direct').length;
    const repels = cours.filter((item) => item.replayUrl).length;
    const upcoming = cours.filter((item) => getCourseStatus(item) === 'Planifié').length;
    return {
      total: cours.length,
      live,
      replay: repels,
      upcoming
    };
  }, [cours]);

  const filteredCours = useMemo(() => {
    if (filter === 'live') return cours.filter((item) => getCourseStatus(item) === 'En direct');
    if (filter === 'replay') return cours.filter((item) => item.replayUrl);
    if (filter === 'avenir') return cours.filter((item) => getCourseStatus(item) === 'Planifié');
    return cours;
  }, [cours, filter]);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.cohorte) {
        setCours([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [coursRes, docsRes] = await Promise.all([
          getCoursByCohorte(user.cohorte),
          getCoursDocuments(user.cohorte)
        ]);
        setCours(coursRes.data);
        setDocuments(docsRes.data);
      } catch {
        toast.error('Impossible de charger les données');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.cohorte]);

  useEffect(() => {
    if (!socket) return undefined;

    const onCoursLiveStart = (payload) => {
      if (!payload || !payload.coursId) return;
      setCours((prev) => prev.map((item) => (
        item._id === payload.coursId && payload.lien
          ? { ...item, lienVisio: payload.lien }
          : item
      )));
    };

    socket.on('cours-live-start', onCoursLiveStart);
    return () => {
      socket.off('cours-live-start', onCoursLiveStart);
    };
  }, [socket]);

  const handleJoinCourse = async (item) => {
    if (!item.lienVisio) return;

    setJoiningId(item._id);
    try {
      await emarger(item._id);
      try {
        if (typeof window !== 'undefined') localStorage.setItem('activeCoursId', item._id);
      } catch (err) {
        void err;
      }
      if (socket && socket.connected) {
        socket.emit('connexion-cours', item._id);
      }
      toast.success('Présence enregistrée automatiquement');
      window.open(item.lienVisio, '_blank', 'noopener,noreferrer');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Présence impossible à enregistrer');
    } finally {
      setJoiningId('');
    }
  };

  useEffect(() => {
    const onUnload = () => {
      try {
        if (typeof window !== 'undefined') localStorage.removeItem('activeCoursId');
      } catch (e) {
        void e;
      }
    };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, []);

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Espace étudiant</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-950">Mes cours</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
              Accédez aux cours planifiés, rejoignez les sessions live et regardez les replays publiés pour votre session.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <button
            onClick={() => setFilter('tous')}
            className={`rounded-lg border p-4 text-left transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${filter === 'tous' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
          >
            <p className="text-sm text-gray-500">Tous mes cours</p>
            <p className="mt-1 text-2xl font-bold text-gray-950">{stats.total}</p>
          </button>
          <button
            onClick={() => setFilter('live')}
            className={`rounded-lg border p-4 text-left transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${filter === 'live' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
          >
            <p className="text-sm text-gray-500">Live (En direct)</p>
            <p className="mt-1 text-2xl font-bold text-indigo-700">{stats.live}</p>
          </button>
          <button
            onClick={() => setFilter('replay')}
            className={`rounded-lg border p-4 text-left transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${filter === 'replay' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
          >
            <p className="text-sm text-gray-500">Replays disponibles</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{stats.replay}</p>
          </button>
          <button
            onClick={() => setFilter('avenir')}
            className={`rounded-lg border p-4 text-left transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${filter === 'avenir' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
          >
            <p className="text-sm text-gray-500">Cours à venir</p>
            <p className="mt-1 text-2xl font-bold text-amber-700">{stats.upcoming}</p>
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne principale : Liste des cours */}
        <div className="lg:col-span-2 rounded-lg border border-gray-200 bg-white shadow-sm self-start">
          <div className="border-b border-gray-200 p-5">
            <h2 className="text-lg font-bold text-gray-950">
              {filter === 'tous' && 'Tous les cours de ma session'}
              {filter === 'live' && 'Sessions en direct'}
              {filter === 'replay' && 'Replays de cours'}
              {filter === 'avenir' && 'Planning à venir'}
            </h2>
          </div>

          {loading && <p className="p-5 text-sm text-gray-500">Chargement des cours...</p>}

          {!loading && !user?.cohorte && (
            <div className="p-5 text-sm text-amber-700">
              Votre cohorte n’est pas encore définie. Contactez l’administration du CFA.
            </div>
          )}

          {!loading && user?.cohorte && filteredCours.length === 0 && (
            <div className="p-5 text-sm text-gray-500">
              Aucun cours ne correspond à cette catégorie.
            </div>
          )}

          {!loading && filteredCours.length > 0 && (
            <div className="divide-y divide-gray-200">
              {filteredCours.map((item) => {
                const status = getCourseStatus(item);
                const isLive = status === 'En direct';
                
                return (
                  <article key={item._id} className="grid gap-4 p-5 lg:grid-cols-[1fr_auto]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-gray-950">{item.titre}</h3>
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${isLive ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'}`}>
                          {status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        {formatDate(item.dateDebut)} - {formatDate(item.dateFin)}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {item.matiere || 'Module'} • {item.formateur?.prenom} {item.formateur?.nom}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">Modalité : {item.modalite}{item.salle ? ` | Salle : ${item.salle}` : ''}</p>
                      {item.description && <p className="mt-3 text-sm text-gray-500">{item.description}</p>}
                    </div>
                    <div className="flex flex-col gap-3 justify-center">
                      {isLive && item.lienVisio && (
                        <button
                          type="button"
                          onClick={() => handleJoinCourse(item)}
                          disabled={joiningId === item._id}
                          className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                          {joiningId === item._id ? 'Connexion...' : 'Rejoindre le cours'}
                        </button>
                      )}
                      {!isLive && item.lienVisio && status === 'Planifié' && (
                        <div className="text-sm text-gray-500 italic bg-gray-50 p-2 rounded border">
                          Le lien sera actif à l'heure du cours.
                        </div>
                      )}
                      {item.replayUrl && (
                        <a
                          href={item.replayUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                        >
                          Voir le replay
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Colonne latérale : Documents partagés */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm self-start">
          <div className="border-b border-gray-200 p-5 bg-indigo-50/50">
            <h2 className="text-lg font-bold text-gray-950 flex items-center gap-2">
              📄 Documents partagés
            </h2>
            <p className="text-xs text-gray-500 mt-1">Supports de cours fournis par vos formateurs</p>
          </div>
          
          <div className="p-0">
             {loading && <p className="p-5 text-sm text-gray-500">Chargement...</p>}
             
             {!loading && documents.length === 0 && (
               <p className="p-5 text-sm text-gray-500 italic text-center">Aucun document partagé pour le moment.</p>
             )}

             {!loading && documents.length > 0 && (
               <ul className="divide-y divide-gray-100">
                 {documents.map(doc => (
                   <li key={doc._id} className="p-4 hover:bg-gray-50 transition-colors">
                     <a href={doc.url} download={doc.nom} target="_blank" rel="noreferrer" className="block">
                       <p className="text-sm font-semibold text-indigo-700 hover:text-indigo-900 mb-1">{doc.nom}</p>
                       <p className="text-xs text-gray-500">
                         Mis en ligne le {new Date(doc.createdAt).toLocaleDateString('fr-FR')} 
                         {doc.uploadedBy ? ` par ${doc.uploadedBy.prenom} ${doc.uploadedBy.nom}` : ''}
                       </p>
                       {doc.cours && (
                         <p className="text-xs text-gray-400 mt-1 line-clamp-1">Lié au cours: {doc.cours.titre}</p>
                       )}
                     </a>
                   </li>
                 ))}
               </ul>
             )}
          </div>
        </div>
      </div>
    </section>
  );
}
