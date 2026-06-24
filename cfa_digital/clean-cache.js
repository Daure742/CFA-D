#!/usr/bin/env node
/* globals process */


/**
 * 🧹 Script de Nettoyage du Cache Frontend
 * 
 * Supprime les fichiers en cache qui peuvent causer des problèmes d'affichage
 */

import fs from 'fs';
import path from 'path';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.cyan}=== ${msg} ===${colors.reset}\n`),
};

const dirsToDelete = [
  'node_modules/.vite',
  'node_modules/.cache',
  'dist',
  '.vite-cache',
  'src/**/*.swp',
  'src/**/*.swo',
];

const filesToDelete = [
  '.eslintcache',
];

log.header('🧹 Nettoyage du Cache Frontend');

// Supprimer les répertoires
dirsToDelete.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    try {
      fs.rmSync(fullPath, { recursive: true, force: true });
      log.success(`Supprimé: ${dir}`);
    } catch (error) {
      log.error(`Erreur lors de la suppression de ${dir}: ${error.message}`);
    }
  }
});

// Supprimer les fichiers
filesToDelete.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
      log.success(`Supprimé: ${file}`);
    } catch (error) {
      log.error(`Erreur lors de la suppression de ${file}: ${error.message}`);
    }
  }
});

log.header('✨ Nettoyage Terminé');
log.warning('Lance maintenant: npm install && npm run dev');
