# Structure MongoDB Atlas complete - CFA Digital LMS SaaS

Objectif: fournir une base MongoDB Atlas professionnelle pour une plateforme LMS tout-en-un dediee aux CFA en ligne, multi-tenant, conforme aux exigences de tracabilite Qualiopi, exploitable en interne et commercialisable en SaaS.

Important: la base de donnees seule ne rend pas toute la plateforme fonctionnelle. Les collections ci-dessous doivent etre accompagnees de schemas Mongoose, validations backend, routes API, controles d'acces, stockage fichiers, sauvegardes et supervision. Les collections deja presentes dans le code sont marquees `existant`.

## Principes obligatoires

- Toutes les collections metier doivent contenir `tenantId` pour isoler chaque CFA.
- Tous les documents importants doivent contenir `createdAt`, `updatedAt`, `createdBy`, `updatedBy` quand applicable.
- Les suppressions doivent etre logiques: `isDeleted`, `deletedAt`, `deletedBy`.
- Les champs sensibles ne doivent jamais etre stockes en clair: mot de passe, tokens, pieces confidentielles.
- Les fichiers doivent stocker des metadonnees et une URL securisee, pas le fichier binaire directement en base.
- Les actions importantes doivent creer un `auditlogs`.
- Les index doivent etre crees par tenant pour performance SaaS.

## Validations communes

```js
nom: /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,80}$/
prenom: /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,80}$/
telephoneFR: /^(?:\+33|0)[1-9](?:[ .-]?\d{2}){4}$/
email: lowercase + trim + format email
siret: /^\d{14}$/
codePostalFR: /^\d{5}$/
note20: min 0, max 20
objectId: ObjectId valide
```

Regle telephone: unique par CFA si utilise comme identifiant secondaire.

```js
db.users.createIndex({ tenantId: 1, telephone: 1 }, {
  unique: true,
  partialFilterExpression: { telephone: { $exists: true, $type: "string" } }
})
```

## Collections centrales existantes

### `cfas` existant

Tenant principal.

Champs recommandes:

- `nom`, `slug`, `raisonSociale`
- `siret` unique global, `numeroUai`, `nda`
- `adresse`: `ligne1`, `ligne2`, `codePostal`, `ville`, `pays`
- `telephone`, `email`, `siteWeb`, `logo`
- `representantLegal`: `nom`, `prenom`, `email`, `telephone`
- `parametres`: `modeInscription`, `modulesActifs`, `nbMaxEtudiantsParCohorte`, `timezone`, `langue`, `signatureElectronique`
- `qualiopi`: `certifie`, `numeroCertificat`, `organismeCertificateur`, `dateDebut`, `dateFin`, `documents`
- `abonnement`: `plan`, `statut`, `limites`, `dateDebut`, `dateFin`
- `isActive`, timestamps

Index:

```js
db.cfas.createIndex({ siret: 1 }, { unique: true })
db.cfas.createIndex({ slug: 1 }, { unique: true })
db.cfas.createIndex({ isActive: 1 })
```

### `users` existant

Tous les comptes: superadmin, admin CFA, formateur, etudiant, tuteur, entreprise.

Champs recommandes:

- `tenantId`
- `nom`, `prenom`, `email`, `telephone`
- `motDePasse` hash bcrypt uniquement
- `role`: `superadmin`, `admin`, `formateur`, `etudiant`, `tuteur`, `entreprise`
- `permissions`: liste fine si besoin SaaS
- `civilite`, `dateNaissance`, `adresse`
- `avatar`, `isActive`, `emailVerified`, `telephoneVerified`
- `lastLoginAt`, `lastLoginIp`
- `refreshTokenHash` au lieu de token clair
- `formationChoisie`, `cohorte`
- `matieres`, `specialites`, `disponibilites`
- `preferences`: notification email, sms, in-app
- `resetPasswordTokenHash`, `resetPasswordExpires`
- `isDeleted`, timestamps

Index:

