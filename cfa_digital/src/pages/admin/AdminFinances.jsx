import { WorkspacePage } from '../../components/ui/PageTemplate';

export default function AdminFinances() {
  return (
    <WorkspacePage
      title="Finances"
      description="Suivez les elements financiers, facturations et indicateurs administratifs."
      metrics={[
        { label: 'Dossiers', value: '128' },
        { label: 'A traiter', value: '11' },
        { label: 'Taux suivi', value: '94%' },
      ]}
      tasks={['Facturation', 'Dossiers financeurs', 'Alertes', 'Synthese mensuelle']}
    />
  );
}
