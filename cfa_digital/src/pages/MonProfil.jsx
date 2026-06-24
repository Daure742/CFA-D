import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { sendVerificationCode, changePasswordWithCode, updateNotificationPreferences } from '../services/authService';

export default function MonProfil() {
  const { user } = useAuth();

  const [showChangePwd, setShowChangePwd] = useState(false);
  const [phoneInput, setPhoneInput] = useState(user.telephone || '');
  const [emailInput, setEmailInput] = useState(user.email || '');
  const [codeInput, setCodeInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [notifPrefs, setNotifPrefs] = useState(user.notificationPreferences || { email: true, sms: false, inApp: true });

  const handleSendCode = async () => {
    try {
      await sendVerificationCode({ email: emailInput, telephone: phoneInput });
      toast.success('Code envoyé si le contact existe');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible d envoyer le code');
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!codeInput || !newPassword) return toast.error('Code et nouveau mot de passe requis');
      await changePasswordWithCode({ telephone: phoneInput, code: codeInput, nouveauMotDePasse: newPassword });
      toast.success('Mot de passe mis à jour');
      setShowChangePwd(false);
      setCodeInput('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible de changer le mot de passe');
    }
  };

  const saveNotifPrefs = async () => {
    try {
      const { data } = await updateNotificationPreferences(notifPrefs);
      setNotifPrefs(data.notificationPreferences || notifPrefs);
      toast.success('Préférences enregistrées');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible de sauvegarder les préférences');
    }
  };

  if (!user) {
    return <div className="p-6 text-center text-gray-500">Chargement du profil...</div>;
  }

  // Format the role to display
  const getRoleDisplay = (role) => {
    switch (role) {
      case 'etudiant': return 'Étudiant(e)';
      case 'formateur': return 'Formateur / Enseignant';
      case 'admin': return 'Administrateur (CFA)';
      case 'superadmin': return 'Super Administrateur';
      case 'tuteur': return 'Tuteur / Maître d\'apprentissage';
      case 'entreprise': return 'Entreprise Partenaire';
      default: return role;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 mt-4">
      {/* En-tête du Profil */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm relative overflow-hidden">
        {/* Décoration d'arrière-plan */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-40 w-40 rounded-full bg-gradient-to-tr from-blue-50 to-blue-100 opacity-50 blur-2xl"></div>

        <div className="relative flex flex-col md:flex-row items-center gap-8">
          {/* Avatar */}
          <div className="relative">
            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold shadow-lg border-4 border-white">
              {user.prenom?.[0]?.toUpperCase()}{user.nom?.[0]?.toUpperCase()}
            </div>
            {/* Signe Actif */}
            <div className="absolute bottom-2 right-2 h-6 w-6 rounded-full border-4 border-white bg-emerald-500" title="Statut: Actif"></div>
          </div>

          {/* Informations principales */}
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {user.prenom} {user.nom}
            </h1>
            <div className="mt-2 flex flex-col md:flex-row items-center md:items-start gap-3">
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                {getRoleDisplay(user.role)}
              </span>
              <span className="inline-flex items-center text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full ring-1 ring-inset ring-emerald-600/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2"></span>
                Compte Actif
              </span>
            </div>
            <p className="mt-4 text-gray-600 font-medium">
              <a href={`mailto:${user.email}`} className="hover:text-indigo-600 hover:underline transition-colors flex items-center justify-center md:justify-start gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                {user.email}
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Détails spécifiques selon le rôle */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Carte : Informations professionnelles / académiques */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            Détails du compte
          </h2>
          <div className="space-y-4">
            {user.role === 'etudiant' && (
              <>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Formation Suivie</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">{user.formationChoisie || 'Non spécifiée'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Session / Cohorte</dt>
                  <dd className="mt-1 text-sm font-semibold text-indigo-600 bg-indigo-50 inline-block px-2 py-1 rounded">
                    {/* Usually cohorte is an ID in auth state, we show a generic message or its ID if name is not fetched */}
                    {user.cohorte ? 'Inscrit(e) à une session' : 'Session en attente d\'attribution'}
                  </dd>
                </div>
              </>
            )}

            {user.role === 'formateur' && (
              <>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Matières enseignées</dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {user.matieres && user.matieres.length > 0 ? (
                      user.matieres.map((matiere, index) => (
                        <span key={index} className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                          {matiere}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">Aucune matière renseignée</span>
                    )}
                  </dd>
                </div>
              </>
            )}

            {['admin', 'superadmin'].includes(user.role) && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Droits d'accès</dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900">Accès total au back-office</dd>
              </div>
            )}
            
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Identifiant CFA</dt>
              <dd className="mt-1 text-xs font-mono text-gray-400">{user.tenantId}</dd>
            </div>
          </div>
        </div>

        {/* Carte : Paramètres de sécurité / Actions */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            Sécurité & Actions
          </h2>
          <div className="space-y-3">
              <div>
                <button onClick={() => setShowChangePwd((s) => !s)} className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left group">
                  <div>
                    <span className="block text-sm font-semibold text-gray-900">Changer de mot de passe</span>
                    <span className="block text-xs text-gray-500">Modifier votre mot de passe de connexion</span>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>

                {showChangePwd && (
                  <div className="mt-4 space-y-3 border rounded p-4 bg-gray-50">
                    <p className="text-sm text-gray-700">Pour renforcer la sécurité, envoyez un code sur votre téléphone ou email pour valider le changement.</p>
                    <div className="grid gap-2 md:grid-cols-2">
                      <input value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} placeholder="Numéro de téléphone (ex: +336...)" className="border rounded px-3 py-2" />
                      <input value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="Email (optionnel)" className="border rounded px-3 py-2" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSendCode} className="rounded bg-indigo-600 px-3 py-2 text-white">Envoyer le code</button>
                      <button onClick={() => { setPhoneInput(''); setEmailInput(''); setCodeInput(''); setNewPassword(''); }} className="rounded border px-3 py-2">Réinitialiser</button>
                    </div>

                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      <input value={codeInput} onChange={(e) => setCodeInput(e.target.value)} placeholder="Code reçu" className="border rounded px-3 py-2" />
                      <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nouveau mot de passe" type="password" className="border rounded px-3 py-2" />
                    </div>
                    <div>
                      <button onClick={handleChangePassword} className="w-full rounded bg-emerald-600 px-3 py-2 text-white">Valider le changement</button>
                    </div>
                  </div>
                )}
              </div>
            
            <div className="w-full border rounded p-3 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-semibold text-gray-900">Préférences de notification</span>
                  <span className="block text-xs text-gray-500">Gérer les alertes e-mail, SMS et in-app</span>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Email</span>
                  <input type="checkbox" checked={!!notifPrefs.email} onChange={(e) => setNotifPrefs((p) => ({ ...p, email: e.target.checked }))} />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">SMS</span>
                  <input type="checkbox" checked={!!notifPrefs.sms} onChange={(e) => setNotifPrefs((p) => ({ ...p, sms: e.target.checked }))} />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">In-app</span>
                  <input type="checkbox" checked={!!notifPrefs.inApp} onChange={(e) => setNotifPrefs((p) => ({ ...p, inApp: e.target.checked }))} />
                </label>

                <div className="mt-3">
                  <button onClick={saveNotifPrefs} className="rounded bg-indigo-600 px-3 py-2 text-white">Enregistrer</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