```js
db.users.createIndex({ tenantId: 1, email: 1 }, { unique: true })
db.users.createIndex({ tenantId: 1, role: 1, isActive: 1 })
db.users.createIndex({ tenantId: 1, cohorte: 1 })
db.users.createIndex({ tenantId: 1, nom: 1, prenom: 1 })
```

### `candidatures` existant

Pipeline admission.

Champs recommandes:

- `tenantId`
- `nom`, `prenom`, `email`, `telephone`
- `formation`, `sessionSouhaitee`, `niveauEtude`
- `dateNaissance`, `adresse`
- `cv`, `lettreMotivation`, `diplomes`, `pieceIdentite`
- `statut`: `nouvelle`, `en_revision`, `entretien`, `acceptee`, `refusee`, `liste_attente`, `convertie`
- `score`, `commentaireAdmin`, `assigneeA`
- `source`: site, salon, partenaire, import
- `rgpdConsentement`, `rgpdConsentementAt`
- timestamps

Index:

```js
db.candidatures.createIndex({ tenantId: 1, statut: 1, createdAt: -1 })
db.candidatures.createIndex({ tenantId: 1, email: 1 })
```

### `cohortes` existant

Session/promotion.

Champs recommandes:

- `tenantId`
- `nom`, `code`, `formationId`, `formation`
- `annee`, `dateDebut`, `dateFin`, `capacite`
- `statut`: `brouillon`, `ouverte`, `complete`, `en_cours`, `terminee`, `archivee`
- `etudiants`, `formateurs`, `referentAdministratif`
- `planningPublie`, `planningPublieLe`, `planningPubliePar`
- `objectifs`, `modalite`, `rythme`
- `isActive`, `isDeleted`, timestamps

Index:

```js
db.cohortes.createIndex({ tenantId: 1, nom: 1 }, { unique: true })
db.cohortes.createIndex({ tenantId: 1, formation: 1, statut: 1 })
db.cohortes.createIndex({ tenantId: 1, dateDebut: 1 })
```

### `cours` existant

Seances planifiees.

Champs recommandes:

- `tenantId`, `cohorte`, `formateur`
- `titre`, `description`, `matiere`, `moduleId`
- `dateDebut`, `dateFin`, `dureeMinutes`
- `modalite`: `presentiel`, `distanciel`, `hybride`
- `lienVisio`, `salle`
- `visibleEtudiant`, `publieLe`, `publiePar`
- `statut`: `planifie`, `en_cours`, `termine`, `annule`
- `replayUrl`, `replayExpireAt`
- `ressources`, `objectifsPedagogiques`
- `emargementFormateur`, `emargementEtudiant`
- timestamps

Index:

```js
db.cours.createIndex({ tenantId: 1, cohorte: 1, dateDebut: 1 })
db.cours.createIndex({ tenantId: 1, formateur: 1, dateDebut: 1 })
db.cours.createIndex({ tenantId: 1, visibleEtudiant: 1, dateDebut: 1 })
```

### `presences` existant

Preuves de presence et emargement.

Champs recommandes:

- `tenantId`, `cours`, `etudiant`
- `statut`: `present`, `absent`, `retard`, `excuse`
- `heureDebut`, `heureFin`, `dureeMinutes`
- `valideEtudiant`, `valideFormateur`
- `signatureEtudiant`, `signatureFormateur`
- `ipEtudiant`, `userAgent`
- `justificatifAbsence`
- `dateValidation`
- timestamps

Index:

```js
db.presences.createIndex({ tenantId: 1, cours: 1, etudiant: 1 }, { unique: true })
db.presences.createIndex({ tenantId: 1, etudiant: 1, createdAt: -1 })
```

### `devoirs` existant

Travaux demandes.

Champs recommandes:

- `tenantId`, `cohorte`, `formateur`
- `titre`, `description`, `matiere`, `moduleId`
- `datePublication`, `dateLimite`
- `fichiers`, `bareme`, `coefficient`
- `statut`: `brouillon`, `actif`, `corrige`, `archive`
- `autoriserRetard`, `penaliteRetard`
- timestamps

