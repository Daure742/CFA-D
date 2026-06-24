#!/usr/bin/env node
/* globals process */


/**
 * 🔌 Script de Libération du Port
 * 
 * Trouve et tue le processus qui utilise le port 5173
 * Compatible avec Windows, macOS et Linux
 */

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
};

const log = {
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ️${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.cyan}=== ${msg} ===${colors.reset}\n`),
};

async function killPort(port = 5173) {
  log.header(`🔌 Libération du Port ${port}`);
  
  try {
    const platform = process.platform;
    
    if (platform === 'win32') {
      // Windows
      log.info('Recherche du processus sur Windows...');
      
      try {
        const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
        
        if (stdout) {
          const lines = stdout.split('\n').filter(line => line.trim());
          
          if (lines.length === 0) {
            log.success(`Port ${port} est libre!`);
            return;
          }
          
          log.info(`Processus trouvé utilisant le port ${port}:`);
          console.log(stdout);
          
          // Extraire le PID (dernière colonne)
          const match = lines[0].match(/\s(\d+)\s*$/);
          
          if (match) {
            const pid = match[1];
            log.warning(`Terminaison du processus PID ${pid}...`);
            
            await execAsync(`taskkill /PID ${pid} /F`);
            log.success(`Processus ${pid} terminé!`);
            log.success(`Port ${port} est maintenant libre!`);
          }
        } else {
          log.success(`Port ${port} est libre!`);
        }
      } catch (error) {
        if (error.message.includes('FINDSTR')) {
          log.success(`Port ${port} est libre!`);
        } else {
          throw error;
        }
      }
    } else if (platform === 'darwin' || platform === 'linux') {
      // macOS et Linux
      log.info(`Recherche du processus sur ${platform === 'darwin' ? 'macOS' : 'Linux'}...`);
      
      try {
        const { stdout } = await execAsync(`lsof -i :${port}`);
        
        if (stdout) {
          log.info(`Processus trouvé utilisant le port ${port}:`);
          console.log(stdout);
          
          // Extraire le PID (deuxième colonne)
          const lines = stdout.split('\n');
          const pidLine = lines[1];
          const pid = pidLine.split(/\s+/)[1];
          
          if (pid) {
            log.warning(`Terminaison du processus PID ${pid}...`);
            await execAsync(`kill -9 ${pid}`);
            log.success(`Processus ${pid} terminé!`);
            log.success(`Port ${port} est maintenant libre!`);
          }
        } else {
          log.success(`Port ${port} est libre!`);
        }
      } catch (error) {
        if (error.message.includes('lsof')) {
          log.success(`Port ${port} est libre!`);
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    log.error(`Erreur: ${error.message}`);
    log.warning('Solutions alternatives:');
    console.log(`  1. Redémarrez votre ordinateur`);
    console.log(`  2. Utilisez un port différent: npm run dev -- --port 5174`);
    console.log(`  3. Fermez manuellement les instances VS Code/navigateur`);
    process.exit(1);
  }
  
  log.info('');
  log.warning('Lance maintenant: npm install && npm run dev');
  log.info('');
}

killPort().catch((error) => {
  log.error(`Erreur fatale: ${error.message}`);
  process.exit(1);
});
