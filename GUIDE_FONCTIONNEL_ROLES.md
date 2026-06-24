# Guide fonctionnel des roles - CFA Digital

Ce document decrit comment chaque utilisateur accede a son espace securise et quelles actions il doit pouvoir realiser. Il sert de guide de navigation, de cahier de test et de reference pour rendre la plateforme fonctionnelle, professionnelle et confortable.

## 1. Acces commun a tous les roles

### Demarche de connexion

1. Ouvrir la plateforme.
2. Cliquer sur `Connexion`.
3. Saisir l'email, le mot de passe et l'ID tenant du CFA si le champ est demande.
4. Valider le formulaire.
5. La plateforme verifie le compte, le role, le tenant et l'etat actif du compte.
6. L'utilisateur est redirige automatiquement vers son espace:

| Role | Espace attendu |
| --- | --- |
| Superadmin | `/superadmin` |
| Admin | `/admin` |
| Formateur | `/formateur` |
| Etudiant | `/etudiant` |
| Tuteur | `/tuteur` |
| Entreprise | `/entreprise` |

### Regles professionnelles communes

- Un utilisateur ne doit voir que les donnees autorisees par son role.
- Chaque tableau de bord doit afficher les priorites du jour: cours, devoirs, messages, alertes, documents ou validations.
- Chaque bloc de statistique doit etre cliquable ou accompagne d'un bouton clair pour rejoindre l'action correspondante.
- Chaque action importante doit produire un retour visible: succes, erreur, chargement, vide, acces refuse.
- Les donnees sensibles doivent etre journalisees: connexion, creation, modification, suppression, validation, export.

## 2. Espace etudiant

### Objectif

L'etudiant doit retrouver rapidement ses cours, devoirs, messages, notes, documents, agenda et informations personnelles. Son tableau de bord doit l'aider a savoir quoi faire maintenant.

### Acces

1. Se connecter avec un compte `etudiant`.
2. Arriver sur `/etudiant`.
3. Voir le tableau de bord:
   - `Cours actifs`
   - `Devoirs a rendre`
   - `Messages non lus`
   - planning de la semaine
   - dernieres notifications
   - progression pedagogique
   - documents recents

### Actions attendues depuis le tableau de bord

| Element clique | Redirection/action attendue | Resultat professionnel attendu |
| --- | --- | --- |
| `Cours actifs` | Aller vers `/etudiant/cours` | Liste des cours de la cohorte, live, replay, cours a venir |
| `Devoirs a rendre` | Aller vers `/etudiant/devoirs` | Liste des devoirs, dates limites, statut, depot, correction |
| `Messages non lus` | Aller vers `/etudiant/messages` | Chat de classe et assistant pedagogique |
| `Planning de la semaine` | Aller vers `/etudiant/agenda` | Agenda filtre par semaine |
| `Documents recents` | Aller vers `/etudiant/documents` | Documents disponibles et telechargeables |
| `Progression pedagogique` | Aller vers `/etudiant/notes` | Notes, moyennes, evaluations et commentaires |

### Parcours cours

1. Cliquer sur `Cours actifs` ou ouvrir `/etudiant/cours`.
2. La page affiche les statistiques: total, live, replay, a venir.
3. L'etudiant consulte chaque cours: titre, date, horaire, matiere, formateur, modalite, salle, description.
4. Si le bouton `Rejoindre le cours` existe:
   - cliquer dessus;
   - la presence est enregistree automatiquement;
   - la connexion socket rejoint le cours;
   - la visio s'ouvre dans un nouvel onglet.
5. Si le bouton `Voir le replay` existe:
   - cliquer dessus;
   - le replay s'ouvre dans un nouvel onglet.
6. Si aucun cours n'existe, afficher un message clair: aucun cours disponible pour le moment.
7. Si la cohorte manque, afficher: contactez l'administration du CFA.

### Parcours devoirs

