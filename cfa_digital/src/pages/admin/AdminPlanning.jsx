import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  createAdminCours,
  createAdminSession,
  getAdminFormateurs,
  getAdminPlanning,
  getAdminSessions,
  publierPlanningTo,
  getUsers,
  blockUser,
  unblockUser,
  deleteUser,
} from '../../services/adminService';

const formations = [
  'Developpement web',
  'Administration systemes',
  'Gestion et relation client',
  'Parcours individualise',
];

const DEFAULT_SCHEDULES = {
  'Developpement web': {
    '08:00-10:00': {
      Lundi: { titre: 'HTML5 & Structure Web', formateurHint: 'Rakoto' },
      Mardi: { titre: 'CSS3 & Responsive Design', formateurHint: 'Hanta' },
      Mercredi: { titre: 'JavaScript Fondamental', formateurHint: 'Andry' },
      Jeudi: { titre: 'Node.js & Express', formateurHint: 'Solo' },
      Vendredi: { titre: 'MongoDB', formateurHint: 'Rabe' }
    },
    '10:00-12:00': {
      Lundi: { titre: 'Projet HTML', formateurHint: 'Rakoto' },
      Mardi: { titre: 'Projet CSS', formateurHint: 'Hanta' },
      Mercredi: { titre: 'Exercices JavaScript', formateurHint: 'Andry' },
      Jeudi: { titre: 'API REST', formateurHint: 'Solo' },
      Vendredi: { titre: 'Projet Full Stack', formateurHint: 'Rabe' }
    }
  },
  'Administration systemes': {
    '08:00-10:00': {
      Lundi: { titre: 'Introduction Linux', formateurHint: 'Ando' },
      Mardi: { titre: 'Gestion des Utilisateurs', formateurHint: 'Jean' },
      Mercredi: { titre: 'Réseaux Informatiques', formateurHint: 'Nomena' },
      Jeudi: { titre: 'Sécurité Système', formateurHint: 'Fara' },
      Vendredi: { titre: 'Virtualisation', formateurHint: 'Solo' }
    },
    '10:00-12:00': {
      Lundi: { titre: 'Commandes Linux', formateurHint: 'Ando' },
      Mardi: { titre: 'Services Réseau', formateurHint: 'Jean' },
      Mercredi: { titre: 'Configuration Routeur', formateurHint: 'Nomena' },
      Jeudi: { titre: 'Pare-feu & Sécurité', formateurHint: 'Fara' },
      Vendredi: { titre: 'Projet Administration', formateurHint: 'Solo' }
    }
  },
  'Gestion et relation client': {
    '08:00-10:00': {
      Lundi: { titre: 'Communication Professionnelle', formateurHint: 'Sarah' },
      Mardi: { titre: 'Accueil Client', formateurHint: 'Clara' },
      Mercredi: { titre: 'Gestion des Réclamations', formateurHint: 'David' },
      Jeudi: { titre: 'Techniques de Vente', formateurHint: 'Alain' },
      Vendredi: { titre: 'Fidélisation Client', formateurHint: 'Julie' }
    },
    '10:00-12:00': {
      Lundi: { titre: 'Étude de Cas', formateurHint: 'Sarah' },
      Mardi: { titre: 'Mise en Situation', formateurHint: 'Clara' },
      Mercredi: { titre: 'CRM', formateurHint: 'David' },
      Jeudi: { titre: 'Gestion Commerciale', formateurHint: 'Alain' },
      Vendredi: { titre: 'Projet Relation Client', formateurHint: 'Julie' }
    }
  },
  'Parcours individualise': {
    '08:00-10:00': {
      Lundi: { titre: 'Remise à Niveau Informatique', formateurHint: 'Fara' },
      Mardi: { titre: 'Bureautique', formateurHint: 'Ando' },
      Mercredi: { titre: 'Recherche d\'Emploi', formateurHint: 'Sarah' },
      Jeudi: { titre: 'Développement Personnel', formateurHint: 'David' },
      Vendredi: { titre: 'Projet Personnel', formateurHint: '' }
    },
    '10:00-12:00': {
      Lundi: { titre: 'Accompagnement Individualisé', formateurHint: 'Fara' },
      Mardi: { titre: 'Coaching', formateurHint: 'Ando' },
      Mercredi: { titre: 'CV & Lettre de Motivation', formateurHint: 'Sarah' },
      Jeudi: { titre: 'Préparation Entretien', formateurHint: 'David' },
      Vendredi: { titre: 'Suivi des Objectifs', formateurHint: '' }
    }
  }
};

