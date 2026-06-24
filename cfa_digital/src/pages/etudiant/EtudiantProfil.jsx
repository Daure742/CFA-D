import { WorkspacePage } from '../../components/ui/PageTemplate';

export default function EtudiantProfil() {
  return (
    <WorkspacePage
      title="Mon profil"
      description="Verifiez vos informations personnelles, contacts et preferences de compte."
      metrics={[
        { label: 'Profil', value: 'Actif' },
        { label: 'Pieces', value: '4' },
        { label: 'Securite', value: 'OK' },
      ]}
      tasks={['Informations personnelles', 'Coordonnees', 'Securite du compte', 'Preferences']}
    />
  );
}
