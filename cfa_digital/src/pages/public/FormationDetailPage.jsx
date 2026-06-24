import { useParams } from 'react-router-dom';
import { PageTemplate } from '../../components/ui/PageTemplate';

export default function FormationDetailPage() {
  const { id } = useParams();

  return (
    <PageTemplate
      eyebrow="Detail formation"
      title={`Formation ${id || ''}`}
      description="Cette page presente les objectifs, le rythme, les prerequis et les debouches de la formation selectionnee."
      actions={[
        { label: 'Candidater', to: '/admissions', primary: true },
        { label: 'Toutes les formations', to: '/formations' },
      ]}
      stats={[
        { label: 'Modalite', value: 'Alternance' },
        { label: 'Suivi', value: 'Continu' },
        { label: 'Dossier', value: 'En ligne' },
      ]}
      sections={[
        {
          title: 'Objectifs',
          text: 'Acquerir des competences operationnelles et construire un portfolio de preuves professionnelles.',
        },
        {
          title: 'Accompagnement',
          text: 'L apprenant est suivi par l equipe pedagogique avec des points reguliers et des ressources centralisees.',
        },
      ]}
    />
  );
}
