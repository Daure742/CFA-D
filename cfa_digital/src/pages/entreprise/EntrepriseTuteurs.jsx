import RoleModulePage from '../../components/ui/RoleModulePage';

export default function EntrepriseTuteurs() {
  return (
    <RoleModulePage
      eyebrow="Entreprise"
      title="Equipe tutorale"
      description="Gerez les tuteurs entreprise, leurs rattachements et leurs acces a l espace de suivi."
      backTo="/entreprise"
      metrics={[
        { label: 'Tuteurs', value: '1' },
        { label: 'Apprentis rattaches', value: '1' },
        { label: 'Acces actifs', value: '1' },
      ]}
      actions={[
        { label: 'Voir contrats', to: '/entreprise/contrats', primary: true },
        { label: 'Messages CFA', to: '/entreprise/messages' },
      ]}
      items={[
        {
          title: 'Tuteur principal',
          status: 'Actif',
          text: 'Compte tuteur rattache a l apprenti avec acces au suivi, presences, documents et messages.',
          action: 'Messages CFA',
          to: '/entreprise/messages',
        },
      ]}
    />
  );
}
