import RoleModulePage from '../../components/ui/RoleModulePage';

export default function TuteurDocuments() {
  return (
    <RoleModulePage
      eyebrow="Tuteur"
      title="Documents entreprise"
      description="Retrouvez les documents utiles au suivi de l apprenti et aux validations en entreprise."
      backTo="/tuteur"
      metrics={[
        { label: 'Documents', value: '4' },
        { label: 'A signer', value: '0' },
        { label: 'Manquants', value: '0' },
      ]}
      actions={[
        { label: 'Voir apprentis', to: '/tuteur/apprentis', primary: true },
        { label: 'Messages CFA', to: '/tuteur/messages' },
      ]}
      items={[
        {
          title: 'Documents de suivi',
          status: 'Disponible',
          text: 'Contrats, attestations, comptes rendus et documents de liaison seront centralises ici.',
          action: 'Messages CFA',
          to: '/tuteur/messages',
        },
      ]}
    />
  );
}