1. Cliquer sur `Devoirs a rendre` ou ouvrir `/etudiant/devoirs`.
2. Voir les compteurs: a faire, deposes, corriges, en retard.
3. Ouvrir un devoir pour lire le titre, la consigne, la matiere, le formateur et la date limite.
4. Si le devoir n'est pas encore rendu, l'etudiant doit pouvoir deposer son fichier ou sa reponse.
5. Apres depot, le statut devient `Rendu` ou `En retard` selon la date.
6. Apres correction, l'etudiant voit la note, le commentaire et le statut corrige.
7. La plateforme doit bloquer les depots non conformes: fichier trop lourd, format interdit, devoir ferme.

### Parcours messages

1. Cliquer sur `Messages non lus` ou ouvrir `/etudiant/messages`.
2. Choisir l'onglet `Classe` pour echanger avec la cohorte.
3. Ecrire un message puis cliquer sur `Envoyer`.
4. Le message apparait dans le fil en temps reel.
5. Choisir l'onglet `Assistant IA` pour poser une question pedagogique.
6. L'assistant repond sur les cours, devoirs, examens, replay ou progression.
7. Les messages doivent afficher l'auteur, l'heure, l'etat lu/non lu et rester accessibles dans l'historique.

### Parcours notes, documents, profil

- Notes: consulter evaluations, moyennes, commentaires, bulletins et progression.
- Documents: consulter, filtrer, telecharger et signer si necessaire.
- Profil: verifier les informations personnelles, modifier les donnees autorisees et demander une correction administrative.

## 3. Espace formateur

### Objectif

Le formateur doit gerer ses classes, lancer ses cours, valider les presences, publier des replays, creer des devoirs, corriger les rendus, saisir les notes et communiquer.

### Acces

1. Se connecter avec un compte `formateur`.
2. Arriver sur `/formateur`.
3. Voir le tableau de bord:
   - classes
   - copies a corriger
   - messages
   - planning pedagogique

### Actions attendues

| Element clique | Redirection/action attendue | Resultat professionnel attendu |
| --- | --- | --- |
| `Classes` | `/formateur/classes` | Cours assignes, lancement live, presences, replay, feuille PDF |
| `Copies` | `/formateur/devoirs` | Copies a corriger, retards, publication de corrections |
| `Messages` | `/formateur/messages` | Conversations avec apprenants et administration |
| `Notes` | `/formateur/notes` | Saisie, validation et publication des notes |

### Parcours classes et cours live

1. Ouvrir `/formateur/classes`.
2. Voir les cours assignes, les cours en direct et les replays publies.
3. Cliquer sur `Lancer la session` pour passer le cours en direct.
4. Ouvrir la classe virtuelle si un lien visio existe.
5. Cliquer sur `Valider presences` pour confirmer l'emargement.
6. Ajouter le lien replay apres le cours.
7. Cliquer sur `Terminer + replay` pour terminer la session et publier le replay.
8. Cliquer sur `Feuille PDF` pour exporter la feuille de presence.

### Parcours devoirs et corrections

1. Ouvrir `/formateur/devoirs`.
2. Creer un devoir: titre, matiere, cohorte, consigne, date limite, pieces jointes.
3. Publier le devoir aux etudiants concernes.
4. Suivre les rendus: rendu, en retard, non rendu.
5. Ouvrir une copie, ajouter note et commentaire.
6. Publier la correction.
7. Les etudiants doivent voir la note et le commentaire dans leur espace.

### Parcours notes

1. Ouvrir `/formateur/notes`.
2. Choisir une classe, une matiere et une periode.
3. Saisir les notes et coefficients.
4. Ajouter un commentaire si necessaire.
5. Valider puis publier.
6. Les notes publiees doivent alimenter les bulletins et statistiques.

### Parcours messages

1. Ouvrir `/formateur/messages`.
2. Choisir une classe, un etudiant ou l'administration.
3. Envoyer une annonce ou un message individuel.
4. Suivre les reponses et les messages non lus.

## 4. Espace administrateur CFA

### Objectif

L'administrateur gere le fonctionnement quotidien du CFA: etudiants, formateurs, cohortes, candidatures, planning, finances, rapports et alertes.

### Acces

1. Se connecter avec un compte `admin`.
2. Arriver sur `/admin`.
3. Voir les indicateurs: etudiants, candidatures, cohortes, alertes administratives.

