import RoleModulePage from '../../components/ui/RoleModulePage';

export default function SuperadminSupport() {
  return (
    <RoleModulePage
      eyebrow="Superadmin"
      title="Support plateforme"
      description="Centralisez les incidents, demandes clients et actions de maintenance de la plateforme."
      backTo="/superadmin"
      metrics={[
        { label: 'Tickets ouverts', value: '0' },
        { label: 'Incidents', value: '0' },
        { label: 'Demandes clients', value: '0' },
      ]}
      actions={[
        { label: 'Audit global', to: '/superadmin/audit', primary: true },
        { label: 'Abonnements', to: '/superadmin/abonnements' },
      ]}
      items={[
        {
          title: 'File support',
          status: 'Disponible',
          text: 'Les demandes d assistance seront affichees ici avec priorite, tenant concerne et etat de traitement.',
          action: 'Voir audit',
          to: '/superadmin/audit',
        },
      ]}
    />
  );
}