const emptySessionForm = {
  nom: '',
  formation: formations[0],
  annee: new Date().getFullYear(),
  dateDebut: '',
  dateFin: '',
  capacite: 50,
  statut: 'ouverte',
};

const emptyCoursForm = {
  titre: '',
  matiere: '',
  description: '',
  dateDebut: '',
  dateFin: '',
  lienVisio: '',
  replayUrl: '',
  salle: '',
  modalite: 'distanciel',
  formateur: '',
};

const formatDate = (value) => {
  if (!value) return 'Non defini';
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

export default function AdminPlanning() {
  const [sessions, setSessions] = useState([]);
  const [formateurs, setFormateurs] = useState([]);
  const [cours, setCours] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [showSessionUsers, setShowSessionUsers] = useState(false);
  const [sessionUsers, setSessionUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [sessionForm, setSessionForm] = useState(emptySessionForm);
  const [coursForm, setCoursForm] = useState(emptyCoursForm);
  const [loading, setLoading] = useState(true);
  const [savingSession, setSavingSession] = useState(false);
  const [savingCours, setSavingCours] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishTargets, setPublishTargets] = useState([]);
  const [filterView, setFilterView] = useState('cours'); // 'sessions'|'cours'|'published'|'toPublish'
  const timeSlots = [
    { key: '08:00-10:00', start: '08:00', end: '10:00' },
    { key: '10:00-12:00', start: '10:00', end: '12:00' },
  ];

  const weekdays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  const [tableData, setTableData] = useState({});

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selectedSessionId),
    [sessions, selectedSessionId]
  );

  const stats = useMemo(() => {
    const publishedCourses = cours.filter((item) => item.visibleEtudiant).length;
    return {
      sessions: sessions.length,
      cours: cours.length,
      publishedCourses,
      unpublishedCourses: cours.length - publishedCourses,
    };
  }, [cours, sessions]);

  const displayedCourses = useMemo(() => {
    if (filterView === 'published') return cours.filter((c) => c.visibleEtudiant);
    if (filterView === 'toPublish') return cours.filter((c) => !c.visibleEtudiant);
    return cours;
  }, [filterView, cours]);

  const loadSessions = async () => {
    const { data } = await getAdminSessions();
    setSessions(data);
    setSelectedSessionId((current) => current || data[0]?.id || '');
  };

  const loadPlanning = async (sessionId) => {
    if (!sessionId) {
      setCours([]);
      return;
    }

    const { data } = await getAdminPlanning(sessionId);
    setCours(data);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const sessionsResponse = await getAdminSessions();
        const sessionsData = sessionsResponse.data || [];
        setSessions(sessionsData);
        const firstFormation = sessionsData[0]?.formation;
        // load formateurs filtered by the first session formation when available
        const formateursResponse = await getAdminFormateurs(firstFormation ? { formation: firstFormation } : {});
        setFormateurs(formateursResponse.data || []);
        setSelectedSessionId(sessionsData[0]?.id || '');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Chargement du planning impossible');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // When selected session changes, refresh planning and formateurs for that session's formation
  useEffect(() => {
    if (!selectedSessionId) return;
    const refreshForSession = async () => {
      try {
        const sel = sessions.find((s) => s.id === selectedSessionId || s._id === selectedSessionId);
        if (sel?.formation) {
          const res = await getAdminFormateurs({ formation: sel.formation });
          setFormateurs(res.data || []);
        }
      } catch {
        // ignore formateur load errors silently
      }
    };

    refreshForSession();
  }, [selectedSessionId, sessions]);

  useEffect(() => {
    const fetchPlanning = async () => {
      if (!selectedSessionId) {
        setCours([]);
        return;
      }

      try {
        const { data } = await getAdminPlanning(selectedSessionId);
        setCours(data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Chargement des cours impossible');
      }
    };

    fetchPlanning();
  }, [selectedSessionId]);

  const updateSessionForm = (field, value) => {
    setSessionForm((current) => ({ ...current, [field]: value }));
  };

  const updateCoursForm = (field, value) => {
    setCoursForm((current) => ({ ...current, [field]: value }));
  };

  const handleCreateSession = async (event) => {
    event.preventDefault();
    setSavingSession(true);
    try {
      const { data } = await createAdminSession({
        ...sessionForm,
        annee: Number(sessionForm.annee),
        capacite: Number(sessionForm.capacite),
      });
      toast.success('Session creee');
      setSessionForm(emptySessionForm);
      await loadSessions();
      setSelectedSessionId(data._id || data.id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Creation de session impossible');
    } finally {
      setSavingSession(false);
    }
  };

  const handleCreateCours = async (event) => {
    event.preventDefault();

    if (!selectedSessionId) {
      toast.error('Choisissez une session avant de creer un cours');
      return;
    }

    setSavingCours(true);
    try {
      await createAdminCours({
        ...coursForm,
        sessionId: selectedSessionId,
      });
      toast.success('Cours ajoute au planning');
      setCoursForm(emptyCoursForm);
      await loadPlanning(selectedSessionId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Creation du cours impossible');
    } finally {
      setSavingCours(false);
    }
  };

  const loadSessionUsers = async (sessionId) => {
    if (!sessionId) return setSessionUsers([]);
    setLoadingUsers(true);
    try {
      const { data } = await getUsers({ sessionId, role: 'etudiant' });
      setSessionUsers(data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Impossible de charger les étudiants');
    } finally {
      setLoadingUsers(false);
    }
  };

  const openSessionUsers = async (sessionId) => {
    setSelectedSessionId(sessionId);
    setShowSessionUsers(true);
    await loadSessionUsers(sessionId);
  };

  const handleBlockToggle = async (user) => {
    const confirmMsg = user.isActive ? `Arrêter l'accès de ${user.prenom} ${user.nom} ?` : `Continuer l'accès pour ${user.prenom} ${user.nom} ?`;
    const ok = window.confirm(confirmMsg);
    if (!ok) return;
    try {
      if (user.isActive) {
        await blockUser(user.id);
        toast.success('Utilisateur bloqué');
      } else {
        await unblockUser(user.id);
        toast.success('Utilisateur débloqué');
      }
      await loadSessionUsers(selectedSessionId);
      await loadSessions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action impossible');
    }
  };

  const handleDeleteUser = async (user) => {
    const ok = window.confirm(`Supprimer définitivement ${user.prenom} ${user.nom} ? Cette action est irréversible.`);
    if (!ok) return;
    try {
      await deleteUser(user.id);
      toast.success('Utilisateur supprimé');
      await loadSessionUsers(selectedSessionId);
      await loadSessions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Suppression impossible');
    }
  };

  const updateTableCell = (slotKey, day, field, value) => {
    const key = `${slotKey}_${day}`;
    setTableData((cur) => {
      const cell = { ...(cur[key] || {}), [field]: value };

      if (field === 'formateur' && value) {
        const selected = formateurs.find((f) => String(f._id || f.id) === String(value));
        const firstCourse = selected?.cours?.[0];
        if (selected && firstCourse && !cell.module) {
          cell.module = firstCourse;
        }
      }

      return { ...cur, [key]: cell };
    });
  };

  const getWeekStartForSession = (session) => {
    const base = session?.dateDebut ? new Date(session.dateDebut) : new Date();
    base.setHours(0, 0, 0, 0);
    // make Monday of that week
    base.setDate(base.getDate() - base.getDay() + 1);
    return base;
  };

  const handleLoadDefaultSchedule = () => {
    if (!selectedSession) return toast.error('Veuillez sélectionner une session');
    const formationName = selectedSession.formation;
    
    // Normalize formation name to match DEFAULT_SCHEDULES keys
    const matchKey = Object.keys(DEFAULT_SCHEDULES).find(
      (k) => k.toLowerCase() === formationName.toLowerCase()
    );
    
    const schedule = matchKey ? DEFAULT_SCHEDULES[matchKey] : null;
    
    if (!schedule) {
       return toast.error(`Aucun modèle de planning par défaut n'existe pour la formation "${formationName}".`);
    }

    const newTableData = {};

    for (const slotKey of Object.keys(schedule)) {
      for (const day of Object.keys(schedule[slotKey])) {
        const item = schedule[slotKey][day];
        const key = `${slotKey}_${day}`;
        
        // Find formateur by hint (last name usually)
        let formateurId = '';
        if (item.formateurHint) {
            const hintLower = item.formateurHint.toLowerCase();
            const found = formateurs.find(f => 
              f.nom.toLowerCase().includes(hintLower) || 
              f.prenom.toLowerCase().includes(hintLower)
            );
            if (found) formateurId = found._id || found.id;
        }

        newTableData[key] = {
          module: item.titre,
          formateur: formateurId,
          lien: '',
        };
      }
    }
    setTableData(newTableData);
    toast.success('Planning par défaut chargé ! Pensez à l\'enregistrer.');
  };

  const handleSaveTable = async () => {
    if (!selectedSessionId) {
      toast.error('Choisissez une session avant d enregistrer le tableau');
      return;
    }

    const session = sessions.find((s) => s.id === selectedSessionId);
    if (!session) return toast.error('Session introuvable');

    setSavingCours(true);
    try {
      const weekStart = getWeekStartForSession(session);
      const created = [];

      for (const slot of timeSlots) {
        for (let i = 0; i < weekdays.length; i += 1) {
          const day = weekdays[i];
          const cell = tableData[`${slot.key}_${day}`];
          if (!cell || (!cell.titre && !cell.formateur)) continue;

          const date = new Date(weekStart);
          date.setDate(weekStart.getDate() + i);
          const [hDeb, mDeb] = slot.start.split(':').map(Number);
          const [hFin, mFin] = slot.end.split(':').map(Number);
          const dateDebut = new Date(date);
          dateDebut.setHours(hDeb, mDeb, 0, 0);
          const dateFin = new Date(date);
          dateFin.setHours(hFin, mFin, 0, 0);

          const payload = {
            titre: cell.titre || cell.module || 'Module',
            matiere: cell.titre || cell.module || 'Module',
            dateDebut: dateDebut.toISOString(),
            dateFin: dateFin.toISOString(),
            lienVisio: cell.lien || '',
            salle: cell.salle || '',
            modalite: cell.modalite || 'distanciel',
            formateur: cell.formateur || undefined,
            sessionId: selectedSessionId,
            visibleEtudiant: false,
          };

          created.push(createAdminCours(payload));
        }
      }

      await Promise.all(created);
      toast.success('Tableau enregistre et cours ajoutes au planning');
      setTableData({});
      await loadPlanning(selectedSessionId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Enregistrement du tableau impossible');
    } finally {
      setSavingCours(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedSessionId) return;
    // Open modal to choose target sessions
    // preselect sessions with same formation as the selected session
    const sel = sessions.find((s) => s.id === selectedSessionId);
    const initial = sessions
      .filter((s) => s.formation === sel?.formation)
      .map((s) => s.id);
    setPublishTargets(initial.includes(selectedSessionId) ? [selectedSessionId] : [selectedSessionId]);
    setShowPublishModal(true);
  };

  const submitPublishTargets = async () => {
    if (!selectedSessionId || publishTargets.length === 0) return toast.error('Choisissez au moins une session cible');
    setPublishing(true);
    try {
      await publierPlanningTo(selectedSessionId, publishTargets);
      toast.success('Planning publie vers les sessions sélectionnées');
      setShowPublishModal(false);
      await Promise.all([loadSessions(), loadPlanning(selectedSessionId)]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Publication impossible');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Administration</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-950">Planning par formation et session</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
              Creez une session, rattachez les cours a cette session, puis publiez le planning pour les etudiants
              inscrits dans la meme formation.
            </p>
          </div>
          <button
            type="button"
            onClick={handlePublish}
            disabled={!selectedSessionId || publishing}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {publishing ? 'Publication...' : 'Publier vers etudiants'}
          </button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <button
            type="button"
            onClick={() => setFilterView('sessions')}
            className={`rounded-lg border p-4 text-left transition ${filterView === 'sessions' ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-gray-200 bg-white hover:border-indigo-200'}`}>
            <p className="text-sm text-gray-500">Sessions</p>
            <p className="mt-1 text-2xl font-bold text-gray-950">{stats.sessions}</p>
            <p className="mt-2 text-xs text-gray-500">Afficher toutes les sessions ouvertes</p>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!selectedSessionId && sessions.length > 0) setSelectedSessionId(sessions[0].id || sessions[0]._id);
              setFilterView('cours');
            }}
            className={`rounded-lg border p-4 text-left transition ${filterView === 'cours' ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-gray-200 bg-white hover:border-indigo-200'}`}>
            <p className="text-sm text-gray-500">Cours</p>
            <p className="mt-1 text-2xl font-bold text-gray-950">{stats.cours}</p>
            <p className="mt-2 text-xs text-gray-500">Tous les cours de la session sélectionnée</p>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!selectedSessionId && sessions.length > 0) setSelectedSessionId(sessions[0].id || sessions[0]._id);
              setFilterView('published');
            }}
            className={`rounded-lg border p-4 text-left transition ${filterView === 'published' ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-gray-200 bg-white hover:border-indigo-200'}`}>
            <p className="text-sm text-gray-500">Publies</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{stats.publishedCourses}</p>
            <p className="mt-2 text-xs text-gray-500">Afficher uniquement les cours publiés</p>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!selectedSessionId && sessions.length > 0) setSelectedSessionId(sessions[0].id || sessions[0]._id);
              setFilterView('toPublish');
            }}
            className={`rounded-lg border p-4 text-left transition ${filterView === 'toPublish' ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-gray-200 bg-white hover:border-indigo-200'}`}>
            <p className="text-sm text-gray-500">A publier</p>
            <p className="mt-1 text-2xl font-bold text-amber-700">{stats.unpublishedCourses}</p>
            <p className="mt-2 text-xs text-gray-500">Cours à publier pour les étudiants</p>
          </button>
        </div>

        {/* Weekly table editor */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
              <div>
                  <h2 className="text-lg font-bold text-gray-950">Editeur de planning (Hebdomadaire)</h2>
                  <p className="mt-1 text-sm text-gray-600">
                      Chargez un modèle ou remplissez les cellules manuellement. Cliquez sur Enregistrer pour ajouter les cours.
                  </p>
              </div>
              <button 
                  onClick={handleLoadDefaultSchedule}
                  disabled={!selectedSessionId}
                  className="rounded-md border border-indigo-600 text-indigo-600 px-4 py-2 text-sm font-semibold hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  ✨ Charger le planning type
              </button>
          </div>

          <div className="mt-4 overflow-auto">
            <table className="w-full table-auto border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border px-2 py-2">Heure</th>
                  {weekdays.map((d) => (
                    <th key={d} className="border px-2 py-2">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((slot) => (
                  <tr key={slot.key} className="align-top">
                    <td className="border px-2 py-2 font-semibold">{slot.key}</td>
                    {weekdays.map((day) => {
                      const key = `${slot.key}_${day}`;
                      const cell = tableData[key] || {};
                      return (
                        <td key={key} className="border px-2 py-2 align-top">
                          <input
                            placeholder="Module / Cours"
                            className="w-full rounded-md border px-2 py-1 mb-1"
                            value={cell.module || ''}
                            onChange={(e) => updateTableCell(slot.key, day, 'module', e.target.value)}
                          />
                          <select
                            className="w-full rounded-md border px-2 py-1 mb-1"
                            value={cell.formateur || ''}
                            onChange={(e) => updateTableCell(slot.key, day, 'formateur', e.target.value)}
                          >
                            <option value="">Formateur</option>
                            {formateurs.map((f) => {
                              const courseNames = (f.cours || []).join(', ');
                              return (
                                <option key={f._id || f.id} value={f._id || f.id}>
                                  {f.prenom} {f.nom}{courseNames ? ` — ${courseNames}` : ''}
                                </option>
                              );
                            })}
                          </select>
                          {cell.formateur && (
                            <div className="mb-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600">
                              {(() => {
                                const selected = formateurs.find((f) => String(f._id || f.id) === String(cell.formateur));
                                if (!selected) return null;
                                const courseNames = (selected.cours || []).join(', ');
                                return courseNames ? `Cours associés : ${courseNames}` : 'Aucun cours associé à ce formateur';
                              })()}
                            </div>
                          )}
                          <input
                            placeholder="Lien cours"
                            className="w-full rounded-md border px-2 py-1 mb-1"
                            value={cell.lien || ''}
                            onChange={(e) => updateTableCell(slot.key, day, 'lien', e.target.value)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={handleSaveTable}
              disabled={!selectedSessionId || savingCours}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {savingCours ? 'Enregistrement...' : 'Enregistrer le tableau'}
            </button>
            <button
              type="button"
              onClick={() => setTableData({})}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
            >
              Effacer
            </button>
          </div>
        </div>

        {/* Publish modal */}
        {showPublishModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-[720px] rounded bg-white p-6 shadow-lg">
              <h3 className="text-lg font-bold">Publier le planning vers des sessions</h3>
              <p className="mt-2 text-sm text-gray-600">Choisissez une ou plusieurs sessions cibles pour appliquer ce planning.</p>

              <div className="mt-4 max-h-60 overflow-auto border rounded p-2">
                {sessions.map((s) => (
                  <label key={s.id} className="flex items-center gap-3 p-2 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={publishTargets.includes(s.id)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setPublishTargets((cur) => (checked ? [...cur, s.id] : cur.filter((id) => id !== s.id)));
                      }}
                    />
                    <div className="text-sm">
                      <div className="font-semibold">{s.nom}</div>
                      <div className="text-xs text-gray-500">{s.formation} — {new Date(s.dateDebut).toLocaleDateString()}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button className="rounded bg-gray-100 px-3 py-2" type="button" onClick={() => setShowPublishModal(false)}>Annuler</button>
                <button className="rounded bg-indigo-600 px-3 py-2 text-white" type="button" onClick={submitPublishTargets} disabled={publishing}>{publishing ? 'Publication...' : 'Publier'}</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <form onSubmit={handleCreateSession} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-950">Nouvelle session</h2>
            <div className="mt-4 space-y-3">
              <input
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Ex: DEV I-2026"
                value={sessionForm.nom}
                onChange={(event) => updateSessionForm('nom', event.target.value)}
              />
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={sessionForm.formation}
                onChange={(event) => updateSessionForm('formation', event.target.value)}
              >
                {formations.map((formation) => (
                  <option key={formation}>{formation}</option>
                ))}
              </select>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  required
                  type="number"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  value={sessionForm.annee}
                  onChange={(event) => updateSessionForm('annee', event.target.value)}
                />
                <input
                  required
                  type="number"
                  min="1"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  value={sessionForm.capacite}
                  onChange={(event) => updateSessionForm('capacite', event.target.value)}
                />
              </div>
              <input
                type="date"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={sessionForm.dateDebut}
                onChange={(event) => updateSessionForm('dateDebut', event.target.value)}
              />
              <input
                type="date"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={sessionForm.dateFin}
                onChange={(event) => updateSessionForm('dateFin', event.target.value)}
              />
              <button
                type="submit"
                disabled={savingSession}
                className="w-full rounded-md bg-gray-950 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {savingSession ? 'Creation...' : 'Creer la session'}
              </button>
            </div>
          </form>

          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-950">Session de travail</h2>
            <select
              className="mt-4 w-full rounded-md border border-gray-300 px-3 py-2"
              value={selectedSessionId}
              onChange={(event) => setSelectedSessionId(event.target.value)}
              disabled={loading || sessions.length === 0}
            >
              <option value="">Choisir une session</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.nom}
                </option>
              ))}
            </select>
            {selectedSession && (
              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <p>
                  <span className="font-semibold">Formation :</span> {selectedSession.formation}
                </p>
                <p>
                  <span className="font-semibold">Effectif :</span> {selectedSession.inscrits}/
                  {selectedSession.capacite}
                </p>
                <p>
                  <span className="font-semibold">Publication :</span>{' '}
                  {selectedSession.planningPublie ? 'Publie' : 'Non publie'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <form onSubmit={handleCreateCours} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-950">Ajouter un cours au planning</h2>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <input
                required
                className="rounded-md border border-gray-300 px-3 py-2"
                placeholder="Titre du cours"
                value={coursForm.titre}
                onChange={(event) => updateCoursForm('titre', event.target.value)}
              />
              <input
                className="rounded-md border border-gray-300 px-3 py-2"
                placeholder="Matiere"
                value={coursForm.matiere}
                onChange={(event) => updateCoursForm('matiere', event.target.value)}
              />
              <input
                required
                type="datetime-local"
                className="rounded-md border border-gray-300 px-3 py-2"
                value={coursForm.dateDebut}
                onChange={(event) => updateCoursForm('dateDebut', event.target.value)}
              />
              <input
                required
                type="datetime-local"
                className="rounded-md border border-gray-300 px-3 py-2"
                value={coursForm.dateFin}
                onChange={(event) => updateCoursForm('dateFin', event.target.value)}
              />
              <select
                required
                className="rounded-md border border-gray-300 px-3 py-2"
                value={coursForm.formateur}
                onChange={(event) => updateCoursForm('formateur', event.target.value)}
              >
                <option value="">Choisir un formateur</option>
                {formateurs.map((formateur) => {
                  const courseNames = (formateur.cours || []).join(', ');
                  return (
                    <option key={formateur._id || formateur.id} value={formateur._id || formateur.id}>
                      {formateur.prenom} {formateur.nom}
                      {courseNames ? ` — ${courseNames}` : ' — Aucun cours assigné'}
                    </option>
                  );
                })}
              </select>
              <select
                className="rounded-md border border-gray-300 px-3 py-2"
                value={coursForm.modalite}
                onChange={(event) => updateCoursForm('modalite', event.target.value)}
              >
                <option value="distanciel">Distanciel</option>
                <option value="presentiel">Presentiel</option>
                <option value="hybride">Hybride</option>
              </select>
              <input
                className="rounded-md border border-gray-300 px-3 py-2"
                placeholder="Salle"
                value={coursForm.salle}
                onChange={(event) => updateCoursForm('salle', event.target.value)}
              />
              <input
                className="rounded-md border border-gray-300 px-3 py-2"
                placeholder="Lien visio"
                value={coursForm.lienVisio}
                onChange={(event) => updateCoursForm('lienVisio', event.target.value)}
              />
              <input
                className="rounded-md border border-gray-300 px-3 py-2"
                placeholder="Lien replay"
                value={coursForm.replayUrl}
                onChange={(event) => updateCoursForm('replayUrl', event.target.value)}
              />
              <textarea
                className="rounded-md border border-gray-300 px-3 py-2 lg:col-span-2"
                placeholder="Description"
                rows="3"
                value={coursForm.description}
                onChange={(event) => updateCoursForm('description', event.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={!selectedSessionId || savingCours}
              className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {savingCours ? 'Ajout...' : 'Ajouter au planning'}
            </button>
          </form>

          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            {filterView === 'sessions' ? (
              <>
                <div className="border-b border-gray-200 p-5">
                  <h2 className="text-lg font-bold text-gray-950">Sessions ouvertes</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {sessions.length === 0 && (
                    <p className="p-5 text-sm text-gray-500">Aucune session trouvée.</p>
                  )}
                  {sessions.map((s) => (
                    <article key={s.id || s._id} className="grid gap-4 p-5 lg:grid-cols-[1fr_auto]">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-950">{s.nom}</h3>
                    {showSessionUsers && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="w-[720px] rounded bg-white p-6 shadow-lg max-h-[80vh] overflow-auto">
                          <h3 className="text-lg font-bold">Étudiants inscrits</h3>
                          <p className="mt-2 text-sm text-gray-600">Gestion des étudiants de la session sélectionnée.</p>
                          <div className="mt-4">
                            {loadingUsers && <p>Chargement...</p>}
                            {!loadingUsers && sessionUsers.length === 0 && <p className="text-sm text-gray-500">Aucun étudiant inscrit.</p>}
                            {!loadingUsers && sessionUsers.map((u) => (
                              <div key={u.id} className="flex items-center justify-between border p-3 rounded mb-2">
                                <div>
                                  <div className="font-semibold">{u.prenom} {u.nom}</div>
                                  <div className="text-sm text-gray-500">{u.email} • {u.formation || ''}</div>
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={() => handleBlockToggle(u)} className={`rounded px-3 py-1 ${u.isActive ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'}`}>{u.isActive ? 'Arrêter l accès' : 'Continuer l accès'}</button>
                                  <button onClick={() => handleDeleteUser(u)} className="rounded bg-red-600 px-3 py-1 text-white">Supprimer</button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 flex justify-end">
                            <button className="rounded bg-gray-100 px-3 py-2" onClick={() => setShowSessionUsers(false)}>Fermer</button>
                          </div>
                        </div>
                      </div>
                    )}
                          <span className="text-sm text-gray-500">— {s.formation}</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">{new Date(s.dateDebut).toLocaleDateString()} — {s.annee}</p>
                        <p className="mt-1 text-sm text-gray-600">
                          Effectif : {s.inscrits}/{s.capacite} • {s.planningPublie ? 'Planning publié' : 'Planning non publié'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openSessionUsers(s.id || s._id)}
                          className="rounded-md border border-gray-300 px-3 py-1 text-sm"
                        >
                          Ouvrir
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="border-b border-gray-200 p-5">
                  <h2 className="text-lg font-bold text-gray-950">
                    {filterView === 'published' ? 'Cours publiés' : filterView === 'toPublish' ? "Cours à publier" : 'Cours de la session'}
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {displayedCourses.length === 0 && (
                    <p className="p-5 text-sm text-gray-500">Aucun cours trouvé pour ces critères.</p>
                  )}
                  {displayedCourses.map((item) => (
                    <article key={item._id || item.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_auto]">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-gray-950">{item.titre}</h3>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                              item.visibleEtudiant ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {item.visibleEtudiant ? 'Visible etudiant' : 'Non publie'}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">{formatDate(item.dateDebut)} - {formatDate(item.dateFin)}</p>
                        <p className="mt-1 text-sm text-gray-600">
                          {item.formateur?.prenom} {item.formateur?.nom} | {item.modalite}
                          {item.salle ? ` | ${item.salle}` : ''}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                          {item.lienVisio && (
                            <a href={item.lienVisio} target="_blank" rel="noreferrer" className="rounded-full bg-indigo-50 px-2 py-1 text-indigo-700 hover:bg-indigo-100">Rejoindre le cours</a>
                          )}
                          {item.replayUrl && (
                            <a href={item.replayUrl} target="_blank" rel="noreferrer" className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700 hover:bg-emerald-100">Voir le replay</a>
                          )}
                        </div>
                        {item.description && <p className="mt-2 text-sm text-gray-500">{item.description}</p>}
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
