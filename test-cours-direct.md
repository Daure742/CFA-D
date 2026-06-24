# Test Checklist: Cours Direct & Presence Validation

## Scenario: Formateur Dashboard - Cours Direct Workflow

### 1. **Formateur Arrives at Dashboard (FormateurClasses.jsx)**
- [ ] Page loads and displays all assigned courses with status badges  
- [ ] Check for **"Prêt à démarrer maintenant"** signal if current time falls within `dateDebut` to `dateFin`  
- [ ] Check for **"Démarre bientôt"** signal if course starts within next 15 minutes  
- [ ] Display Google Meet link (generated or pre-configured) in course card  

### 2. **Global "Cours Direct" Button (Top Navigation)**
- [ ] Button exists in the top bar alongside "Valider Présence" and document sharing  
- [ ] Click → If course is already `en_cours`:  
  - ✅ Opens the Google Meet link in new tab  
  - ✅ Shows toast: "Cours en direct — lien ouvert"  
- [ ] Click → If course is `planifié` but ready (time window active):  
  - ✅ Calls `POST /cours/lancer/{coursId}`  
  - ✅ Sets course `statut = 'en_cours'`  
  - ✅ Generates Jitsi/Google Meet link if missing  
  - ✅ Broadcasts socket event `cours-live-start` to cohort & cours rooms  
  - ✅ Opens link automatically  
  - ✅ Shows toast: "Session lancée"  
- [ ] Click → If no course ready:  
  - ✅ Shows error: "Aucun cours prêt à démarrer à cette heure"  

### 3. **Per-Course "Cours Direct" Button**
- [ ] Display in each course card's action buttons  
- [ ] Shows different labels based on state:  
  - `en_cours` → Label: "Ouvrir Cours Direct"  
  - `planifié` (within time window) → Label: "Cours Direct"  
  - Outside time window → Button disabled/grayed  
- [ ] Click behavior:  
  - If `en_cours`: Opens existing link  
  - If ready to start: Calls `lancerCours()` and opens link  

### 4. **Presence Link Broadcasting to Students**
- [ ] When formateur clicks "Cours Direct" and course launches:  
  - ✅ Backend emits socket to `cohorte_{cohorteId}` and `cours_{coursId}`  
  - ✅ Payload includes: `coursId`, `titre`, `lien` (Google Meet/Jitsi)  
  - ✅ Frontend (EtudiantCours.jsx) receives and updates course card  
  - ✅ Link now displayed and clickable for students  

### 5. **"Valider Présence" Workflow**
- [ ] Global button opens presences for first active course  
- [ ] Per-course "Valider presences" button opens modal with:  
  - ✅ Student name, email, status  
  - ✅ Valid/not-valid toggle checkbox  
  - ✅ "Valider toutes" bulk action button  
- [ ] Backend updates `Presence.valideFormateur = true` and sets `dateValidation`  
- [ ] Presence records persist to MongoDB  

### 6. **End-to-End Flow**
- [ ] Formateur:  
  1. Arrives at dashboard  
  2. Sees course marked "Prêt à démarrer maintenant"  
  3. Clicks "Cours Direct"  
  4. Session launches, link generated/displayed  
  5. Link is broadcast to students in real-time  
  6. Students see updated course card with clickable link  
  7. Formateur clicks "Valider presences"  
  8. Marks students present, validates all, confirms save  
  9. Click "Terminer le cours"  
  10. Course marked `terminé`, students can now download attestations  

## Backend Endpoints Verification

| Endpoint | Method | Role | Status |
|----------|--------|------|--------|
| `/formateur/cours` | GET | formateur/admin | ✅ Returns courses with `lienVisio`, `statut`, dates |
| `/cours/lancer/{coursId}` | POST | formateur/admin | ✅ Generates meet link, broadcasts socket, returns updated course |
| `/cours/valider-emargement/{coursId}` | POST | formateur/admin | ✅ Marks all presences as valid |
| `/presences/cours/{coursId}` | GET | formateur/admin | ✅ Returns presence records for course |
| `/presences/{presenceId}` | PATCH | formateur/admin | ✅ Updates individual presence validation |
| `/cours/terminer/{coursId}` | POST | formateur/admin | ✅ Marks course as terminé, calculates duration |

## Socket Events Verification

| Event | Direction | Audience | Payload |
|-------|-----------|----------|---------|
| `cours-live-start` | Backend → Frontend | `cohorte_` + `cours_` rooms | `{ coursId, titre, lien }` |
| `connexion-cours` | Student → Backend | Socket handler | `coursId` |

## Error Handling Checks

- [ ] Invalid coursId → 404: "Cours non trouvé"  
- [ ] Permission denied (not formateur) → 403: "Seul le formateur assigné..."  
- [ ] Missing tenant → 400-level error  
- [ ] Network timeout → Toast error shown to formateur  
- [ ] Google Meet API down → Fallback to Jitsi automatically  
- [ ] No presences for course → Shows empty list, allows validation anyway  

## Database State After Test

- [ ] `Cours`: `statut` field updated to `en_cours` then `terminé`  
- [ ] `Cours`: `demarreLe` and `termineLe` timestamps recorded  
- [ ] `Presence`: Records created/updated with `valideFormateur: true`, `dateValidation`  
- [ ] `Notification`: Students received cohort-broadcast notification with link  

---

## Result

✅ **PASS** if:
- Formateur can launch "Cours Direct" with a single click
- Google Meet link appears and is broadcast to students in real-time
- "Valider Présence" validates all students without errors
- Backend database reflects all state changes correctly
- All socket broadcasts are received by students simultaneously
