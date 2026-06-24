import { WorkspacePage } from '../../components/ui/PageTemplate';

export default function EtudiantDashboard() {
  return (
    <WorkspacePage
      title="Tableau de bord etudiant"
      description="Vue d ensemble du parcours, des prochaines echeances et des informations importantes."
      actions={[
        { label: 'Voir mes cours', to: '/etudiant/cours', primary: true },
        { label: 'Deposer un devoir', to: '/etudiant/devoirs' },
        { label: 'Lire mes messages', to: '/etudiant/messages' },
      ]}
      metrics={[
        { label: 'Cours actifs', value: '6', to: '/etudiant/cours', helper: 'Rejoindre un live, consulter les cours planifies ou revoir un replay.' },
        { label: 'Devoirs a rendre', value: '3', to: '/etudiant/devoirs', helper: 'Voir les consignes, les dates limites, les depots et les corrections.' },
        { label: 'Messages non lus', value: '2', to: '/etudiant/messages', helper: 'Acceder au chat de classe et a l assistant pedagogique.' },
      ]}
      tasks={[
        { title: 'Planning de la semaine', to: '/etudiant/agenda', text: 'Consulter les cours et echeances de la semaine.' },
        { title: 'Dernieres notifications', to: '/etudiant/messages', text: 'Lire les alertes importantes et les messages non lus.' },
        { title: 'Progression pedagogique', to: '/etudiant/notes', text: 'Suivre les notes, evaluations, moyennes et commentaires.' },
        { title: 'Documents recents', to: '/etudiant/documents', text: 'Ouvrir les documents administratifs et pedagogiques disponibles.' },
      ]}
    />
  );
}
