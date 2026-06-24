import RoleModulePage from '../../components/ui/RoleModulePage';

export default function EntrepriseContrats() {
  return (
    <RoleModulePage
      eyebrow="Entreprise"
      title="Contrats apprentissage"
      description="Consultez les contrats actifs, signatures, dates importantes et documents rattaches."
      backTo="/entreprise"
      metrics={[
        { label: 'Contrats actifs', value: '1' },
        { label: 'A signer', value: '0' },
        { label: 'Alertes', value: '0' },
      ]}
      actions={[
        { label: 'Gerer tuteurs', to: '/entreprise/tuteurs', primary: true },
        { label: 'Voir factures', to: '/entreprise/factures' },
      ]}
      items={[
        {
          title: 'Contrat apprenti',
          status: 'Actif',
          text: 'Contrat rattache a l apprenti, au CFA, au tuteur et au calendrier d alternance.',
          action: 'Voir factures',
          to: '/entreprise/factures',
        },
      ]}
    />
  );
}
