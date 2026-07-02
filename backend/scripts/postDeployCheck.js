#!/usr/bin/env node
// backend/scripts/postDeployCheck.js
// Simple post-deploy health check that tests /api/health, /api/auth, /api/users
// Prints: OK <endpoint> or FAIL <endpoint> - <reason>

(async () => {
  const base = (process.env.BASE_URL || process.env.DEPLOY_URL || process.env.BASE_DEPLOY_URL || '').replace(/\/$/, '');
  if (!base) {
    console.error('BASE_URL or DEPLOY_URL environment variable is required for post-deploy check.');
    process.exit(1);
  }
  const endpoints = ['/api/health', '/api/auth', '/api/users'];
  let allOk = true;

  for (const ep of endpoints) {
    const url = `${base}${ep}`;
    try {
      const res = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' }, cache: 'no-store' });
      if (res.ok) {
        console.log(`OK ${ep}`);
      } else {
        console.log(`FAIL ${ep} - status ${res.status}`);
        allOk = false;
      }
    } catch (err) {
      console.log(`FAIL ${ep} - ${err && err.message ? err.message : err}`);
      allOk = false;
    }
  }

  process.exit(allOk ? 0 : 1);
})();
