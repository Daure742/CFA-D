import { PageTemplate } from '../../components/ui/PageTemplate';
import { useState } from 'react';

export default function HomePage() {
  const [expanded, setExpanded] = useState(null);
  
  const faqs = [
    {
      question: 'Qu\'est-ce que CFA Digital?',
      answer: 'CFA Digital est une plateforme moderne dédiée aux centres de formation en alternance, permettant de gérer les admissions, le suivi des apprenants et les communications.'
    },
    {
      question: 'Comment candidater?',
      answer: 'Accédez à la page "Admissions" et complétez le formulaire de candidature en ligne. Notre équipe examinera votre dossier et vous contactera.'
    },
    {
      question: 'Quels sont les avantages de l\'alternance?',
      answer: 'L\'alternance combine formation théorique et expérience professionnelle, offrant une excellente employabilité et une rémunération.'
    },
    {
      question: 'Quand démarrer?',
      answer: 'Les sessions ouvertes sont affichées lors de votre candidature. Consultez les dates d\'entrée prévues pour chaque formation.'
    }
  ];

  return (
    <>
      <PageTemplate
        eyebrow="Plateforme CFA"
        title="Pilotez les formations, les admissions et le suivi des apprenants"
        description="CFA Digital centralise les parcours, les candidatures, les documents, les notes et les communications pour offrir une expérience claire aux étudiants, formateurs et administrateurs."
        actions={[
          { label: 'Voir les formations', to: '/formations', primary: true },
          { label: 'Candidater', to: '/admissions' },
        ]}
        stats={[
          { label: 'Espaces connectés', value: '3' },
          { label: 'Suivi pédagogique', value: '100%' },
          { label: 'Accès sécurisé', value: 'Oui' },
        ]}
        sections={[
          {
            title: 'Admissions simplifiées',
            text: 'Les candidats peuvent comprendre les étapes, préparer leur dossier et rejoindre le bon parcours.',
          },
          {
            title: 'Vie étudiante lisible',
            text: 'Les apprenants retrouvent leurs cours, notes, documents, messages et devoirs depuis un espace unique.',
          },
          {
            title: 'Pilotage administratif',
            text: 'Les équipes gardent une vision claire sur les cohortes, les finances, le planning et les rapports.',
          },
          {
            title: 'Communication intégrée',
            text: 'Les notifications et la messagerie accompagnent les actions importantes de la plateforme.',
          },
        ]}
      />

      {/* Section FAQ */}
      <div className="mt-12 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-950 mb-6">Questions fréquentes</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setExpanded(expanded === idx ? null : idx)}
                className="w-full flex items-center justify-between bg-gray-50 p-4 hover:bg-gray-100 transition"
              >
                <span className="font-semibold text-gray-950">{faq.question}</span>
                <span className={`transform transition ${expanded === idx ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {expanded === idx && (
                <div className="border-t border-gray-200 p-4 bg-white">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section CTA */}
      <div className="mt-12 rounded-lg border border-indigo-200 bg-indigo-50 p-8 text-center shadow-sm">
        <h2 className="text-2xl font-bold text-indigo-900 mb-3">
          Prêt à rejoindre notre communauté?
        </h2>
        <p className="text-indigo-700 mb-6">
          Parcourez nos formations et commencez votre candidature dès aujourd'hui.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a
            href="/formations"
            className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
          >
            Explorer les formations
          </a>
          <a
            href="/admissions"
            className="rounded-md border border-indigo-600 px-6 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-100 transition"
          >
            Candidater maintenant
          </a>
        </div>
      </div>
    </>
  );
}
