# Guide production - inscriptions etudiantes

Ce guide explique le fonctionnement production de l'inscription etudiante.

## 1. Connexion MongoDB

Le backend utilise `MONGO_URI` si la variable existe.

```env
MONGO_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/cfa_digital?retryWrites=true&w=majority
```

Si `MONGO_URI` n'est pas configure ou si Atlas est indisponible, le backend tente MongoDB local:

```env
mongodb://127.0.0.1:27017/cfa_digital
```

## 2. Donnees minimales de production

Ne lancez pas `mongo-atlas-seed-cfa-digital.js` en production. Ce script sert a la demo et aux tests.

En production, configurez au moins:

```env
DEFAULT_TENANT_ID=ID_DU_CFA_PRODUCTION
DEFAULT_CFA_NAME=CFA Principal
DEFAULT_CFA_SIRET=VOTRE_SIRET
DEFAULT_CFA_EMAIL=contact@votre-cfa.fr
DEFAULT_COHORTE_CAPACITY=50
```

Si `DEFAULT_TENANT_ID` n'est pas fourni, le backend utilise le premier CFA actif. Si aucun CFA actif n'existe, il cree un CFA principal minimal pour ne pas bloquer l'inscription.

## 3. Inscription etudiante

La page `/admissions` ne demande plus a l'etudiant de rechercher le CFA ni de saisir un tenant technique.

Flux:

1. L'etudiant choisit sa formation.
2. Le backend prepare automatiquement la session ouverte du mois.
3. Le nom de session suit le format:

```text
Juin 2026 - Developpement web
```

4. L'etudiant cree son compte.
5. Le backend cree le compte, trace la candidature acceptee et rattache l'etudiant a la session.
6. Si la session est complete, l'etudiant est ajoute a la liste d'attente.

## 4. Seed demo

Pour demo/test uniquement:

```bash
mongosh "VOTRE_URI_MONGODB_ATLAS" mongo-atlas-seed-cfa-digital.js
```

Le fichier `scripts/seed.js` est volontairement non destructif et rappelle cette regle.
