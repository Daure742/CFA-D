const { expect } = require('chai');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const ioClient = require('socket.io-client');
const User = require('../models/User');
const Cours = require('../models/Cours');
const Presence = require('../models/Presence');
const { startTestServer, stopTestServer } = require('../testServer');

describe('Socket presence auto-emargement', function () {
  this.timeout(20000);
  let mongoServer;
  let serverObj;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MONGO_URI = uri;
    process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'testsecret';
    await mongoose.connect(uri, { dbName: 'test' });
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('creates Presence when connexion-cours is emitted', async () => {
    // create data
    const cfa = { nom: 'Test CFA' };
    // create user and course
    const user = await User.create({ email: 'u@test', motDePasse: 'x', prenom: 'T', nom: 'User', role: 'etudiant', tenantId: mongoose.Types.ObjectId() });
    const cours = await Cours.create({ titre: 'Test cours', dateDebut: new Date(), dateFin: new Date(Date.now()+3600000), formateur: user._id, cohorte: mongoose.Types.ObjectId(), tenantId: user.tenantId });

    // start server
    serverObj = await startTestServer(0);

    // create token
    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_ACCESS_SECRET);

    const socket = ioClient(serverObj.url.replace('http://', 'http://'), { reconnection: false });

    await new Promise((resolve, reject) => {
      socket.on('connect', () => {
        socket.emit('authenticate', token);
      });

      socket.on('authenticated', (data) => {
        if (data && data.success) {
          socket.emit('connexion-cours', cours._id.toString());
          setTimeout(resolve, 500);
        } else reject(new Error('auth failed'));
      });

      socket.on('connect_error', (err) => reject(err));
    });

    // verify presence
    const presence = await Presence.findOne({ cours: cours._id, etudiant: user._id });
    expect(presence).to.exist;
    expect(presence.statut).to.equal('présent');

    // cleanup
    socket.close();
    await stopTestServer(serverObj);
  });
});
