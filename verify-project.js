#!/usr/bin/env node

/**
 * 🔍 Script de Vérification Complète - CFA Digital Platform
 * 
 * Ce script vérifie que tous les fichiers essentiels existent,
 * que les configurations sont correctes, et que l'application 
 * peut démarer sans erreurs.
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ️${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.cyan}=== ${msg} ===${colors.reset}`),
};

const checkFileExists = (filePath, description) => {
  if (fs.existsSync(filePath)) {
    log.success(`${description}: ${filePath}`);
    return true;
  } else {
    log.error(`${description}: ${filePath} NOT FOUND`);
    return false;
  }
};

const checkDirExists = (dirPath, description) => {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    log.success(`${description}: ${dirPath}`);
    return true;
  } else {
    log.error(`${description}: ${dirPath} NOT FOUND`);
    return false;
  }
};

const readFileContent = (filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
};

const checkEnvVariable = (filePath, variable, description) => {
  const content = readFileContent(filePath);
  if (content && content.includes(variable)) {
    log.success(`${description}: ${variable} trouvé`);
    return true;
  } else {
    log.warning(`${description}: ${variable} manquant`);
    return false;
  }
};

let passCount = 0;
let failCount = 0;
let warnCount = 0;

// ============================================
// 🔍 VÉRIFICATION COMPLÈTE
// ============================================

console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
console.log(`${colors.cyan}  🔍 CFA Digital Platform - Vérification Complète${colors.reset}`);
console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);

// Check Backend Files
log.header('1. Fichiers Backend');
if (checkDirExists('./backend', 'Dossier backend')) passCount++; else failCount++;
if (checkFileExists('./backend/package.json', 'Backend package.json')) passCount++; else failCount++;
if (checkFileExists('./backend/server.js', 'Backend server.js')) passCount++; else failCount++;
if (checkFileExists('./backend/app.js', 'Backend app.js')) passCount++; else failCount++;
if (checkFileExists('./backend/.env', 'Backend .env')) passCount++; else failCount++;

// Check Backend Dependencies
log.header('2. Dépendances Backend');
const backendPkg = readFileContent('./backend/package.json');
if (backendPkg && backendPkg.includes('express')) { log.success('Express trouvé'); passCount++; } else { log.error('Express manquant'); failCount++; }
if (backendPkg && backendPkg.includes('mongoose')) { log.success('Mongoose trouvé'); passCount++; } else { log.error('Mongoose manquant'); failCount++; }
if (backendPkg && backendPkg.includes('socket.io')) { log.success('Socket.io trouvé'); passCount++; } else { log.error('Socket.io manquant'); failCount++; }

// Check Backend Configuration
log.header('3. Configuration Backend');
if (checkEnvVariable('./backend/.env', 'PORT=5000', 'Port backend')) passCount++; else warnCount++;
if (checkEnvVariable('./backend/.env', 'CLIENT_URL=', 'CLIENT_URL')) passCount++; else failCount++;
if (checkEnvVariable('./backend/.env', 'MONGO_URI=', 'MONGO_URI')) passCount++; else failCount++;
if (checkEnvVariable('./backend/.env', 'JWT_ACCESS_SECRET=', 'JWT_ACCESS_SECRET')) passCount++; else failCount++;

// Check Frontend Files
log.header('4. Fichiers Frontend');
if (checkDirExists('./cfa_digital', 'Dossier cfa_digital')) passCount++; else failCount++;
if (checkFileExists('./cfa_digital/package.json', 'Frontend package.json')) passCount++; else failCount++;
if (checkFileExists('./cfa_digital/index.html', 'Frontend index.html')) passCount++; else failCount++;
if (checkFileExists('./cfa_digital/vite.config.js', 'Frontend vite.config.js')) passCount++; else failCount++;
if (checkFileExists('./cfa_digital/.env.local', 'Frontend .env.local')) passCount++; else failCount++;

// Check Frontend Dependencies
log.header('5. Dépendances Frontend');
const frontendPkg = readFileContent('./cfa_digital/package.json');
if (frontendPkg && frontendPkg.includes('react')) { log.success('React trouvé'); passCount++; } else { log.error('React manquant'); failCount++; }
if (frontendPkg && frontendPkg.includes('react-router')) { log.success('React Router trouvé'); passCount++; } else { log.error('React Router manquant'); failCount++; }
if (frontendPkg && frontendPkg.includes('tailwindcss')) { log.success('TailwindCSS trouvé'); passCount++; } else { log.error('TailwindCSS manquant'); failCount++; }
if (frontendPkg && frontendPkg.includes('axios')) { log.success('Axios trouvé'); passCount++; } else { log.error('Axios manquant'); failCount++; }

// Check Frontend Configuration
log.header('6. Configuration Frontend');
if (checkEnvVariable('./cfa_digital/.env.local', 'VITE_API_URL=', 'VITE_API_URL')) passCount++; else failCount++;
if (checkEnvVariable('./cfa_digital/.env.local', 'VITE_SOCKET_URL=', 'VITE_SOCKET_URL')) passCount++; else warnCount++;

// Check Frontend Pages
log.header('7. Pages Frontend');
const pages = [
  './cfa_digital/src/pages/public/HomePage.jsx',
  './cfa_digital/src/pages/public/LoginPage.jsx',
  './cfa_digital/src/pages/public/AdmissionsPage.jsx',
  './cfa_digital/src/pages/public/FormationsPage.jsx',
  './cfa_digital/src/pages/etudiant/EtudiantDashboard.jsx',
  './cfa_digital/src/pages/admin/AdminDashboard.jsx',
];
pages.forEach(p => {
  if (checkFileExists(p, `Page: ${path.basename(p)}`)) passCount++; else failCount++;
});

// Check Core Components
log.header('8. Composants Frontend');
const components = [
  './cfa_digital/src/components/Navbar.jsx',
  './cfa_digital/src/components/Footer.jsx',
  './cfa_digital/src/App.jsx',
  './cfa_digital/src/main.jsx',
];
components.forEach(c => {
  if (checkFileExists(c, `Composant: ${path.basename(c)}`)) passCount++; else failCount++;
});

// Check API Configuration
log.header('9. Configuration API');
const apiFile = readFileContent('./cfa_digital/src/services/api.js');
if (apiFile && apiFile.includes('axios.create')) { log.success('API client configuré'); passCount++; } else { log.error('API client manquant'); failCount++; }

// Check Context Files
log.header('10. Contextes Frontend');
if (checkFileExists('./cfa_digital/src/context/AuthContext.jsx', 'AuthContext')) passCount++; else failCount++;
if (checkFileExists('./cfa_digital/src/context/NotifContext.jsx', 'NotifContext')) passCount++; else failCount++;

// Summary
console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
log.header('📊 Résumé');
console.log(`${colors.green}✅ Réussis: ${passCount}${colors.reset}`);
console.log(`${colors.yellow}⚠️  Avertissements: ${warnCount}${colors.reset}`);
console.log(`${colors.red}❌ Échoués: ${failCount}${colors.reset}`);

const totalChecks = passCount + failCount + warnCount;
const percentage = Math.round((passCount / totalChecks) * 100);
console.log(`\n📈 Santé globale: ${percentage}%`);

if (failCount === 0) {
  log.success('✨ Tout est en ordre! L\'application est prête à démarrer.');
} else if (failCount <= 3) {
  log.warning('⚠️  Quelques problèmes détectés. Vérifier les éléments en rouge.');
} else {
  log.error('❌ Problèmes graves détectés. Vérifier la configuration.');
}

console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
