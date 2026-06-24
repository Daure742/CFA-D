#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('\n🔍 CFA Digital - Configuration Check\n');

const checks = [];

// Check backend .env
const backendEnv = path.join(__dirname, 'backend', '.env');
const backendEnvExists = fs.existsSync(backendEnv);
checks.push({
  name: 'Backend .env file',
  status: backendEnvExists ? '✅' : '❌',
  message: backendEnvExists ? '' : 'Create backend/.env from backend/.env.exemple',
});

if (backendEnvExists) {
  const content = fs.readFileSync(backendEnv, 'utf-8');
  const hasMongoUri = content.includes('MONGO_URI=mongodb');
  const hasCorsUrl = content.includes('CLIENT_URL=');
  const hasPort = content.includes('PORT=5000');
  
  checks.push({
    name: 'Backend PORT configuration',
    status: hasPort ? '✅' : '❌',
    message: hasPort ? '' : 'Missing or wrong PORT in backend/.env',
  });
  
  checks.push({
    name: 'Backend MONGO_URI configuration',
    status: hasMongoUri ? '✅' : '❌',
    message: hasMongoUri ? '' : 'Missing MONGO_URI in backend/.env',
  });
  
  checks.push({
    name: 'Backend CLIENT_URL (CORS)',
    status: hasCorsUrl ? '✅' : '⚠️',
    message: hasCorsUrl ? (content.includes('5173') ? '✅ Includes localhost:5173' : '⚠️ Add localhost:5173 to CLIENT_URL') : 'Missing CLIENT_URL (CORS configuration)',
  });
}

// Check frontend package.json
const frontendPkg = path.join(__dirname, 'cfa_digital', 'package.json');
const frontendPkgExists = fs.existsSync(frontendPkg);
checks.push({
  name: 'Frontend package.json',
  status: frontendPkgExists ? '✅' : '❌',
  message: frontendPkgExists ? '' : 'Missing cfa_digital/package.json',
});

// Check frontend .env.local
const frontendEnvLocal = path.join(__dirname, 'cfa_digital', '.env.local');
const frontendEnvLocalExists = fs.existsSync(frontendEnvLocal);
checks.push({
  name: 'Frontend .env.local file',
  status: frontendEnvLocalExists ? '✅' : '⚠️',
  message: frontendEnvLocalExists ? '' : 'Recommended: Create cfa_digital/.env.local with VITE_API_URL',
});

// Display results
console.log('Configuration Status:\n');
checks.forEach(check => {
  console.log(`${check.status} ${check.name}`);
  if (check.message) {
    console.log(`   → ${check.message}`);
  }
});

console.log('\n📋 Quick Start:\n');
console.log('1. Backend:');
console.log('   cd backend');
console.log('   npm install');
console.log('   npm run dev');
console.log('');
console.log('2. Frontend (new terminal):');
console.log('   cd cfa_digital');
console.log('   npm install');
console.log('   npm run dev');
console.log('');
console.log('3. Open http://localhost:5173\n');

const allGood = checks.every(c => c.status === '✅');
if (allGood) {
  console.log('✅ All checks passed! Ready to start development.\n');
} else {
  console.log('⚠️ Some checks failed. Review the errors above.\n');
}
