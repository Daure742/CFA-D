const puppeteer = require('puppeteer');

const baseStyles = `
  body { font-family: Arial, sans-serif; color: #111827; margin: 32px; }
  h1 { font-size: 24px; margin: 0 0 8px; }
  h2 { font-size: 18px; margin: 24px 0 8px; }
  p { margin: 4px 0; }
  table { border-collapse: collapse; width: 100%; margin-top: 16px; }
  th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 12px; }
  th { background: #f3f4f6; }
  .muted { color: #6b7280; font-size: 12px; }
  .signature { margin-top: 56px; display: flex; justify-content: space-between; }
`;

const renderPDF = async (body) => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${baseStyles}</style></head><body>${body}</body></html>`, {
      waitUntil: 'networkidle0'
    });
    return page.pdf({ format: 'A4', printBackground: true });
  } finally {
    await browser.close();
  }
};

const formatDate = (value) => {
  if (!value) return 'Non defini';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
};

const formatMinutes = (value) => `${Number(value || 0)} min`;

exports.feuillePresence = ({ cours, presences }) => {
  const rows = presences.map((presence) => `
    <tr>
      <td>${presence.etudiant?.prenom || ''} ${presence.etudiant?.nom || ''}</td>
      <td>${presence.etudiant?.email || ''}</td>
      <td>${presence.statut || 'absent'}</td>
      <td>${formatDate(presence.heureDebut)}</td>
      <td>${formatDate(presence.heureFin)}</td>
      <td>${formatMinutes(presence.dureeMinutes)}</td>
      <td>${presence.valideFormateur ? 'Validee' : 'A valider'}</td>
    </tr>
  `).join('');

  return renderPDF(`
    <h1>Feuille de presence</h1>
    <p><strong>Cours :</strong> ${cours.titre}</p>
    <p><strong>Periode :</strong> ${formatDate(cours.dateDebut)} - ${formatDate(cours.dateFin)}</p>
    <p><strong>Formateur :</strong> ${cours.formateur?.prenom || ''} ${cours.formateur?.nom || ''}</p>
    <p class="muted">Document genere automatiquement depuis CFA Digital.</p>
    <table>
      <thead>
        <tr><th>Apprenant</th><th>Email</th><th>Statut</th><th>Connexion</th><th>Fin</th><th>Duree</th><th>Validation</th></tr>
      </thead>
      <tbody>${rows || '<tr><td colspan="7">Aucune presence enregistree.</td></tr>'}</tbody>
    </table>
    <div class="signature">
      <p>Signature formateur</p>
      <p>Cachet CFA</p>
    </div>
  `);
};

exports.attestationPresence = ({ presence }) => renderPDF(`
  <h1>Attestation individuelle de presence</h1>
  <p>Nous attestons que :</p>
  <h2>${presence.etudiant?.prenom || ''} ${presence.etudiant?.nom || ''}</h2>
  <p>a participe au cours <strong>${presence.cours?.titre || ''}</strong>.</p>
  <p><strong>Date :</strong> ${formatDate(presence.cours?.dateDebut)}</p>
  <p><strong>Connexion :</strong> ${formatDate(presence.heureDebut)}</p>
  <p><strong>Duree tracee :</strong> ${formatMinutes(presence.dureeMinutes)}</p>
  <p><strong>Statut :</strong> ${presence.statut || 'absent'}</p>
  <p><strong>Validation formateur :</strong> ${presence.valideFormateur ? 'Oui' : 'Non'}</p>
  <p class="muted">Cette attestation est archivee et tracable dans CFA Digital.</p>
  <div class="signature">
    <p>Signature formateur</p>
    <p>Cachet CFA</p>
  </div>
`);
