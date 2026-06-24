import { WorkspacePage } from '../../components/ui/PageTemplate';

export default function TuteurDashboard() {
  return (
    <WorkspacePage
      title="Tableau de bord tuteur"
      description="Suivez les apprentis rattaches a votre entreprise, leurs presences, progressions et documents importants."
      actions={[
        { label: 'Voir les apprentis', to: '/tuteur/apprentis', primary: true },
        { label: 'Valider les presences', to: '/tuteur/presences' },
        { label: 'Messages CFA', to: '/tuteur/messages' },
      ]}
      metrics={[
        { label: 'Apprentis suivis', value: '1', to: '/tuteur/apprentis', helper: 'Consulter les fiches, progressions et alertes alternance.' },
        { label: 'Presences a valider', value: '2', to: '/tuteur/presences', helper: 'Controler les presences, retards et validations entreprise.' },
        { label: 'Documents', value: '4', to: '/tuteur/documents', helper: 'Ouvrir les documents utiles au suivi en entreprise.' },
      ]}
      tasks={[
        { title: 'Suivi alternance', to: '/tuteur/apprentis', text: 'Suivre la progression, les objectifs et les points de vigilance.' },
        { title: 'Presences et retards', to: '/tuteur/presences', text: 'Valider les periodes et signaler les anomalies.' },
        { title: 'Documents entreprise', to: '/tuteur/documents', text: 'Consulter ou deposer les pieces demandees par le CFA.' },
        { title: 'Messages CFA', to: '/tuteur/messages', text: 'Echanger avec le CFA, l apprenti et l administration.' },
      ]}
    />
  );
}
