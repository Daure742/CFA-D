import RoleModulePage from '../../components/ui/RoleModulePage';

export default function SuperadminAbonnements() {
  return (
    <RoleModulePage
      eyebrow="Superadmin"
      title="Abonnements SaaS"
      description="Suivez les offres, quotas, renouvellements et limites d usage de chaque CFA client."
      backTo="/superadmin"
      metrics={[
        { label: 'Abonnements actifs', value: '1' },
        { label: 'Renouvellements', value: '0' },
        { label: 'Alertes quota', value: '0' },
      ]}
      actions={[
        { label: 'Voir tenants', to: '/superadmin/tenants', primary: true },
        { label: 'Support plateforme', to: '/superadmin/support' },
      ]}
      items={[
        {
          title: 'Offre CFA Digital',
          status: 'Active',
          text: 'Abonnement actif pour le tenant demo avec suivi des modules, utilisateurs et usages.',
          action: 'Ouvrir tenant',
          to: '/superadmin/tenants',
        },
      ]}
    />
  );
}
