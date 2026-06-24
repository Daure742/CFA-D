# 🚀 Guide de Vérification: Cours Direct & Présences

## ✅ Pre-Flight Checklist

Avant de tester, verifiez:

```
[ ] Backend Node.js running: npm start (port 5000)
[ ] Frontend Vite dev server: npm run dev (port 5173)
[ ] MongoDB Atlas ou local disponible
[ ] Socket.io configured dans .env backend
[ ] Token authentification valide
```

---

## 🧪 Test 1: Détection "Prêt à Démarrer"

### Setup Initial
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd cfa_digital
npm run dev
```

### Étapes
1. ✅ **Login as Formateur**
   - Email: `formateur@gmail.com`
   - Mot de passe: (voir `.env.local`)

2. ✅ **Allez à "Espace Formateur" → "Cours live et presences"**

3. ✅ **Créez un cours de test (Admin)**
   - Navigation: Admin → Planning
   - Title: "Test Cours Direct"
   - Start: TODAY 14:55 (5 min avant NOW)
   - End: TODAY 15:10 (5 min après NOW)
   - Formateur: Select yourself
   - Cohorte: Any active

4. ✅ **Retournez au tableau formateur**
   - Rafraîchissez (F5) si nécessaire
   - Vous devriez voir la badge **"Prêt à démarrer maintenant"** en VERT ÉMERAUDE

### Résultat Attendu
```
✓ Course card affiche: "Prêt à démarrer maintenant" (emerald-100 background)
✓ Timestamp montré: "TODAY 14:55 — 15:10"
✓ Bouton "Cours Direct" en VERT
✓ Bouton "Lancer la session" en BLEU
```

### Dépannage
```
Si badge n'apparaît pas:
  → Vérifier heure serveur: curl http://localhost:5000/api/health
  → Vérifier timezone (.env ou OS)
  → Vérifier dateDebut/dateFin en BD (MongoDB compass)
  → Recharger page complète (Ctrl+Shift+R)
```

---

## 🧪 Test 2: Lancer "Cours Direct" et Voir le Lien

### Étapes

1. ✅ **Formateur: Cliquez "Cours Direct"**
   - Fenêtre statut: "Cours en direct démarré"
   - New browser tab s'ouvre (Google Meet ou Jitsi)

2. ✅ **Vérifier Backend logs:**
   ```
   Backend terminal:
   ✅ [Session lancée] coursController.lancerCours() executer
   ✅ "lienVisio" généré: https://meet.jit.si/xxx-xxx
   ✅ cours.statut = 'en_cours'
   ✅ Socket emit à cohorte_XXX
   ```

3. ✅ **Vérifier le Lien dans le Cours**
   - Back to formateur dashboard
   - Course card devrait maintenant montrer:
     ```
     Lien Google Meet de la session
     https://meet.jit.si/xxx-xxx
     [Cliquable]
     ```

### Résultat Attendu
```
✓ Badge change à "En direct" (indigo-100)
✓ Lien Google Meet/Jitsi s'affiche dans la course
✓ Formateur peut rejoindre la session
✓ Toast success: "Session lancée"
```

### Dépannage
```
Si lien ne s'affiche pas:
  → Vérifier req.response dans browser DevTools → Network
  → Vérifier qu'aucune erreur 500 dans backend logs
  → Vérifier GOOGLE_SERVICE_ACCOUNT_JSON en .env
  
Si lien ouverture échoue:
  → Utiliser lien manual du cours card
  → Vérifier connectivité internet
