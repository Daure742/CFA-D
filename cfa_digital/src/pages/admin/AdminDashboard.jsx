import { WorkspacePage } from '../../components/ui/PageTemplate';

export default function AdminDashboard() {
  return (
    <WorkspacePage
      title="Tableau de bord administration"
      description="Supervisez les apprenants, formateurs, cohortes, candidatures et indicateurs cles du CFA."
      actions={[
        { label: 'Gerer les etudiants', to: '/admin/etudiants', primary: true },
        { label: 'Publier le planning', to: '/admin/planning' },
        { label: 'Traiter les candidatures', to: '/admin/candidatures' },
        { label: 'Listes d attente', to: '/admin/waitlists' },
      ]}
      metrics={[
        { label: 'Etudiants', value: '248', to: '/admin/etudiants', helper: 'Consulter les dossiers, documents et statuts administratifs.' },
        { label: 'Candidatures', value: '37', to: '/admin/candidatures', helper: 'Traiter les admissions, pieces manquantes et decisions.' },
        { label: 'Cohortes', value: '12', to: '/admin/cohortes', helper: 'Gerer les sessions, groupes et rattachements.' },
      ]}
      tasks={[
        { title: 'Indicateurs cles', to: '/admin/rapports', text: 'Analyser les presences, resultats et donnees Qualiopi.' },
        { title: 'Candidatures recentes', to: '/admin/candidatures', text: 'Ouvrir les nouveaux dossiers et prendre une decision.' },
        { title: 'Alertes administratives', to: '/admin/etudiants', text: 'Verifier les documents manquants et les dossiers a corriger.' },
        { title: 'Activite plateforme', to: '/admin/planning', text: 'Piloter sessions, cours publies et prochaines echeances.' },
      ]}
    />
  );
}