Index:

```js
db.devoirs.createIndex({ tenantId: 1, cohorte: 1, dateLimite: 1 })
db.devoirs.createIndex({ tenantId: 1, formateur: 1, statut: 1 })
```

### `rendus` existant

Soumissions et corrections.

Champs recommandes:

- `tenantId`, `devoir`, `etudiant`
- `fichiers`, `commentaire`, `dateRendu`
- `statut`: `a_faire`, `rendu`, `corrige`, `en_retard`, `non_rendu`
- `note`, `commentaireCorrection`, `fichierCorrige`
- `corrigePar`, `dateCorrection`
- `historiqueVersions`
- timestamps

Index:

```js
db.rendus.createIndex({ tenantId: 1, devoir: 1, etudiant: 1 }, { unique: true })
db.rendus.createIndex({ tenantId: 1, etudiant: 1, statut: 1 })
```

### `notes` existant

Evaluations.

Champs recommandes:

- `tenantId`, `etudiant`, `formateur`, `cohorte`
- `matiere`, `moduleId`, `evaluationId`
- `valeur`, `coefficient`, `bareme`
- `periode`: `1er semestre`, `2eme semestre`, `annee`
- `commentaire`, `dateEvaluation`
- `publiee`, `publieeLe`
- timestamps

Index:

```js
db.notes.createIndex({ tenantId: 1, etudiant: 1, periode: 1 })
db.notes.createIndex({ tenantId: 1, cohorte: 1, matiere: 1 })
```

### `bulletins` existant

Synthese officielle.

Champs recommandes:

- `tenantId`, `etudiant`, `cohorte`
- `periode`, `moyennes`, `moyenneGenerale`
- `absences`, `retards`, `appreciationGenerale`
- `decision`: `admis`, `ajourne`, `exclu`, `en_cours`
- `fichierPDF`, `hashPDF`
- `generePar`, `validePar`, `dateGeneration`, `dateValidation`
- timestamps

Index:

```js
db.bulletins.createIndex({ tenantId: 1, etudiant: 1, periode: 1, cohorte: 1 }, { unique: true })
```

### `documents` existant

GED et preuves Qualiopi.

Champs recommandes:

- `tenantId`
- `nom`, `type`, `categorie`, `description`
- `url`, `storageProvider`, `publicId`
- `version`, `hash`, `taille`, `mimeType`
- `destinataire`: `tous`, `etudiant`, `formateur`, `cohorte`, `admin`
- `cohorte`, `userId`
- `acceptationRequise`, `acceptations`
- `confidentiel`, `archive`, `dateArchivage`
- `retentionUntil`
- timestamps

Index:

```js
db.documents.createIndex({ tenantId: 1, type: 1, archive: 1 })
db.documents.createIndex({ tenantId: 1, cohorte: 1 })
db.documents.createIndex({ tenantId: 1, userId: 1 })
```

### `messages` existant

Messagerie classe/privee.

Champs recommandes:

- `tenantId`, `expediteur`, `destinataire`, `cohorte`
- `conversationId`
- `contenu`, `piecesJointes`
- `type`: `classe`, `prive`, `support`
- `luPar`: liste user/date
- `modere`, `signale`, `deletedFor`
- timestamps

Index:

```js
db.messages.createIndex({ tenantId: 1, cohorte: 1, createdAt: -1 })
db.messages.createIndex({ tenantId: 1, destinataire: 1, createdAt: -1 })
db.messages.createIndex({ tenantId: 1, conversationId: 1, createdAt: 1 })
```

### `notifications` existant

In-app, email, SMS.

Champs recommandes:

- `tenantId`, `destinataire`
- `titre`, `message`, `type`, `lien`
- `canal`: `in_app`, `email`, `sms`
- `lu`, `luAt`, `envoye`, `envoyeAt`
- `priorite`: `basse`, `normale`, `haute`, `critique`
- `expiresAt`
- timestamps

