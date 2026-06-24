import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import {
  createAdminFormateur,
  getAdminFormateurs,
  getAdminSessions,
  toggleAdminFormateurConge,
  resetAdminFormateurPassword,
  deleteAdminFormateur
} from '../../services/adminService';

export default function AdminFormateurs() {
  const [sessions, setSessions] = useState([]);
  const [formateurs, setFormateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [tempPasswords, setTempPasswords] = useState({});
  const [customPasswordInput, setCustomPasswordInput] = useState({});
  
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: 'CfaDemo2026!',
    matieres: '',
    sessionIds: []
  });
  const [selectedFormation, setSelectedFormation] = useState('');
  const [selectedFormateurId, setSelectedFormateurId] = useState('');

  const sessionsById = useMemo(
    () => Object.fromEntries(sessions.map((session) => [session.id, session])),
    [sessions]
  );

  const formations = useMemo(() => {
    const setForm = new Set(sessions.map((s) => s.formation).filter(Boolean));
    return Array.from(setForm).sort();
  }, [sessions]);

  const formateursByFormation = useMemo(() => {
    if (!selectedFormation) return [];
    const sessionIdsForFormation = sessions.filter(s => s.formation === selectedFormation).map(s => s.id || s._id);
    return formateurs.filter(f => (f.sessionIds || []).some(id => sessionIdsForFormation.includes(id)));
  }, [selectedFormation, sessions, formateurs]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sessionsResponse, formateursResponse] = await Promise.all([
        getAdminSessions(),
        getAdminFormateurs()
      ]);
      setSessions(sessionsResponse.data);
      setFormateurs(formateursResponse.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Chargement impossible');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(loadData);
  }, []);

  const { user } = useAuth();

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const toggleSession = (sessionId) => {
    setFormData((current) => {
      const selected = current.sessionIds.includes(sessionId)
        ? current.sessionIds.filter((id) => id !== sessionId)
        : [...current.sessionIds, sessionId];
      return { ...current, sessionIds: selected };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.nom || !formData.prenom || !formData.email || !formData.motDePasse) {
      return toast.error('Veuillez remplir tous les champs obligatoires.');
    }
    if (!formData.matieres) {
      return toast.error('Veuillez renseigner les cours enseignés (matières).');
    }
    if (sessions.length > 0 && formData.sessionIds.length === 0) {
      return toast.error('Choisissez au moins une session de formation.');
    }

    setSaving(true);
    try {
      await createAdminFormateur({
        ...formData,
        matieres: formData.matieres
      });
      toast.success('Formateur ajouté avec succès');
      setFormData({ nom: '', prenom: '', email: '', motDePasse: 'CfaDemo2026!', matieres: '', sessionIds: [] });
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Impossible de créer le formateur');
    } finally {
      setSaving(false);
    }
  };

  const setActionBusy = (id, busy) => setActionLoading((s) => ({ ...s, [id]: busy }));

  const handleToggleConge = async (id, current) => {
    try {
      setActionBusy(id, true);
      await toggleAdminFormateurConge(id, !current);
      toast.success(`Statut congé mis à jour`);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible de mettre à jour');
    } finally {
      setActionBusy(id, false);
    }
  };

  const handleResetPassword = async (id, isCustom = false) => {
    try {
      setActionBusy(id, true);
      const customPwd = isCustom ? customPasswordInput[id] : undefined;
      
      if (isCustom && !customPwd) {
        toast.error('Veuillez entrer un mot de passe');
        return;
      }

      const res = await resetAdminFormateurPassword(id, customPwd);
      
      if (res.data?.isCustom) {
         toast.success('Nouveau mot de passe défini avec succès');
         setCustomPasswordInput((prev) => ({ ...prev, [id]: '' }));
      } else {
        const temp = res.data?.tempPassword || res.data?.temp || '';
        if (!temp) {
          toast.error('Aucun mot de passe renvoyé');
          return;
        }
        setTempPasswords((t) => ({ ...t, [id]: { pwd: temp, visible: true } }));
        toast.success('Mot de passe temporaire généré');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible de réinitialiser le mot de passe');
    } finally {
      setActionBusy(id, false);
    }
  };

  const handleHideTemp = (id) => {
    setTempPasswords((t) => ({ ...t, [id]: { ...(t[id] || {}), visible: false } }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Confirmer la suppression du formateur ? (action réversible par restauration serveur)')) return;
    try {
      setActionBusy(id, true);
      await deleteAdminFormateur(id);
      toast.success('Formateur supprimé');
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible de supprimer');
    } finally {
      setActionBusy(id, false);
    }
  };

  const isFormValid =
    formData.nom &&
    formData.prenom &&
    formData.email &&
    formData.motDePasse &&
    formData.matieres &&
    (sessions.length === 0 || formData.sessionIds.length > 0);

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Gestion des formateurs</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-950">Créer un formateur et l'affecter à une session</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
              Ajoutez un formateur, décrivez les matières enseignées et sélectionnez la ou les sessions de formation qu'il animera.
            </p>
          </div>
          {user?.role === 'superadmin' && (
            <div className="mt-3 lg:mt-0">
              <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800 border border-blue-100">
                Vous êtes connecté en tant que <strong>Superadmin</strong>. Utilisez ce formulaire pour créer des formateurs et les affecter directement à une ou plusieurs sessions — si vous fournissez les matières et la session, le formateur pourra accéder immédiatement à son tableau de bord sans compléter l'onboarding.
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Nom</span>
              <input
                type="text"
                value={formData.nom}
                onChange={(event) => updateField('nom', event.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Nom du formateur"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Prénom</span>
              <input
                type="text"
                value={formData.prenom}
                onChange={(event) => updateField('prenom', event.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Prénom du formateur"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Email</span>
              <input
                type="email"
                value={formData.email}
                onChange={(event) => updateField('email', event.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="formateur@cfa-demo.fr"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Mot de passe</span>
              <div className="mt-1 relative">
                <input
                  type={formData.showPassword ? 'text' : 'password'}
                  value={formData.motDePasse}
                  onChange={(event) => updateField('motDePasse', event.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10"
                  placeholder="Mot de passe de connexion"
                  required
                />
                <button
                  type="button"
                  onClick={() => updateField('showPassword', !formData.showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-600"
                >
                  {formData.showPassword ? 'Masquer' : 'Voir'}
                </button>
              </div>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Cours enseignés</span>
              <input
                type="text"
                value={formData.matieres}
                onChange={(event) => updateField('matieres', event.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Ex: Javascript, React, SysAdmin"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Séparez les matières par des virgules.</p>
            </label>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-950">Sessions de formation</h2>
              <p className="mt-2 text-sm text-gray-600">Choisissez les sessions où ce formateur interviendra.</p>
              <div className="mt-4 space-y-2 max-h-72 overflow-auto">
                {loading && <p className="text-sm text-gray-500">Chargement des sessions...</p>}
                {!loading && sessions.length === 0 && (
                  <p className="text-sm text-gray-500">Aucune session disponible pour le moment.</p>
                )}
                {!loading && sessions.map((session) => (
                  <label key={session.id} className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
                    <input
                      type="checkbox"
                      checked={formData.sessionIds.includes(session.id)}
                      onChange={() => toggleSession(session.id)}
                    />
                    <div className="text-sm">
                      <div className="font-semibold text-gray-900">{session.nom}</div>
                      <div className="text-gray-600">{session.formation} — {new Date(session.dateDebut).toLocaleDateString()}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving || !isFormValid}
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {saving ? 'Création en cours...' : 'Créer le formateur'}
            </button>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-950">Planifier / Filtrer par formation</h2>
        <p className="mt-2 text-sm text-gray-600">Choisissez une formation pour lister les formateurs appartenant à cette formation et afficher leurs cours.</p>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Formation</span>
            <select
              value={selectedFormation}
              onChange={(e) => { setSelectedFormation(e.target.value); setSelectedFormateurId(''); }}
              className="mt-1 block w-full rounded border-gray-300 py-2 px-3 text-sm"
            >
              <option value="">-- Choisir une formation --</option>
              {formations.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Formateur</span>
            <select
              value={selectedFormateurId}
              onChange={(e) => setSelectedFormateurId(e.target.value)}
              className="mt-1 block w-full rounded border-gray-300 py-2 px-3 text-sm"
            >
              <option value="">-- Sélectionner un formateur --</option>
              {formateursByFormation.map((f) => {
                const fid = f._id || f.id;
                return (<option key={fid} value={fid}>{f.prenom} {f.nom}</option>);
              })}
            </select>
          </label>

          <div className="block">
            <span className="text-sm font-medium text-gray-700">Détails</span>
            <div className="mt-1 w-full rounded border border-gray-200 p-3 bg-gray-50 text-sm text-gray-700">
              {!selectedFormateurId && <div>Sélectionnez une formation puis un formateur pour voir ses cours.</div>}
              {selectedFormateurId && (() => {
                const sel = formateurs.find(x => (x._id === selectedFormateurId) || (x.id === selectedFormateurId));
                if (!sel) return <div>Formateur introuvable.</div>;
                return (
                  <div className="space-y-2">
                    <div><strong>Nom :</strong> {sel.prenom} {sel.nom}</div>
                    <div><strong>Matières :</strong> {sel.matieres?.join ? sel.matieres.join(', ') : sel.matieres || '-'}</div>
                    <div><strong>Sessions associées :</strong>
                      <ul className="mt-1 list-disc list-inside text-sm text-gray-700">
                        {(sel.sessionIds || []).map(sid => <li key={sid}>{sessionsById[sid]?.nom || sid}</li>)}
                      </ul>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-950">Formateurs existants</h2>
        <p className="mt-2 text-sm text-gray-600">Liste des formateurs déjà créés dans ce CFA.</p>

        <div className="mt-4 overflow-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Nom</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Matières</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Session</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Statut</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 min-w-[280px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {formateurs.map((item) => {
                const uid = item._id || item.id;
                return (
                  <tr key={uid}>
                    <td className="px-4 py-3 align-top">{item.prenom} {item.nom}</td>
                    <td className="px-4 py-3 align-top">{item.email}</td>
                    <td className="px-4 py-3 align-top">{item.matieres?.join(', ') || '-'}</td>
                    <td className="px-4 py-3 align-top">{sessionsById[item.cohorte]?.nom || '-'}</td>
                    <td className="px-4 py-3 align-top">{item.isOnLeave ? 'En congé' : item.isActive ? 'Actif' : 'Inactif'}</td>
                    <td className="px-4 py-3 align-top">
                      {user?.role === 'superadmin' ? (
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleToggleConge(uid, !!item.isOnLeave)}
                              disabled={actionLoading[uid]}
                              className="rounded bg-yellow-500 px-2 py-1 text-xs text-white hover:bg-yellow-600 disabled:opacity-60"
                            >
                              {item.isOnLeave ? 'Réintégrer' : 'Mettre en congé'}
                            </button>

                            <button
                              onClick={() => handleDelete(uid)}
                              disabled={actionLoading[uid]}
                              className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-60"
                            >
                              Supprimer
                            </button>
                            
                            <button
                              onClick={() => handleResetPassword(uid, false)}
                              disabled={actionLoading[uid]}
                              className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-60"
                              title="Générer un mot de passe aléatoire"
                            >
                              Générer Auto
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-2 border-t pt-2 border-gray-100">
                             <input 
                                type="text"
                                placeholder="Nouveau mot de passe"
                                className="border rounded px-2 py-1 text-xs w-32"
                                value={customPasswordInput[uid] || ''}
                                onChange={(e) => setCustomPasswordInput(prev => ({...prev, [uid]: e.target.value}))}
                             />
                             <button
                              onClick={() => handleResetPassword(uid, true)}
                              disabled={actionLoading[uid] || !customPasswordInput[uid]}
                              className="rounded bg-indigo-600 px-2 py-1 text-xs text-white hover:bg-indigo-700 disabled:opacity-60"
                             >
                               Définir
                             </button>
                          </div>

                          {tempPasswords[uid] && tempPasswords[uid].visible && (
                            <div className="mt-1 rounded border bg-gray-50 p-2 text-sm">
                              <div className="flex items-center gap-2">
                                <strong>Temp:</strong>
                                <input readOnly value={tempPasswords[uid].pwd} className="w-32 rounded border px-2 py-1 text-xs" />
                                <button onClick={() => handleHideTemp(uid)} className="text-xs text-gray-600 hover:text-gray-900">Masquer</button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Actions réservées au superadmin</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
