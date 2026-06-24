#!/usr/bin/env node
/* globals process */


/**
 * 🚀 Script de Démarrage du Frontend CFA Digital
 * 
 * Ce script démarre le serveur Vite avec le port stable 5173.
 * Si le port est déjà en usage, il essaie les ports alternatifs.
 */

import { spawn } from 'child_process';
import net from 'net';

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
  header: (msg) => console.log(`\n${colors.cyan}=== ${msg} ===${colors.reset}\n`),
};

function checkPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    
    server.listen(port, 'localhost');
  });
}

async function findAvailablePort(startPort = 5173) {
  for (let port = startPort; port <= startPort + 10; port++) {
    if (await checkPortAvailable(port)) {
      return port;
    }
  }
  return null;
}

async function start() {
  log.header('🚀 CFA Digital Frontend Launcher');
  
  console.log(`${colors.cyan}Port Préféré:${colors.reset} 5173`);
  console.log(`${colors.cyan}Mode:${colors.reset} Développement`);
  console.log(`${colors.cyan}Backend API:${colors.reset} http://localhost:5000/api\n`);
  
  // Vérifier si le port 5173 est disponible
  log.info('Vérification du port 5173...');
  
  const availablePort = await findAvailablePort(5173);
  
  if (!availablePort) {
    log.error('Aucun port disponible entre 5173 et 5183');
    process.exit(1);
  }
  
  if (availablePort === 5173) {
    log.success('Port 5173 disponible!');
  } else {
    log.warning(`Port 5173 en usage, utilisation du port ${availablePort}`);
  }
  
  log.info(`Démarrage du serveur Vite sur http://localhost:${availablePort}/`);
  
  console.log(`\n${colors.cyan}${'-'.repeat(60)}${colors.reset}\n`);
  
  // Démarrer Vite
  const viteProcess = spawn('npm', ['run', 'dev'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: {
      ...process.env,
      VITE_PORT: availablePort,
      VITE_API_URL: 'http://localhost:5000/api',
      VITE_SOCKET_URL: 'http://localhost:5000',
    },
  });
  
  viteProcess.on('error', (error) => {
    log.error(`Erreur de démarrage: ${error.message}`);
    process.exit(1);
  });
  
  viteProcess.on('close', (code) => {
    if (code !== 0) {
      log.error(`Processus Vite terminé avec le code ${code}`);
    }
    process.exit(code);
  });
  
  // Gestion Ctrl+C
  process.on('SIGINT', () => {
    log.warning('\nArrêt du serveur...');
    viteProcess.kill();
    process.exit(0);
  });
}

start().catch((error) => {
  log.error(`Erreur: ${error.message}`);
  process.exit(1);
});
