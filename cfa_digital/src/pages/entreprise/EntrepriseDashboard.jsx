import { WorkspacePage } from '../../components/ui/PageTemplate';

export default function EntrepriseDashboard() {
  return (
    <WorkspacePage
      title="Tableau de bord entreprise"
      description="Administrez les contrats, tuteurs, apprentis, financements et echanges avec le CFA."
      actions={[
        { label: 'Voir les contrats', to: '/entreprise/contrats', primary: true },
        { label: 'Gerer les tuteurs', to: '/entreprise/tuteurs' },
        { label: 'Suivre les factures', to: '/entreprise/factures' },
      ]}
      metrics={[
        { label: 'Contrats actifs', value: '1', to: '/entreprise/contrats', helper: 'Consulter les contrats d apprentissage et leur statut.' },
        { label: 'Tuteurs', value: '1', to: '/entreprise/tuteurs', helper: 'Gerer les tuteurs rattaches aux apprentis.' },
        { label: 'Factures', value: '1', to: '/entreprise/factures', helper: 'Suivre factures, financements et paiements.' },
      ]}
      tasks={[
        { title: 'Contrats apprentissage', to: '/entreprise/contrats', text: 'Ouvrir les contrats actifs, dates, signatures et documents.' },
        { title: 'Equipe tutorale', to: '/entreprise/tuteurs', text: 'Ajouter, verifier et rattacher les tuteurs entreprise.' },
        { title: 'Financements OPCO', to: '/entreprise/financements', text: 'Suivre financements, prises en charge et alertes.' },
        { title: 'Communication CFA', to: '/entreprise/messages', text: 'Echanger avec l administration et suivre les demandes.' },
      ]}
    />
  );
}
