Prompt maître — Création d'un livre à partir de documents fournis

Contexte et objectif
- Contexte : vous disposez d'un projet fonctionnel nommé "CFA Digital" (frontend React, backend Node.js/Express, base de données MongoDB) et d'un ensemble de documents techniques et fonctionnels (ex. la section PARTIE III fournie ci‑dessous).
- Objectif : à partir du contenu placé entre triple crochets `[[[ ... ]]]`, générer un livre technique et pédagogique complet, ciblé pour développeurs et formateurs, qui explique la conception, l'installation, le développement et la présentation d'une application web basée sur le projet "CFA Digital".
- Contraintes impératives : utiliser le projet comme pilier et source d'exemples; ne pas modifier ni exécuter le projet; indiquer quand des extraits sont supposés (si code non présent dans les documents fournis).

Consignes générales au modèle (ton, véracité, forme)
- Ton : humain, pédagogique, professionnel, accessible — adapter la langue selon le public (débutant -> plus d'explications; avancé -> focus sur bonnes pratiques et optimisation).
- Vérité / transparence : signaler les hypothèses et les zones d'incertitude; citer les fichiers du projet utilisés comme référence; ne pas inventer l'existence de fichiers ou de scripts non fournis.
- Format de sortie principal : Markdown structuré (chapitres, sous-chapitres, code en blocs, commandes en terminal), plus fichiers annexes séparés (ex. README, scripts, diagrammes en mermaid si demandé).
- Longueur attendue : produire un sommaire complet puis développer chaque chapitre — indiquer pour chaque chapitre une fourchette de mots (ex. 1200–3000 mots selon complexité).

Instructions détaillées
1) Entrée (COMMENT FOURNIR LES DOCUMENTS)
- L'utilisateur placera les documents à partir desquels écrire entre triple crochets, par ex.:
  [[[ 
  PARTIE III : RÉALISATION
  Chapitre 6 : Mise en place de l’environnement de développement
  ...
  ]]]
- Traiter uniquement le contenu entre les crochets pour la génération du livre; utiliser le projet "CFA Digital" comme source d'exemples concrets (ex. chemins de fichiers, extraits de code) quand possible.

2) Résultat attendu (livre)
- Générer :
  a) Une table des matières (TOC) détaillée.
  b) Les chapitres développés conformément à la PARTIE III fournie, enrichis d'exemples pratiques tirés du projet (sans modifier le projet).
  c) Des encadrés « Exemples depuis le projet » qui indiquent exactement quels fichiers du projet servent d'illustration (chemin relatif + bref extrait si disponible dans les documents). Si le fichier n'est pas dans les documents fournis, l'indiquer comme "exemple suggéré".
  d) Des sections "Commandes pas à pas" pour Windows (CMD/PowerShell), Ubuntu/WSL et macOS si pertinent.
  e) Des annexes : scripts Docker d'exemple (Dockerfile, docker-compose.yml), configuration VS Code recommandée, checklist de déploiement, exercices pratiques et corrigés, ressources supplémentaires.

