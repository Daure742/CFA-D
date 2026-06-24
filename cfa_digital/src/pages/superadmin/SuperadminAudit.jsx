import RoleModulePage from '../../components/ui/RoleModulePage';

export default function SuperadminAudit() {
  return (
    <RoleModulePage
      eyebrow="Superadmin"
      title="Audit global"
      description="Consultez les evenements sensibles, connexions, modifications et alertes securite de la plateforme."
      backTo="/superadmin"
      metrics={[
        { label: 'Evenements', value: '24' },
        { label: 'Alertes ouvertes', value: '0' },
        { label: 'Acces refuses', value: '0' },
      ]}
      actions={[
        { label: 'Voir tenants', to: '/superadmin/tenants', primary: true },
        { label: 'Support', to: '/superadmin/support' },
      ]}
      items={[
        {
          title: 'Journal des actions sensibles',
          status: 'Surveille',
          text: 'Connexions, changements de role, exports et actions administratives doivent etre tracables.',
          action: 'Support',
          to: '/superadmin/support',
        },
      ]}
    />
  );
}
