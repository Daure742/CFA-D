// testServer.js - start/stop server for tests without global side-effects
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const socketHandler = require('./socket/socketHandler');
const { parseCorsOrigins } = require('./config/cors');

async function startTestServer(port = 0) {
  return new Promise((resolve, reject) => {
    try {
      const server = http.createServer(app);
      const allowedOrigins = parseCorsOrigins(process.env.CLIENT_URL);
      const io = new Server(server, { cors: { origin: allowedOrigins, methods: ['GET','POST'] } });
      socketHandler(io);
      server.listen(port, () => {
        const actualPort = server.address().port;
        resolve({ server, io, port: actualPort, url: `http://localhost:${actualPort}` });
      });
    } catch (err) {
      reject(err);
    }
  });
}

async function stopTestServer(serverObj) {
  if (!serverObj) return;
  return new Promise((resolve) => {
    try {
      serverObj.io.close();
      serverObj.server.close(() => resolve());
    } catch (e) { resolve(); }
  });
}

module.exports = { startTestServer, stopTestServer };
