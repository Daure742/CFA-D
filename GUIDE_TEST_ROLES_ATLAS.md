# Guide de test des roles - CFA Digital

Ce guide permet de tester une base MongoDB Atlas demo complete avec les 6 roles:

- `superadmin`
- `admin`
- `formateur`
- `etudiant`
- `tuteur`
- `entreprise`

## 1. Executer le script dans MongoDB Atlas

Ouvrir MongoDB Atlas, puis:

1. Aller dans le cluster.
2. Ouvrir `Browse Collections`.
3. Cliquer sur `Open mongosh`.
4. Coller et executer le contenu du fichier:

```text
mongo-atlas-seed-cfa-digital.js
```

Autre option en local:

```bash
mongosh "VOTRE_URI_MONGODB_ATLAS" mongo-atlas-seed-cfa-digital.js
```

Le script cree la base `cfa_digital`, les index, le CFA demo, les utilisateurs, la formation, la cohorte, le cours, les devoirs, les notes, les presences, les documents, les contrats, la facturation, les indicateurs Qualiopi et les audits.

## 2. Configurer le backend

Dans `backend/.env`, mettre l'URI Atlas:

```env
MONGO_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/cfa_digital?retryWrites=true&w=majority
CLIENT_URL=http://localhost:5173
PORT=5000
JWT_ACCESS_SECRET=change_me_access_secret
JWT_REFRESH_SECRET=change_me_refresh_secret
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
```

Puis lancer:

```bash
cd backend
npm run dev
```

## 3. Lancer le frontend

```bash
cd cfa_digital
npm run dev
```

Ouvrir:

```text
http://localhost:5173/connexion
```

## 4. Tenant ID a utiliser

Dans le champ `ID Tenant (CFA)`, saisir:

```text
665000000000000000000001
```

## 5. Comptes de test

Mot de passe commun:

```text
CfaDemo2026!
```

| Role | Email | Espace attendu |
| --- | --- | --- |
| superadmin | superadmin@cfa-demo.fr | `/superadmin` |
| admin | admin@cfa-demo.fr | `/admin` |
| formateur | formateur@cfa-demo.fr | `/formateur` |
| etudiant | etudiant@cfa-demo.fr | `/etudiant` |
| tuteur | tuteur@cfa-demo.fr | `/tuteur` |
| entreprise | entreprise@cfa-demo.fr | `/entreprise` |

## 6. Parcours de test recommande

### Etudiant

1. Connexion avec `etudiant@cfa-demo.fr`.
2. Verifier la redirection vers `/etudiant`.
3. Ouvrir agenda, cours, devoirs, documents, notes, messages, profil.
4. Verifier que l'etudiant voit sa cohorte `DWWM - Septembre 2026`.

### Formateur

1. Connexion avec `formateur@cfa-demo.fr`.
2. Verifier la redirection vers `/formateur`.
3. Tester classes, devoirs, notes et messages.
4. Le formateur est rattache aux matieres `JavaScript`, `Node.js`, `MongoDB`.

### Admin

1. Connexion avec `admin@cfa-demo.fr`.
2. Verifier la redirection vers `/admin`.
3. Tester cohortes, planning, candidatures, formateurs, finances, rapports.
4. Verifier que la cohorte demo contient un etudiant et un formateur.

### Superadmin

1. Connexion avec `superadmin@cfa-demo.fr`.
2. Verifier la redirection vers `/superadmin`.
3. Controler la logique SaaS: tenants, abonnements, audit, support.

### Tuteur

1. Connexion avec `tuteur@cfa-demo.fr`.
2. Verifier la redirection vers `/tuteur`.
3. Controler le suivi de l'apprenti rattache, les presences et les documents.

### Entreprise

1. Connexion avec `entreprise@cfa-demo.fr`.
2. Verifier la redirection vers `/entreprise`.
3. Controler contrats, tuteurs, financements et factures.

## 7. Verite technique importante

Le script Atlas donne une base riche et coherente. Les espaces `superadmin`, `tuteur` et `entreprise` existent maintenant dans le frontend comme socle de navigation securise.

Pour une production complete, il faut ensuite developper leurs modules metier detailles:

- routes API dediees superadmin;
- routes API tuteur;
- routes API entreprise;
- formulaires CRUD;
- tableaux de bord connectes aux donnees reelles;
- permissions fines par action;
- journalisation automatique dans `auditlogs`.