### Actions attendues

| Module | Chemin | Actions principales |
| --- | --- | --- |
| Etudiants | `/admin/etudiants` | Creer, consulter, filtrer, modifier, desactiver, verifier documents |
| Formateurs | `/admin/formateurs` | Ajouter formateur, affecter matieres, rattacher cohortes |
| Cohortes | `/admin/cohortes` | Creer session, affecter etudiants et formateurs |
| Listes d'attente | `/admin/waitlists` | Gerer demandes, priorites, admissions |
| Planning | `/admin/planning` | Creer sessions, ajouter cours, affecter formateurs, publier |
| Finances | `/admin/finances` | Suivre factures, financements, OPCO, paiements |
| Candidatures | `/admin/candidatures` | Traiter dossiers, pieces manquantes, entretiens, decisions |
| Rapports | `/admin/rapports` | Exporter indicateurs, presences, resultats, Qualiopi |

### Parcours planning professionnel

1. Ouvrir `/admin/planning`.
2. Creer une nouvelle session: nom, formation, annee, capacite, dates.
3. Selectionner la session de travail.
4. Ajouter un cours: titre, matiere, dates, formateur, modalite, salle, lien visio, replay, description.
5. Verifier la liste des cours de la session.
6. Cliquer sur `Publier vers etudiants`.
7. Les cours deviennent visibles dans l'espace etudiant.
8. Les formateurs voient les sessions dans leur espace classes.

### Parcours candidature

1. Ouvrir `/admin/candidatures`.
2. Consulter les nouveaux dossiers.
3. Verifier les pieces manquantes.
4. Planifier ou noter un entretien.
5. Prendre une decision: acceptee, refusee, en attente, a completer.
6. En cas d'acceptation, rattacher le candidat a une cohorte.
7. Creer ou activer son compte etudiant.

### Parcours gestion etudiant

1. Ouvrir `/admin/etudiants`.
2. Rechercher par nom, cohorte, statut ou document manquant.
3. Ouvrir le dossier.
4. Verifier identite, contacts, cohorte, documents, presences, notes et contrat.
5. Corriger les informations autorisees.
6. Desactiver le compte si necessaire, sans supprimer les donnees historiques.

## 5. Espace superadmin

### Objectif

Le superadmin pilote la plateforme SaaS globale: CFA clients, tenants, abonnements, securite, support et audit.

### Acces

1. Se connecter avec un compte `superadmin`.
2. Arriver sur `/superadmin`.
3. Voir les CFA actifs, abonnements et alertes securite.

### Actions attendues

- Creer un tenant CFA.
- Activer ou suspendre un CFA.
- Gerer les abonnements et limites d'usage.
- Consulter l'audit global.
- Suivre les incidents de securite.
- Acceder au support plateforme.
- Ne jamais acceder aux donnees pedagogiques d'un CFA sans trace d'audit et motif legitime.

## 6. Espace tuteur

### Objectif

Le tuteur suit les apprentis rattaches a son entreprise: presence, progression, documents, retards et echanges avec le CFA.

### Acces

1. Se connecter avec un compte `tuteur`.
2. Arriver sur `/tuteur`.
3. Voir les apprentis suivis, presences a valider et documents.

### Actions attendues

- Consulter la fiche de l'apprenti.
- Voir planning, presence, retards et progression.
- Valider les periodes en entreprise.
- Consulter ou deposer des documents entreprise.
- Echanger avec le CFA et l'apprenti.
- Signaler une alerte: absence, difficulte, rupture, besoin d'accompagnement.

## 7. Espace entreprise

### Objectif

L'entreprise gere ses contrats, tuteurs, apprentis, financements, factures et communications avec le CFA.

### Acces

1. Se connecter avec un compte `entreprise`.
2. Arriver sur `/entreprise`.
3. Voir contrats actifs, tuteurs et factures.

### Actions attendues

- Consulter les apprentis rattaches.
- Gerer les tuteurs de l'entreprise.
- Consulter les contrats d'apprentissage.
- Suivre financements OPCO et factures.
- Deposer documents administratifs.
- Echanger avec le CFA.
- Recevoir alertes sur contrats, absences, documents et factures.

