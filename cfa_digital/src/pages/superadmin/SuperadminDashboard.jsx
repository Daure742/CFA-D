import { WorkspacePage } from '../../components/ui/PageTemplate';

export default function SuperadminDashboard() {
  return (
    <WorkspacePage
      title="Tableau de bord superadmin"
      description="Pilotez les CFA clients, les abonnements SaaS, la securite globale et les indicateurs de plateforme."
      actions={[
        { label: 'Gerer les tenants', to: '/superadmin/tenants', primary: true },
        { label: 'Gerer les formateurs', to: '/admin/formateurs' },
        { label: 'Suivre le SaaS', to: '/superadmin/abonnements' },
        { label: 'Audit global', to: '/superadmin/audit' }
      ]}
      metrics={[
        { label: 'CFA actifs', value: '1', to: '/superadmin/tenants', helper: 'Ouvrir la supervision des CFA clients et de leurs tenants.' },
        { label: 'Abonnements', value: '1', to: '/superadmin/abonnements', helper: 'Suivre les offres, statuts et limites d usage.' },
        { label: 'Alertes securite', value: '0', to: '/superadmin/audit', helper: 'Verifier les evenements sensibles et le journal global.' },
      ]}
      tasks={[
        { title: 'Gestion des tenants', to: '/superadmin/tenants', text: 'Creer, activer, suspendre et controler les CFA clients.' },
        { title: 'Suivi SaaS', to: '/superadmin/abonnements', text: 'Piloter abonnements, quotas, facturation et etat des services.' },
        { title: 'Audit global', to: '/superadmin/audit', text: 'Consulter les connexions, actions sensibles et alertes securite.' },
        { title: 'Support plateforme', to: '/superadmin/support', text: 'Suivre les demandes d assistance et incidents de production.' },
      ]}
    />
  );
}
