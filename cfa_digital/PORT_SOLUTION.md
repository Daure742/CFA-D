# 🚀 SOLUTIONS POUR DÉMARRER LE FRONTEND

## ❌ PROBLÈME
```
Error: Port 5173 is already in use
```

Le port 5173 est déjà utilisé par un processus précédent.

---

## ✅ SOLUTION 1: Utiliser le Lanceur Automatique (Recommandé)

### Commande Unique
```powershell
node start.js
```

**Cet script fait tout automatiquement:**
1. ✅ Nettoie le cache
2. ✅ Libère le port 5173
3. ✅ Installe les dépendances
4. ✅ Démarre Vite

**Puis ouvrez dans le navigateur:**
```
http://localhost:5173/
```

---

## ✅ SOLUTION 2: Libérer le Port Manuellement

### Étape 1: Libérer le port
```powershell
node kill-port.js
```

### Étape 2: Nettoyer
```powershell
node clean-cache.js
```

### Étape 3: Démarrer
```powershell
npm install && npm run dev
```

### Étape 4: Ouvrir
```
http://localhost:5173/
```

---

## ✅ SOLUTION 3: Utiliser un Port Différent

Si vous ne voulez pas tuer le processus:

```powershell
npm run dev -- --port 5174
```

Puis ouvrez:
```
http://localhost:5174/
```

---

## ✅ SOLUTION 4: Commande Windows Manuelle

Si les scripts ne fonctionnent pas:

### Trouver le processus
```powershell
netstat -ano | findstr :5173
```

### Résultat exemple
```
TCP    127.0.0.1:5173    0.0.0.0:0    LISTENING    12345
```

### Tuer le processus (remplacer 12345 par le PID)
```powershell
taskkill /PID 12345 /F
```

### Puis démarrer
```powershell
npm run dev
```

---

## 🎯 PROCÉDURE RECOMMANDÉE

```powershell
# Tout en une commande!
node start.js
```

**C'est tout!** Le script fait:
- Nettoyage
- Libération du port
- Installation
- Démarrage automatique

Puis ouvrez http://localhost:5173/ 🎉

---

## 📋 Résumé des Scripts Disponibles

| Script | Fonction | Commande |
|--------|----------|----------|
| `start.js` | ⭐ Lanceur complet (RECOMMANDÉ) | `node start.js` |
| `kill-port.js` | Libère le port 5173 | `node kill-port.js` |
| `clean-cache.js` | Nettoie le cache | `node clean-cache.js` |
| `.npmrc` | Config npm (voir ci-dessous) | Auto |

---

## 🔧 Alternative: Modifier package.json

Si vous voulez que `npm run dev` gère le port automatiquement:

### Éditer `package.json`

Remplacer:
```json
"dev": "vite"
```

Par:
```json
"dev": "vite --port 5173 --host 0.0.0.0"
```

Ou créer un nouveau script:
```json
"dev": "vite",
"dev:auto": "vite --port 5173 --port 5174 --port 5175"
```

---

## 🆘 Si Rien Ne Fonctionne

### Option 1: Redémarrer
```powershell
# Fermer tous les processus Node
taskkill /F /IM node.exe

# Puis relancer
node start.js
```

### Option 2: Port Différent
```powershell
npm run dev -- --port 5180
```

### Option 3: Redémarrer Windows
Si tout échoue, le redémarrage est la solution finale.

---

## ✨ Résultat Final Attendu

Une fois que vous lancez `node start.js` ou `npm run dev`:

**Terminal:**
```
  VITE v8.0.13  ready in 659 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

**Navigateur (http://localhost:5173/):**
```
┌─────────────────────────────────────────┐
│  🎓 CFA DIGITAL                    🏠  │
├─────────────────────────────────────────┤
│                                         │
│  Bienvenue sur CFA Digital              │
│  Plateforme de Gestion Éducative        │
│                                         │
│  [Connexion] [Inscription]              │
│                                         │
│  FAQ Section avec accordéons            │
│  Appel à l'Action (CTA)                 │
│                                         │
├─────────────────────────────────────────┤
│  © 2024 CFA Digital - Tous droits       │
└─────────────────────────────────────────┘
```

✅ **Interface visible** ✅ **Complète** ✅ **Fonctionnelle**

---

## 🎊 PRÊT?

```powershell
node start.js
```

Puis visitez http://localhost:5173/ 🚀