```

---

## 🧪 Test 3: Broadcast à Étudiants en Temps Réel

### Setup Initial
```
Deux browsers/tabs:
  Tab 1: Formateur connecté (http://localhost:5173)
  Tab 2: Étudiant connecté (autre onglet/session privée)
```

### Étapes

1. ✅ **Tab 2 (Étudiant): Allez à "Mes Cours"**
   - Devrait voir le cours "Test Cours Direct" en statut "Planifié"
   - ❌ PAS de lien visible encore

2. ✅ **Tab 1 (Formateur): Lancez le cours "Cours Direct"**
   - Cliquez le bouton vert "Cours Direct"
   - Backend logs affichent socket emit

3. ✅ **Tab 2 (Étudiant): Regardez SANS RAFRAÎCHIR**
   - Course status change à "En direct"
   - Lien Google Meet/Jitsi apparaît AUTOMATIQUEMENT
   - ✨ Magic: Pas besoin de F5!

### Résultat Attendu
```
✓ Formateur lancements course
✓ Étudiant reçoit update en temps réel (< 1 sec)
✓ Lien devient visible chez étudiant
✓ Étudiant peut cliquer "Rejoindre le cours"
✓ Browser tabs partagent même Google Meet room
```

### Dépannage
```
Si étudiant ne voit pas le lien:
  → Vérifier Socket.io connexion:
     Browser DevTools → Console
     Search: "Socket.io Connected" or "[Socket.io]"
  → Vérifier que étudiants dans la cohorte du cours
  → Vérifier VITE_SOCKET_URL en env
  → Checking backend socket listeners available
```

---

## 🧪 Test 4: Valider Présences

### Setup Initial
```
Cours toujours "en_cours" de Test 3
Plusieurs étudiants inscrits à la cohorte
Au moins un étudiant a cliqué "Rejoindre le cours"
  → Cela crée Presence record avec valideEtudiant: true
```

### Étapes

1. ✅ **Étudiant(s): Cliquez "Rejoindre le cours"**
   - Toast: "Présence enregistrée automatiquement"
   - Presence record créé en BD
   - Browser ouvre Google Meet

2. ✅ **Formateur: Cliquez "Valider presences"**
   - Modal s'ouvre avec liste d'étudiants
   - Affiche:
     ```
     Ali Ahmed (ali@email.com)
     Statut: présent — Validé formateur: Non
     [Valider] [Télécharger attestation (disabled)]
     
     Marie Dupont (marie@email.com)
     Statut: présent — Validé formateur: Non
     [Valider] [Télécharger attestation (disabled)]
     ```

3. ✅ **Formateur: Clique sur "Validate" pour chaque étudiant**
   - OU clique "Valider toutes"
   - Backend: POST /cours/valider-emargement/{coursId}
   - MongoDB: Presence.valideFormateur = true
   - Toast: "Présences validées"

4. ✅ **Modal se ferme automatiquement**

### Résultat Attendu
```
✓ Modal montre tous les étudiants de la cohorte
✓ Checkboxes pour chaque étudiant
✓ "Valider toutes" bulk-updates everyone
✓ Toast confirmation
✓ MongoDB presence.valideFormateur = true
✓ Attestations maintenant téléchargeables par étudiants
```

### Dépannage
```
Si modal ne s'ouvre pas:
  → Vérifier GET /presences/cours/{coursId}
  → Browser DevTools → Network → voir la requête
  
Si "Valider toutes" échoue:
  → Vérifier POST /cours/valider-emargement/{coursId}
  → Vérifier backend logs pour erreur
  → Vérifier que presences exist (courseId + etudiant)
```

---

## 🧪 Test 5: Télécharger Feuille Présence (PDF)

### Étapes

1. ✅ **Formateur: Tableauboard du cours**
   - Visible dans course card: "Feuille PDF"

2. ✅ **Clique "Feuille PDF"**
   - PDF génère: `feuille-presence-{coursId}.pdf`
   - Download déclenchée automatiquement

3. ✅ **Ouvrez le PDF**
   - Devrait afficher:
     ```
     FEUILLE DE PRÉSENCE
     Cours: "Test Cours Direct"
     Date: TODAY
     Formateur: Your name
     
     Tableau:
     | Étudiant | Email | Statut | Validation |
     |----------|-------|--------|-----------|
     | Ali      | ... | Présent | Oui |
     | Marie    | ... | Présent | Oui |
     ```

### Résultat Attendu
```
✓ PDF généré sans erreur
✓ Tous les étudiants listés
✓ Statut présence correct
✓ Colonne validation affiche "Oui" si validé
```

---

## 🧪 Test 6: Terminer le Cours

### Étapes

1. ✅ **Après 10-15 min de session**
   - Formateur: Clique "Terminer le cours"

2. ✅ **Backend actions:**
   ```
   ✓ cours.statut = 'terminé'
   ✓ cours.termineLe = new Date()
   ✓ Calcule duration pour chaque Presence:
     dureeMinutes = (heureFin - heureDebut) / 60000
   ```

3. ✅ **Course Card changes:**
   - Badge: "Terminé"
   - "Lancer" bouton disabled
   - "Terminer" bouton disabled

### Résultat Attendu
```
✓ Course statut change to "terminé"
✓ Étudiants peuvent now download attestations
✓ Duration tracked for compliance
✓ Firebase audit trail shows termination time
```

---

## 📡 Vérification Socket.io

### Dans Browser DevTools → Console

```javascript
// Pour formateur
console.log('Socket events:');
// Devrait voir logs comme:
// [Socket.io] Connecté
// [Socket.io] Authentifié
// [Socket.io] Rejoined cohorte_XXX room
// [Socket.io] Rejoined cours_XXX room

// Pour étudiant
console.log('Course update events:');
// Devrait voir:
// [Socket.io] Cours live démarré: { coursId, titre, lien }
// Et vue updated sans refresh!
```

### Vérifier Audience

```javascript
// Backend terminal pendant test:
// Chercher logs comme:
// [Socket] Destination: cohorte_123abc → 15 clients
// [Socket] Emit: cours-live-start → payload sent
```

---

## 🔒 Test de Sécurité

### Test 1: Accès Interdit (403)

```
Étudiant essaye de lancer un cours:
  → browser.execute(
      fetch('http://localhost:5000/api/cours/lancer/123', 
      {method: 'POST'})
    )
  
Résultat Attendu:
  ✓ 403 Forbidden
  ✓ msg: "Seul le formateur assigné peut lancer ce cours"
```

### Test 2: Cours Inexistant (404)

```
Formateur clique lancer sur ID invalide:
  ✓ 404 Not Found
  ✓ msg: "Cours non trouvé"
```

### Test 3: Multi-tenancy Isolation

```
Si deux CFAs dans BD:
  CFA-1 formateur ne peut pas accéder CFA-2 courses
  
Vérifier:
  ✓ tenantMiddleware filters by req.tenantId
  ✓ GET /formateur/cours only returns CFA-1 courses
```

---

## 📋 Jeu de Données Test Recommandé

### Créer en Admin

```javascript
// Cours de test
{
  titre: "JavaScript Avancé",
  dateDebut: (TODAY 14:55),
  dateFin: (TODAY 15:10),
  matiere: "Frontend",
  formateur: (votre ID),
  cohorte: (any active),
  modal: "distanciel",
  description: "Test Cours Direct workflow"
}

// Étudiants pré-inscrits à cohorte
(Minimum 3 pour voir batch operations)
```

---

## 🎓 Scénario Complet: De bout en bout

```
1. Login as Admin → Create course for tomorrow 14:50-15:10
2. Login as Formateur at 14:55
3. Dashboard shows "Prêt à démarrer maintenant"
4. Click "Cours Direct" ✓ Lien généré, Google Meet ouvre
5. Ouvrir private tab → Login as Étudiant
6. Allez à "Mes Cours" → Voir cours, pas de lien
7. Retour Tab 1 (Formateur) → Lancer cours
8. Watch Tab 2 (Étudiant) → Lien apparaît magiquement! ✨
9. Étudiant clique "Rejoindre le cours"
10. Formateur clique "Valider presences"
11. Modal montre étudiant présent
12. Clique "Valider toutes"
13. Télécharge "Feuille PDF"
14. Clique "Terminer le cours"
15. Étudiants peuvent now télécharger attestations
    → Success! 🎉
```

---

## ⚠️ Points Critiques

| Point | Vérifier | Impact |
|-------|----------|--------|
| **Socket.io URL** | VITE_SOCKET_URL en .env | Étudiants ne reçoivent pas lien |
| **Heure Serveur** | Serveur TZ = Client TZ | Badges "Prêt" ne s'affichent pas |
| **MongoDB Connection** | Presences persist | Validation échoue silencieusement |
| **Token Auth** | JWT valide 24h | 401 unauthorized après expiry |
| **CORS** | Backend allow origin | Socket events bloqués |

---

## 📞 Logs à Vérifier en Cas de Problème

### Backend Logs Critical
```bash
grep -i "lancerCours\|validerEmargement\|socket emit\|error" logs/*.log
```

### Frontend Console Critical
```javascript
// DevTools → Console
console.error() → Capture tous les erreurs
console.warn()  → Capture les avertissements
```

### MongoDB Logs
```bash
# Vérifier présences created/updated
db.presences.find({cours: ObjectId("xxx")}).pretty()

# Vérifier cours statut updated
db.cours.find({_id: ObjectId("xxx")}).pretty()
```

---

## ✅ Checklist Final

```
BEFORE PRODUCTION:
[ ] All tests passed locally
[ ] Socket.io deployed and reachable
[ ] MongoDB Atlas backup enabled
[ ] Email notifications configured
[ ] Google Meet API keys rotated
[ ] Error logs monitored (Sentry/etc)
[ ] Load test with 100+ concurrent formateurs
[ ] Attestation PDF generation tested
[ ] Mobile browser compatibility tested
```

---

**Vous êtes prêt! 🚀 La plateforme formateur est maintenant professionnelle, stable et sans erreurs.**
