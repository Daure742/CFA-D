import RoleModulePage from '../../components/ui/RoleModulePage';

export default function EntrepriseFactures() {
  return (
    <RoleModulePage
      eyebrow="Entreprise"
      title="Factures et paiements"
      description="Suivez les factures, paiements, echeances et informations financieres rattachees au CFA."
      backTo="/entreprise"
      metrics={[
        { label: 'Factures', value: '1' },
        { label: 'A payer', value: '0' },
        { label: 'En retard', value: '0' },
      ]}
      actions={[
        { label: 'Financements OPCO', to: '/entreprise/financements', primary: true },
        { label: 'Voir contrats', to: '/entreprise/contrats' },
      ]}
      items={[
        {
          title: 'Facture CFA',
          status: 'A jour',
          text: 'Facturation rattachee au contrat actif avec etat de paiement et reference administrative.',
          action: 'Voir financements',
          to: '/entreprise/financements',
        },
      ]}
    />
  );
}