## 8. Boutons et interactions indispensables

Pour que la plateforme soit vivante et confortable, chaque module doit offrir des actions directes.

| Contexte | Bouton attendu | Effet attendu |
| --- | --- | --- |
| Tableau de bord etudiant | `Voir mes cours` | Ouvre `/etudiant/cours` |
| Cours en direct | `Rejoindre le cours` | Emargement automatique + ouverture visio |
| Cours termine | `Voir le replay` | Ouvre le replay |
| Devoir a faire | `Deposer mon devoir` | Upload ou saisie de reponse |
| Devoir corrige | `Voir la correction` | Affiche note et commentaire |
| Message non lu | `Lire les messages` | Ouvre la messagerie |
| Formateur cours | `Lancer la session` | Passe le cours en direct |
| Formateur presences | `Valider presences` | Confirme l'emargement |
| Formateur fin cours | `Terminer + replay` | Termine et publie le replay |
| Admin planning | `Publier vers etudiants` | Rend le planning visible |
| Admin candidature | `Valider admission` | Cree/rattache l'etudiant |
| Tuteur presence | `Valider presence entreprise` | Confirme la periode entreprise |
| Entreprise facture | `Voir facture` | Ouvre le detail ou l'export |

## 9. Etats d'ecran obligatoires

Chaque page doit gerer proprement:

- chargement;
- aucune donnee;
- erreur API;
- acces refuse;
- action en cours;
- succes;
- donnees incompletes;
- confirmation avant action sensible;
- affichage responsive mobile et desktop.

## 10. Priorites pour une plateforme au niveau professionnel

### Priorite 1 - Navigation et actions

- Rendre les blocs du tableau de bord cliquables.
- Ajouter des boutons d'action visibles sur chaque carte importante.
- Ajouter une navigation laterale ou des onglets par role.
- Uniformiser les titres, statuts, badges et messages.

### Priorite 2 - Donnees reelles

- Connecter tous les modules aux routes API.
- Remplacer les compteurs fixes par des compteurs calcules.
- Ajouter les filtres: periode, cohorte, statut, matiere, urgence.
- Ajouter pagination et recherche.

### Priorite 3 - Metier complet

- Depot de devoir cote etudiant.
- Creation/correction complete cote formateur.
- Gestion complete des candidatures.
- Gestion complete des documents et signatures.
- Modules detailles pour superadmin, tuteur et entreprise.

### Priorite 4 - Securite et qualite

- Permissions fines par role et par action.
- Journal d'audit.
- Validation backend stricte.
- Protection fichiers.
- Sauvegardes et supervision.
- Exports PDF/CSV propres.

## 11. Scenario de test complet

1. L'admin cree une session et ajoute des cours.
2. L'admin publie le planning.
3. L'etudiant voit les cours dans `/etudiant/cours`.
4. Le formateur lance une session.
5. L'etudiant clique sur `Rejoindre le cours`.
6. La presence est enregistree.
7. Le formateur valide les presences.
8. Le formateur termine le cours et ajoute le replay.
9. L'etudiant voit le replay.
10. Le formateur publie un devoir.
11. L'etudiant depose le devoir.
12. Le formateur corrige et publie la note.
13. L'etudiant voit sa note.
14. L'admin consulte rapports, presences et progression.
15. Le tuteur suit l'apprenti.
16. L'entreprise consulte contrat, factures et documents.

## 12. Verite fonctionnelle actuelle

La plateforme possede deja les espaces securises et plusieurs modules concrets, notamment:

- routes protegees par role;
- espace etudiant avec cours, devoirs et messages connectes;
- cours live avec emargement et replay;
- espace formateur avec gestion des sessions, presences et feuille PDF;
- espace admin avec planning, creation de sessions, creation de cours et publication vers etudiants;
- socles superadmin, tuteur et entreprise.

Pour atteindre une plateforme completement professionnelle, il faut encore transformer les modules socles en CRUD complets, rendre les tableaux de bord entierement cliquables et connecter tous les compteurs aux donnees reelles.
