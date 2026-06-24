import RoleModulePage from '../../components/ui/RoleModulePage';

export default function TuteurPresences() {
  return (
    <RoleModulePage
      eyebrow="Tuteur"
      title="Presences et retards"
      description="Controlez les periodes en entreprise, les retards, absences et validations attendues."
      backTo="/tuteur"
      metrics={[
        { label: 'A valider', value: '2' },
        { label: 'Retards', value: '0' },
        { label: 'Absences', value: '0' },
      ]}
      actions={[
        { label: 'Voir apprentis', to: '/tuteur/apprentis', primary: true },
        { label: 'Documents', to: '/tuteur/documents' },
      ]}
      items={[
        {
          title: 'Validation entreprise',
          status: 'A traiter',
          text: 'Les periodes declarees par l apprenti doivent etre confirmees ou signalees au CFA.',
          action: 'Contacter CFA',
          to: '/tuteur/messages',
        },
      ]}
    />
  );
}
