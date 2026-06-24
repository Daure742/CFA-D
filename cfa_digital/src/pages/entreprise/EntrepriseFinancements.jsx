import RoleModulePage from '../../components/ui/RoleModulePage';

export default function EntrepriseFinancements() {
  return (
    <RoleModulePage
      eyebrow="Entreprise"
      title="Financements OPCO"
      description="Suivez les prises en charge, demandes OPCO, montants et alertes de financement."
      backTo="/entreprise"
      metrics={[
        { label: 'Dossiers', value: '1' },
        { label: 'Valides', value: '1' },
        { label: 'A completer', value: '0' },
      ]}
      actions={[
        { label: 'Voir factures', to: '/entreprise/factures', primary: true },
        { label: 'Messages CFA', to: '/entreprise/messages' },
      ]}
      items={[
        {
          title: 'Prise en charge',
          status: 'Validee',
          text: 'Dossier de financement rattache au contrat et aux documents administratifs.',
          action: 'Contacter CFA',
          to: '/entreprise/messages',
        },
      ]}
    />
  );
}
