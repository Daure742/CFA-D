import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages publiques
import HomePage from './pages/public/HomePage';
import FormationsPage from './pages/public/FormationsPage';
import FormationDetailPage from './pages/public/FormationDetailPage';
import AdmissionsPage from './pages/public/AdmissionsPage';
import EtudiantsPage from './pages/public/EtudiantsPage';
import LoginPage from './pages/public/LoginPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import ResetPasswordPage from './pages/public/ResetPasswordPage';

// Pages ÉTUDIANT
import EtudiantDashboard from './pages/etudiant/EtudiantDashboard';
import EtudiantAgenda from './pages/etudiant/EtudiantAgenda';
import EtudiantCours from './pages/etudiant/EtudiantCours';
import EtudiantDevoirs from './pages/etudiant/EtudiantDevoirs';
import EtudiantDocuments from './pages/etudiant/EtudiantDocuments';
import EtudiantNotes from './pages/etudiant/EtudiantNotes';
import EtudiantMessages from './pages/etudiant/EtudiantMessages';

// Pages FORMATEUR
import FormateurDashboard from './pages/formateur/FormateurDashboard';
import FormateurClasses from './pages/formateur/FormateurClasses';
import FormateurDevoirs from './pages/formateur/FormateurDevoirs';
import FormateurNotes from './pages/formateur/FormateurNotes';
import FormateurMessages from './pages/formateur/FormateurMessages';

// Pages ADMIN
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEtudiants from './pages/admin/AdminEtudiants';
import AdminFormateurs from './pages/admin/AdminFormateurs';
import AdminCohortes from './pages/admin/AdminCohortes';
import AdminWaitlists from './pages/admin/AdminWaitlists';
import AdminPlanning from './pages/admin/AdminPlanning';
import AdminFinances from './pages/admin/AdminFinances';
import AdminCandidatures from './pages/admin/AdminCandidatures';
import AdminRapports from './pages/admin/AdminRapports';
import SuperadminDashboard from './pages/superadmin/SuperadminDashboard';
import SuperadminTenants from './pages/superadmin/SuperadminTenants';
import SuperadminAbonnements from './pages/superadmin/SuperadminAbonnements';
import SuperadminAudit from './pages/superadmin/SuperadminAudit';
import SuperadminSupport from './pages/superadmin/SuperadminSupport';
import TuteurDashboard from './pages/tuteur/TuteurDashboard';
import TuteurApprentis from './pages/tuteur/TuteurApprentis';
import TuteurPresences from './pages/tuteur/TuteurPresences';
import TuteurDocuments from './pages/tuteur/TuteurDocuments';
import TuteurMessages from './pages/tuteur/TuteurMessages';
import EntrepriseDashboard from './pages/entreprise/EntrepriseDashboard';
import EntrepriseContrats from './pages/entreprise/EntrepriseContrats';
import EntrepriseTuteurs from './pages/entreprise/EntrepriseTuteurs';
import EntrepriseFactures from './pages/entreprise/EntrepriseFactures';
import EntrepriseFinancements from './pages/entreprise/EntrepriseFinancements';
import EntrepriseMessages from './pages/entreprise/EntrepriseMessages';
import AnnuairePage from './pages/AnnuairePage';
import ContactPage from './pages/public/ContactPage';
import MonProfil from './pages/MonProfil';

export default function App() {
  useEffect(() => {
    // Debug logging pour s'assurer que l'App s'est bien montée
    console.log('✅ [App] Composant App rendu avec succès');
    console.log('🌍 [App] Environnement:', {
      apiUrl: import.meta.env.VITE_API_URL,
      mode: import.meta.env.MODE,
      dev: import.meta.env.DEV
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-6 w-full">
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<HomePage />} />
          <Route path="/formations" element={<FormationsPage />} />
          <Route path="/formations/:id" element={<FormationDetailPage />} />
          <Route path="/admissions" element={<AdmissionsPage />} />
          <Route path="/vie-etudiante" element={<EtudiantsPage />} />
          <Route path="/connexion" element={<LoginPage />} />
          <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
          <Route path="/reinitialiser-motdepasse/:token" element={<ResetPasswordPage />} />

          {/* Espace ÉTUDIANT */}
          <Route path="/etudiant" element={<ProtectedRoute role="etudiant" />}>
            <Route index element={<EtudiantDashboard />} />
            <Route path="agenda" element={<EtudiantAgenda />} />
            <Route path="cours" element={<EtudiantCours />} />
            <Route path="devoirs" element={<EtudiantDevoirs />} />
            <Route path="documents" element={<EtudiantDocuments />} />
            <Route path="notes" element={<EtudiantNotes />} />
            <Route path="messages" element={<EtudiantMessages />} />
            <Route path="profil" element={<MonProfil />} />
          </Route>

          {/* Espace FORMATEUR */}
          <Route path="/formateur" element={<ProtectedRoute role="formateur" />}>
            <Route index element={<FormateurDashboard />} />
            <Route path="classes" element={<FormateurClasses />} />
            <Route path="devoirs" element={<FormateurDevoirs />} />
            <Route path="notes" element={<FormateurNotes />} />
            <Route path="messages" element={<FormateurMessages />} />
          </Route>

          {/* Espace ADMIN */}
          <Route path="/admin" element={<ProtectedRoute role="admin" />}>
            <Route index element={<AdminDashboard />} />
            <Route path="etudiants" element={<AdminEtudiants />} />
            <Route path="formateurs" element={<AdminFormateurs />} />
            <Route path="cohortes" element={<AdminCohortes />} />
            <Route path="waitlists" element={<AdminWaitlists />} />
            <Route path="planning" element={<AdminPlanning />} />
            <Route path="finances" element={<AdminFinances />} />
            <Route path="candidatures" element={<AdminCandidatures />} />
            <Route path="rapports" element={<AdminRapports />} />
          </Route>

          {/* Espace SUPERADMIN */}
          <Route path="/superadmin" element={<ProtectedRoute role="superadmin" />}>
            <Route index element={<SuperadminDashboard />} />
            <Route path="tenants" element={<SuperadminTenants />} />
            <Route path="abonnements" element={<SuperadminAbonnements />} />
            <Route path="audit" element={<SuperadminAudit />} />
            <Route path="support" element={<SuperadminSupport />} />
          </Route>

          {/* Espace TUTEUR */}
          <Route path="/tuteur" element={<ProtectedRoute role="tuteur" />}>
            <Route index element={<TuteurDashboard />} />
            <Route path="apprentis" element={<TuteurApprentis />} />
            <Route path="presences" element={<TuteurPresences />} />
            <Route path="documents" element={<TuteurDocuments />} />
            <Route path="messages" element={<TuteurMessages />} />
          </Route>

          {/* Espace ENTREPRISE */}
          <Route path="/entreprise" element={<ProtectedRoute role="entreprise" />}>
            <Route index element={<EntrepriseDashboard />} />
            <Route path="contrats" element={<EntrepriseContrats />} />
            <Route path="tuteurs" element={<EntrepriseTuteurs />} />
            <Route path="factures" element={<EntrepriseFactures />} />
            <Route path="financements" element={<EntrepriseFinancements />} />
            <Route path="messages" element={<EntrepriseMessages />} />
          </Route>
          
          {/* Annuaire et Profil de la plateforme (accessible à tous les utilisateurs connectés) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/annuaire" element={<AnnuairePage />} />
            <Route path="/profil" element={<MonProfil />} />
          </Route>

          {/* Page de contact accessible à tous */}
          <Route path="/contact" element={<ContactPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