Index:

```js
db.notifications.createIndex({ tenantId: 1, destinataire: 1, lu: 1, createdAt: -1 })
db.notifications.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
```

### `auditlogs` existant

Journal legal et Qualiopi.

Champs recommandes:

- `tenantId`, `userId`
- `action`, `ressource`, `ressourceId`
- `avant`, `apres`, `details`
- `ip`, `userAgent`
- `niveau`: `info`, `warning`, `security`, `critical`
- `correlationId`
- `createdAt`

Index:

```js
db.auditlogs.createIndex({ tenantId: 1, createdAt: -1 })
db.auditlogs.createIndex({ tenantId: 1, userId: 1, createdAt: -1 })
db.auditlogs.createIndex({ tenantId: 1, ressource: 1, ressourceId: 1 })
```

## Collections a ajouter pour une vraie plateforme SaaS CFA

### `formations`

Catalogue des formations vendues/dispensees.

- `tenantId`
- `titre`, `slug`, `codeRNCP`, `niveau`, `dureeHeures`
- `description`, `objectifs`, `prerequis`, `publicCible`
- `competencesVisees`, `debouches`
- `prix`, `certification`, `modalitesEvaluation`
- `modules`
- `isPublished`, `isActive`
- timestamps

Index:

```js
db.formations.createIndex({ tenantId: 1, slug: 1 }, { unique: true })
db.formations.createIndex({ tenantId: 1, isPublished: 1 })
```

### `modules`

Blocs pedagogiques d'une formation.

- `tenantId`, `formationId`
- `titre`, `ordre`, `description`, `dureeHeures`
- `competences`, `objectifs`, `ressources`
- `isActive`

Index:

```js
db.modules.createIndex({ tenantId: 1, formationId: 1, ordre: 1 })
```

### `ressources_pedagogiques`

Supports LMS: videos, PDF, quiz, liens.

- `tenantId`, `formationId`, `moduleId`, `coursId`
- `titre`, `type`: `video`, `pdf`, `quiz`, `lien`, `scorm`, `exercice`
- `url`, `dureeMinutes`, `ordre`
- `visible`, `suiviObligatoire`
- `createdBy`, timestamps

### `progressions`

Suivi individuel de progression.

- `tenantId`, `etudiant`, `formationId`, `moduleId`, `ressourceId`
- `statut`: `non_commence`, `en_cours`, `termine`
- `progressionPourcentage`, `tempsPasseSecondes`
- `startedAt`, `completedAt`, `lastActivityAt`

Index:

```js
db.progressions.createIndex({ tenantId: 1, etudiant: 1, ressourceId: 1 }, { unique: true })
db.progressions.createIndex({ tenantId: 1, etudiant: 1, formationId: 1 })
```

### `quiz`

Evaluations interactives.

- `tenantId`, `formationId`, `moduleId`
- `titre`, `questions`, `scoreMinimal`, `tempsLimiteMinutes`
- `tentativesMax`, `visible`
- timestamps

### `quiz_attempts`

Tentatives d'etudiants.

- `tenantId`, `quizId`, `etudiant`
- `reponses`, `score`, `reussi`
- `startedAt`, `submittedAt`, `durationSeconds`

### `entreprises`

Entreprises d'accueil.

- `tenantId`
- `raisonSociale`, `siret`, `secteur`, `adresse`
- `contactPrincipal`: nom, prenom, email, telephone
- `tuteurs`: users lies
- `isActive`, timestamps

Index:

```js
db.entreprises.createIndex({ tenantId: 1, siret: 1 }, { unique: true })
```

### `contrats_apprentissage`

Contrats et alternance.

- `tenantId`, `etudiant`, `entrepriseId`, `tuteurId`, `cohorte`
- `typeContrat`: `apprentissage`, `professionnalisation`, `stage`
- `dateDebut`, `dateFin`, `rythmeAlternance`
- `statut`: `brouillon`, `signe`, `actif`, `termine`, `rompu`
- `documents`, `cerfa`, `opco`
- timestamps

