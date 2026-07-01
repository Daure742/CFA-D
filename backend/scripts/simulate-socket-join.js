// scripts/simulate-socket-join.js
// Usage:
//   TEST_TOKEN=... COURSE_ID=... node simulate-socket-join.js
// Or set TEST_EMAIL and TEST_PASSWORD to login and obtain a token.
require('dotenv').config();
const io = require('socket.io-client');
const axios = require('axios');

const API_URL = process.env.TEST_API_URL || process.env.API_URL;
const SOCKET_URL = process.env.TEST_SOCKET_URL || (API_URL ? API_URL.replace('/api', '') : undefined);

async function getToken() {
  if (process.env.TEST_TOKEN) return process.env.TEST_TOKEN;
  if (!process.env.TEST_EMAIL || !process.env.TEST_PASSWORD) return null;
  try {
    const resp = await axios.post(`${API_URL}/auth/login`, {
      email: process.env.TEST_EMAIL,
      motDePasse: process.env.TEST_PASSWORD
    });
    return resp.data?.accessToken || resp.data?.token;
  } catch (err) {
    console.error('Login failed:', err.response?.data || err.message);
    return null;
  }
}

async function main() {
  const token = await getToken();
  if (!token) {
    console.error('No token available. Set TEST_TOKEN or TEST_EMAIL/TEST_PASSWORD env vars.');
    process.exit(1);
  }

  const coursId = process.env.COURSE_ID;
  if (!coursId) {
    console.error('Set COURSE_ID env var to the cours ObjectId to join.');
    process.exit(1);
  }

  console.log('Connecting to', SOCKET_URL);
  const socket = io(SOCKET_URL, { reconnection: false });

  socket.on('connect', () => {
    console.log('socket connected', socket.id);
    socket.emit('authenticate', token);
  });

  socket.on('authenticated', (data) => {
    console.log('authenticated:', data);
    if (data && data.success) {
      console.log('Emitting connexion-cours for', coursId);
      socket.emit('connexion-cours', coursId);
      setTimeout(() => {
        console.log('Done. Disconnecting.');
        socket.close();
        process.exit(0);
      }, 1000);
    } else {
      console.error('Authentication failed over socket.');
      socket.close();
      process.exit(1);
    }
  });

  socket.on('connect_error', (err) => {
    console.error('connect_error', err.message || err);
    process.exit(1);
  });
}

main();
