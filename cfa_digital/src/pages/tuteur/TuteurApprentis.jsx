import RoleModulePage from '../../components/ui/RoleModulePage';

export default function TuteurApprentis() {
  return (
    <RoleModulePage
      eyebrow="Tuteur"
      title="Apprentis suivis"
      description="Consultez les apprentis rattaches, leur progression, leurs alertes et les prochaines echeances."
      backTo="/tuteur"
      metrics={[
        { label: 'Apprentis', value: '1' },
        { label: 'Alertes', value: '0' },
        { label: 'Objectifs actifs', value: '3' },
      ]}
      actions={[
        { label: 'Valider presences', to: '/tuteur/presences', primary: true },
        { label: 'Messages CFA', to: '/tuteur/messages' },
      ]}
      items={[
        {
          title: 'Apprenti rattache',
          status: 'En suivi',
          text: 'Fiche de suivi alternance avec progression, presences et documents importants.',
          action: 'Voir presences',
          to: '/tuteur/presences',
        },
      ]}
    />
  );
}