### `financements`

OPCO, facturation formation, prise en charge.

- `tenantId`, `etudiant`, `entrepriseId`, `contratId`
- `financeur`, `opco`, `montantTotal`, `montantPrisEnCharge`
- `statut`: `demande`, `accorde`, `refuse`, `facture`, `paye`
- `echeances`, `documents`

### `factures`

Facturation SaaS ou CFA.

- `tenantId`
- `numero` unique par tenant
- `clientType`: `entreprise`, `etudiant`, `cfa`
- `clientId`, `lignes`, `totalHT`, `tva`, `totalTTC`
- `statut`: `brouillon`, `emise`, `payee`, `retard`, `annulee`
- `dateEmission`, `dateEcheance`, `fichierPDF`

Index:

```js
db.factures.createIndex({ tenantId: 1, numero: 1 }, { unique: true })
db.factures.createIndex({ tenantId: 1, statut: 1, dateEcheance: 1 })
```

### `paiements`

Reglements.

- `tenantId`, `factureId`
- `provider`: `stripe`, `virement`, `cheque`, `manuel`
- `providerPaymentId`
- `montant`, `devise`, `statut`
- `paidAt`, `metadata`

### `abonnements_saas`

Commercialisation SaaS.

- `tenantId`
- `plan`: `starter`, `pro`, `enterprise`
- `statut`: `trial`, `active`, `past_due`, `cancelled`
- `limites`: users, stockage, cohortes
- `prixMensuel`, `dateDebut`, `dateFin`, `stripeCustomerId`, `stripeSubscriptionId`

### `tickets_support`

Support interne et SaaS.

- `tenantId`, `createdBy`, `assignedTo`
- `sujet`, `description`, `priorite`, `statut`
- `messages`, `piecesJointes`
- timestamps

### `incidents`

Incidents securite ou exploitation.

- `tenantId`
- `titre`, `description`, `niveau`, `statut`
- `impact`, `resolution`, `reportedBy`, `resolvedBy`
- timestamps

### `evaluations_qualite`

Questionnaires satisfaction Qualiopi.

- `tenantId`, `cohorte`, `formationId`, `etudiant`
- `type`: `entree`, `milieu`, `fin`, `post_formation`
- `questions`, `scoreGlobal`, `commentaires`
- `submittedAt`

### `indicateurs_qualiopi`

Indicateurs agreges.

- `tenantId`, `formationId`, `cohorte`
- `periode`
- `tauxPresence`, `tauxReussite`, `tauxSatisfaction`, `tauxAbandon`, `tauxInsertion`
- `source`, `calculeAt`

### `reclamations`

Gestion des plaintes et amelioration continue.

- `tenantId`, `userId`
- `categorie`, `description`, `statut`, `priorite`
- `actionsCorrectives`, `dateResolution`
- timestamps

### `signatures`

Signatures electroniques: emargement, contrat, documents.

- `tenantId`, `userId`
- `documentId`, `ressource`, `ressourceId`
- `signatureDataUrl` ou `providerSignatureId`
- `ip`, `userAgent`, `signedAt`
- `hashPreuve`

### `sessions_auth`

Sessions securisees.

- `tenantId`, `userId`
- `refreshTokenHash`, `deviceId`, `ip`, `userAgent`
- `expiresAt`, `revokedAt`, `lastUsedAt`

Index TTL:

```js
db.sessions_auth.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
db.sessions_auth.createIndex({ tenantId: 1, userId: 1 })
```

### `webhooks`

Evenements externes Stripe, email, signature.

- `provider`, `eventId`, `type`
- `payload`, `processed`, `processedAt`, `error`
- `createdAt`

Index:

```js
db.webhooks.createIndex({ provider: 1, eventId: 1 }, { unique: true })
```

## Structure finale recommandee

