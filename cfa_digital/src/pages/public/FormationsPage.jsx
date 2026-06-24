import { PageTemplate } from '../../components/ui/PageTemplate';

export default function FormationsPage() {
  return (
    <PageTemplate
      eyebrow="Catalogue"
      title="Formations disponibles"
      description="Explorez les parcours proposes par le CFA et accedez aux informations utiles avant de candidater."
      actions={[
        { label: 'Demarrer une candidature', to: '/admissions', primary: true },
        { label: 'Retour accueil', to: '/' },
      ]}
      sections={[
        {
          title: 'Developpement web',
          text: 'Parcours oriente projets, bases front-end, back-end, API, bases de donnees et bonnes pratiques professionnelles.',
        },
        {
          title: 'Administration systemes',
          text: 'Formation aux environnements postes, reseaux, securite, supervision et support aux utilisateurs.',
        },
        {
          title: 'Gestion et relation client',
          text: 'Suivi commercial, outils numeriques, communication professionnelle et pilotage de dossiers.',
        },
        {
          title: 'Parcours individualise',
          text: 'Accompagnement adapte au niveau, au rythme et au projet professionnel de chaque apprenant.',
        },
      ]}
    />
  );
}
