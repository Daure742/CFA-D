import RoleModulePage from '../../components/ui/RoleModulePage';

export default function TuteurMessages() {
  return (
    <RoleModulePage
      eyebrow="Tuteur"
      title="Messages CFA"
      description="Echangez avec le CFA, l apprenti et les interlocuteurs administratifs."
      backTo="/tuteur"
      metrics={[
        { label: 'Non lus', value: '0' },
        { label: 'Conversations', value: '1' },
        { label: 'Alertes', value: '0' },
      ]}
      actions={[
        { label: 'Voir apprentis', to: '/tuteur/apprentis', primary: true },
        { label: 'Presences', to: '/tuteur/presences' },
      ]}
      items={[
        {
          title: 'Conversation CFA',
          status: 'Ouverte',
          text: 'Les echanges de suivi, alertes et demandes administratives seront regroupes dans cette messagerie.',
          action: 'Voir documents',
          to: '/tuteur/documents',
        },
      ]}
    />
  );
}