3) Mapping obligatoire du contenu PARTIE III → chapitres détaillés
- Chapitre 6 : Détailler l'installation et configuration des outils (Git, Node.js, Docker, choix Windows vs WSL vs Ubuntu). Fournir commandes, vérifications et exemples de Docker pour Node.js + MongoDB.
- Chapitre 6.2 : Lister les extensions VS Code recommandées, config ESLint/Prettier minimale, snippets utiles pour React et Node.
- Chapitre 6.3 : Expliquer l'architecture 3-tiers (React frontend, Express backend, MongoDB) et fournir un schéma mermaid. Relier chaque couche aux dossiers du projet (ex. frontend → cfa_digital/src, backend → backend/).
- Chapitre 7 : Développement concret
  - 7.1 Création de la base : expliquer modélisation (MongoDB schemas), montrer comment migrer/seed la BD (scripts/seed.js, mongo-atlas-seed-cfa-digital.js) et proposer alternatives (Mongoose vs raw MongoDB).
  - 7.2 Codage : exemples concrets pour React (useState/useEffect, fetch vers /api/*), pour Express (définition d'une route /api/users, middleware JWT). Inclure patterns de sécurité et tests unitaires de base; proposer un exemple de route dans backend/routes et le contrôleur dans backend/controllers.
  - 7.3 Présentation : user stories, suggestions pour captures/GIFs, intégration OAuth, formulaire avec validation React Hook Form.

4) Exigences de qualité du contenu
- Fournir code fonctionnel minimal dans les blocs d'exemple. Chaque bloc doit être accompagné d'une explication brève (1–3 phrases).
- Indiquer où adapter les commandes selon l'OS.
- Proposer des étapes de vérification (tests manuels et automatisés) après chaque partie importante.

5) Prompts secondaires / workflows LLM
- Prompt principal (à copier-coller) :
  "Tu es un expert en développement web et en pédagogie technique. À partir du contenu placé entre [[[ et ]]] et en t'appuyant sur le projet 'CFA Digital' fourni en contexte (structure : frontend React dans cfa_digital/, backend Node.js dans backend/, DB MongoDB), rédige un livre technique en français : table des matières, chapitres complets, encadrés pratiques, scripts et annexes. Respecte les contraintes suivantes : n'exécute et ne modifie pas le projet; indique précisément les fichiers du projet utilisés comme exemples; signale toutes les hypothèses; fournis commandes pour Windows/WSL et Ubuntu. Commence par proposer un sommaire détaillé (TOC) puis développe chapitre par chapitre. Pour les exemples de code, écris des blocs prêts à être copiés et explique-les."
- Prompt d'extraction d'exemples depuis le repo :
  "À partir de la structure du projet fournie par l'utilisateur (liste de fichiers), identifie 10 extraits significatifs (frontend, backend, config, scripts) utiles pour illustrer chaque chapitre. Pour chaque extrait, fournis : chemin, courte description, et un petit extrait de code commenté (max 30 lignes). Si un fichier n'existe pas, propose un exemple hypothétique compatible avec la structure du projet."
- Prompt de création d'annexes (Docker, VSCode, CI) :
  "Génère un `docker-compose.yml` et un `Dockerfile` pour containeriser le backend Node.js et une instance MongoDB de développement, plus un fichier `.devcontainer.json` et une configuration VS Code (settings.json) minimale pour le projet." 

6) Exemples concrets demandés au model (pour PARTIE III)
- Docker compose example: Node + MongoDB + (optionnel) Mongo Express.
- VS Code settings: ESLint, format on save, recommandation d'extensions.
- Exemple de route Express: GET /api/users + middleware d'auth.
- Exemple React: page de login avec React Hook Form + fetch POST pour /api/auth/login.

7) Livrables et format de remise
- Fichier principal: `book.md` (chapitres complets en Markdown).
- Annexes séparées: `docker-compose.yml`, `Dockerfile`, `vscode-settings.json`, `exercises.md`, `answers.md`.
- Checklist finale: étapes pour déployer en local et vérifier le bon fonctionnement.

8) Contrôles qualité et vérification
- Avant livraison, demander : "Souhaitez-vous un niveau débutant, intermédiaire ou avancé ?" pour adapter détails.
- Toujours lister les hypothèses (ex. versions Node/Mongo, accès à Mongo Atlas).
- Proposer un plan de tests manuels et automatisés pour valider les chapitres pratiques.

9) Exemple d'invite complète (prête à coller)
- Remplacez le placeholder `{{DOCUMENTS}}` par le bloc entre triple crochets fourni par l'utilisateur :

"Tu es un rédacteur technique expert. En te basant uniquement sur le contenu suivant et sur la structure du projet 'CFA Digital' (ne modifie pas le projet), rédige un livre complet en français. Contenu source : {{{{DOCUMENTS}}}}. Livrables : `book.md`, `docker-compose.yml`, `vscode-settings.json`, `exercises.md`, `answers.md`. Respecte les consignes détaillées ci‑dessus (ton humain, signaler hypothèses, liens aux fichiers du projet, commandes Windows/WSL/Ubuntu). Commence par proposer une table des matières détaillée, puis développe chaque chapitre."

10) Rappels et avertissements pour l'usage
- Ne pas exécuter de scripts nor modifier le dépôt — le projet est seulement une source d'exemples.
- Vérifier systématiquement l'existence des fichiers cités; si absent, marquer comme "exemple suggéré".
- Demander des clarifications si des informations indispensables manquent (ex. version Node.js souhaitée, public cible précis).

---
Annexe : modèle de checklist rapide (à inclure dans le livre)
- Pré-requis : Node >= 14, npm/yarn, Git, Docker (optionnel).
- Cloner le repo, installer dépendances backend et frontend.
- Lancer la base de données (docker-compose ou local).
- Lancer backend (`cd backend && npm install && npm run dev`).
- Lancer frontend (`cd cfa_digital && npm install && npm run dev`).
- Vérifier endpoints principaux (/api/auth, /api/users, /api/cohortes).


Fin du document‑prompt. Utiliser ce fichier comme modèle de travail et affiner selon les retours de l'utilisateur.