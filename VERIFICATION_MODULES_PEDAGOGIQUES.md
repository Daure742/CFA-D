# Verification des modules pedagogiques demandes

Date de verification: 2026-05-28.

## 1. Architecture generale

Statut: placee et partiellement fonctionnelle.

- Multi-CFA: present via `tenantId` dans les modeles backend et les routes securisees.
- Securite: authentification JWT, refresh cookie, middleware role et tenant.
- Roles: `admin`, `formateur`, `etudiant`, `superadmin`, `tuteur`, `entreprise` sont acceptes par le modele `User`.
- Espaces: routes frontend presentes pour les 6 roles.
- Point production a finaliser: hebergement UE, politiques RGPD, sauvegardes Atlas et permissions fines par action.

## 2. Organisation pedagogique

Statut: placee et fonctionnelle pour la base CFA.

- Parcours: collection `formations` prevue et alimentee par le script Atlas.
- Cohortes mensuelles: modele `Cohorte`, routes admin sessions, capacite, statut, publication planning.
- Entrees mensuelles: supportees par `dateDebut`, `dateFin`, `statut`, `capacite`.
- Plusieurs professeurs par classe: champ `formateurs` dans `Cohorte`; chaque cours garde aussi son `formateur`.

## 3. Espace etudiant

Statut: place et connecte aux donnees principales.

- Tableau de bord: route `/etudiant`, page presente.
- Agenda interactif: page `EtudiantAgenda`, API `/api/etudiant/agenda`.
- Cours live/replays: page `EtudiantCours`, API `/api/cours/cohorte/:cohorteId`.
- Groupe de classe/chat: page `EtudiantMessages`, socket et messages classe.
- Assistant pedagogique IA: onglet assistant dans `EtudiantMessages`.
- Devoirs: page maintenant connectee a `/api/devoirs/mes-devoirs`.
- Documents Drive: page maintenant connectee a `/api/documents/mes-documents`.
- Notes/bulletins: page maintenant connectee a `/api/notes/mes-notes` et `/api/notes/mes-bulletins`.
- Notifications plateforme: composant `NotifDropdown` et route `/api/notifications`.
- Notifications mail: infrastructure mailer presente, automatisations a enrichir selon evenements.

## 4. Drive etudiant - documents

Statut: place et connecte.

- Documents centre: supportes par `Document.type` et `destinataire`.
- Documents personnels: supportes par `type: personnel` et `userId`.
- Attestations, certificats, bulletins: types existants dans le modele `Document`.
- Telechargement: lien `url` affiche dans la page etudiant.
- Versioning: champ `version`.
- Acceptation obligatoire: champs `acceptationRequise` et `acceptations`.
- Archivage: champs `archive` et `dateArchivage`.
- Point a finaliser: endpoint POST d'acceptation documentaire avec audit automatique.

## 5. Module devoirs

Statut: place et connecte.

- Publication formateur: route `POST /api/devoirs`.
- Rendu etudiant: route `POST /api/devoirs/rendre/:devoirId`.
- Correction formateur: route `PUT /api/devoirs/corriger/:renduId`.
- Statuts: `à faire`, `rendu`, `corrigé`, `en retard`.
- Page etudiant: connectee a `/api/devoirs/mes-devoirs`.
- Notifications automatiques: modele `Notification` present; creation automatique a ajouter dans `createDevoir` et `corrigerDevoir` pour une production complete.

## Conclusion verite

Les elements demandes sont maintenant correctement places dans l'architecture et les modules etudiants principaux ne sont plus seulement des maquettes: agenda, cours, devoirs, documents, notes et bulletins sont relies a des routes API.

Pour atteindre un niveau production complet, il reste a developper:

- upload reel des fichiers avec Cloudinary ou stockage objet;
- acceptation documentaire avec signature/preuve;
- notifications automatiques sur publication devoir, rendu, correction, document obligatoire;
- tableaux de bord avec donnees 100% dynamiques pour tous les roles;
- permissions fines et auditlogs automatiques sur chaque action sensible.
