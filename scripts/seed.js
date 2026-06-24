#!/usr/bin/env node

console.log(`
CFA Digital - seed

Ce fichier est volontairement non destructif.

Pour une base de demonstration uniquement:
  mongosh "VOTRE_URI_MONGODB_ATLAS" mongo-atlas-seed-cfa-digital.js

Ne lancez pas mongo-atlas-seed-cfa-digital.js en production:
  - il nettoie les donnees demo du tenant demo;
  - il cree des comptes et mots de passe de demonstration;
  - il sert aux tests, pas aux vraies inscriptions.

En production, l'inscription etudiante cree automatiquement:
  - le compte etudiant;
  - la candidature tracee;
  - la session mensuelle ouverte si elle n'existe pas;
  - le rattachement a la formation choisie.
`);
