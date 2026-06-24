import RoleModulePage from '../../components/ui/RoleModulePage';

export default function SuperadminTenants() {
  return (
    <RoleModulePage
      eyebrow="Superadmin"
      title="Gestion des tenants CFA"
      description="Controlez les CFA clients, leurs statuts, leurs environnements et leurs droits d acces."
      backTo="/superadmin"
      metrics={[
        { label: 'CFA actifs', value: '1' },
        { label: 'A verifier', value: '0' },
        { label: 'Suspendus', value: '0' },
      ]}
      actions={[
        { label: 'Retour superadmin', to: '/superadmin', primary: true },
        { label: 'Audit global', to: '/superadmin/audit' },
      ]}
      items={[
        {
          title: 'CFA Demo',
          status: 'Actif',
          text: 'Tenant operationnel avec utilisateurs, cohortes, cours et donnees pedagogiques de demonstration.',
          action: 'Voir audit',
          to: '/superadmin/audit',
        },
      ]}
    />
  );
}