```text
cfa_digital/
├── abonnements_saas/
├── auditlogs/
├── bulletins/
├── candidatures/
├── cfas/
├── cohortes/
├── contrats_apprentissage/
├── cours/
├── devoirs/
├── documents/
├── entreprises/
├── evaluations_qualite/
├── factures/
├── financements/
├── formations/
├── incidents/
├── indicateurs_qualiopi/
├── messages/
├── modules/
├── notes/
├── notifications/
├── paiements/
├── presences/
├── progressions/
├── quiz/
├── quiz_attempts/
├── reclamations/
├── rendus/
├── ressources_pedagogiques/
├── sessions_auth/
├── signatures/
├── tickets_support/
├── users/
└── webhooks/
```

## Donnees minimales a inserer pour demarrer

### 1. CFA

```js
{
  nom: "CFA Digital Demo",
  slug: "cfa-digital-demo",
  raisonSociale: "CFA Digital Demo SAS",
  siret: "12345678901234",
  email: "contact@cfa-demo.fr",
  telephone: "+33123456789",
  adresse: {
    ligne1: "10 rue de la Formation",
    codePostal: "75001",
    ville: "Paris",
    pays: "France"
  },
  parametres: {
    modeInscription: "surValidation",
    nbMaxEtudiantsParCohorte: 50,
    modulesActifs: ["cours", "devoirs", "presences", "documents", "messages", "notes", "qualiopi"]
  },
  isActive: true
}
```

### 2. Admin CFA

```js
{
  tenantId: ObjectId("ID_DU_CFA"),
  nom: "Admin",
  prenom: "Principal",
  email: "admin@cfa-demo.fr",
  telephone: "+33611111111",
  motDePasse: "HASH_BCRYPT",
  role: "admin",
  isActive: true,
  emailVerified: true
}
```

### 3. Formation

```js
{
  tenantId: ObjectId("ID_DU_CFA"),
  titre: "Developpeur Web et Web Mobile",
  slug: "developpeur-web-web-mobile",
  codeRNCP: "RNCP37674",
  niveau: "Bac+2",
  dureeHeures: 700,
  objectifs: ["Developper une interface web", "Construire une API", "Deployer une application"],
  isPublished: true,
  isActive: true
}
```

### 4. Cohorte

```js
{
  tenantId: ObjectId("ID_DU_CFA"),
  nom: "DWWM - Septembre 2026",
  formation: "Developpeur Web et Web Mobile",
  annee: 2026,
  dateDebut: ISODate("2026-09-01T08:00:00Z"),
  dateFin: ISODate("2027-06-30T17:00:00Z"),
  capacite: 30,
  statut: "ouverte",
  etudiants: [],
  formateurs: [],
  isActive: true,
  isDeleted: false
}
```

## Regles de securite et conformite

- RGPD: enregistrer consentements, limiter conservation, permettre export/suppression controlee.
- Qualiopi: conserver preuves de presence, evaluations, satisfaction, reclamations, actions correctives.
- SaaS: aucune requete metier sans filtre `tenantId`.
- Mot de passe: bcrypt >= 12 rounds.
- Refresh token: stocker un hash, jamais le token brut.
- Documents: URL securisees, expiration, hash de preuve.
- Audit: journaliser connexion, creation, modification, suppression, publication, generation PDF, signature.
- Backups Atlas: sauvegardes automatiques activees, PITR si plan compatible.

## Priorite d'implementation

1. Renforcer les collections existantes: `users`, `cfas`, `cohortes`, `cours`, `presences`, `documents`, `auditlogs`.
2. Ajouter `formations`, `modules`, `ressources_pedagogiques`, `progressions`.
3. Ajouter `entreprises`, `contrats_apprentissage`, `financements`.
4. Ajouter `evaluations_qualite`, `indicateurs_qualiopi`, `reclamations`.
5. Ajouter `factures`, `paiements`, `abonnements_saas` pour la commercialisation SaaS.
6. Ajouter `sessions_auth`, `signatures`, `webhooks`, `tickets_support` pour la production professionnelle.
