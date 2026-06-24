import RoleModulePage from '../../components/ui/RoleModulePage';

export default function EntrepriseMessages() {
  return (
    <RoleModulePage
      eyebrow="Entreprise"
      title="Communication CFA"
      description="Centralisez les echanges entre l entreprise, le CFA, les tuteurs et l administration."
      backTo="/entreprise"
      metrics={[
        { label: 'Non lus', value: '0' },
        { label: 'Demandes', value: '0' },
        { label: 'Alertes', value: '0' },
      ]}
      actions={[
        { label: 'Voir contrats', to: '/entreprise/contrats', primary: true },
        { label: 'Gerer tuteurs', to: '/entreprise/tuteurs' },
      ]}
      items={[
        {
          title: 'Fil entreprise CFA',
          status: 'Disponible',
          text: 'Les messages administratifs, alertes contrats et demandes de documents seront affiches ici.',
          action: 'Voir contrats',
          to: '/entreprise/contrats',
        },
      ]}
    />
  );
}
