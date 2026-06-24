#!/usr/bin/env node
/* globals process */
/* eslint-disable no-unused-vars */

/**
 * 🚀 LANCEUR COMPLET - Start Everything!
 * 
 * Ce script:
 * 1. Nettoie le cache
 * 2. Libère le port 5173
 * 3. Installe les dépendances
 * 4. Démarre Vite avec gestion d'erreurs
 */

import { spawn } from 'child_process';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ️${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.magenta}${'═'.repeat(70)}${colors.reset}\n${colors.cyan}${msg}${colors.reset}\n${colors.magenta}${'═'.repeat(70)}${colors.reset}\n`),
};

async function killPort(port = 5173) {
  log.info(`Vérification du port ${port}...`);
  
  try {
    if (process.platform === 'win32') {
      try {
        const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
        
        if (!stdout || stdout.trim() === '') {
          log.success(`Port ${port} est libre`);
          return;
        }
        
        const match = stdout.match(/\s(\d+)\s*$/);
        
        if (match) {
          const pid = match[1];
          log.warning(`Terminaison du processus PID ${pid}...`);
          
          try {
            await execAsync(`taskkill /PID ${pid} /F`);
            log.success(`Processus ${pid} terminé`);
            
            // Attendre un peu pour que le port se libère
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
            log.warning(`Impossible de terminer le processus (peut-être déjà fermé)`);
          }
        }
      } catch (error) {
        if (error.message.includes('FINDSTR')) {
          log.success(`Port ${port} est libre`);
        }
      }
    } else if (process.platform === 'darwin' || process.platform === 'linux') {
      try {
        const { stdout } = await execAsync(`lsof -i :${port}`);
        
        if (stdout) {
          const lines = stdout.split('\n');
          if (lines.length > 1) {
            const pid = lines[1].split(/\s+/)[1];
            log.warning(`Terminaison du processus PID ${pid}...`);
            await execAsync(`kill -9 ${pid}`);
            log.success(`Processus ${pid} terminé`);
          }
        } else {
          log.success(`Port ${port} est libre`);
        }
      } catch (error) {
        log.success(`Port ${port} est libre`);
      }
    }
  } catch (error) {
    log.warning(`Erreur lors de la vérification du port: ${error.message}`);
  }
}

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options,
    });
    
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command exited with code ${code}`));
    });
  });
}

async function main() {
  log.header('🚀 LANCEUR COMPLET CFA DIGITAL');
  
  console.log(`${colors.cyan}Plateforme: ${process.platform}${colors.reset}`);
  console.log(`${colors.cyan}Node: ${process.version}${colors.reset}\n`);
  
  try {
    // étape 1: Nettoyer
    log.header('📦 ÉTAPE 1: Nettoyage du Cache');
    await runCommand('node', ['clean-cache.js']);
    
    // étape 2: Libérer le port
    log.header('🔌 ÉTAPE 2: Libération du Port 5173');
    await killPort(5173);
    
    // étape 3: Installer
    log.header('📚 ÉTAPE 3: Installation des Dépendances');
    await runCommand('npm', ['install']);
    
    // étape 4: Démarrer
    log.header('🎯 ÉTAPE 4: Démarrage du Serveur Vite');
    console.log(`${colors.green}✨ Vite démarre sur http://localhost:5173/${colors.reset}\n`);
    
    await runCommand('npm', ['run', 'dev']);
    
  } catch (err) {
    log.header('❌ ERREUR');
    log.error(err.message);
    
    console.log(`\n${colors.yellow}Solutions alternatives:${colors.reset}`);
    console.log(`  1. Utilisez un port différent:`);
    console.log(`     npm run dev -- --port 5174\n`);
    console.log(`  2. Fermez toutes les instances de VS Code\n`);
    console.log(`  3. Redémarrez votre ordinateur\n`);
    
    process.exit(1);
  }
}

main();
