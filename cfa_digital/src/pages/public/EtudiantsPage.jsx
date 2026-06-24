import { PageTemplate } from '../../components/ui/PageTemplate';

export default function EtudiantsPage() {
  return (
    <PageTemplate
      eyebrow="Vie etudiante"
      title="Un espace clair pour suivre son parcours"
      description="Les etudiants disposent d un tableau de bord pour consulter leurs cours, devoirs, documents, notes, agenda et messages."
      actions={[
        { label: 'Acceder a mon espace', to: '/connexion', primary: true },
        { label: 'Voir les formations', to: '/formations' },
      ]}
      sections={[
        {
          title: 'Organisation',
          text: 'Agenda, documents et cours restent accessibles depuis une interface simple et lisible.',
        },
        {
          title: 'Progression',
          text: 'Les notes et devoirs permettent de suivre le travail realise et les priorites de la semaine.',
        },
      ]}
    />
  );
}
