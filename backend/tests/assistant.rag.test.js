const { expect } = require('chai');
const request = require('supertest');
const mongoose = require('mongoose');
const spawn = require('child_process').spawn;
const path = require('path');

const app = require('../app');

describe('Assistant RAG pipeline', function() {
  this.timeout(60000);
  before(async () => {
    // ensure test DB - require MONGO_URI (Atlas)
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGO_URI is required for tests and must point to MongoDB Atlas');
    await mongoose.connect(uri, {});
    // seed data
    const seed = require(path.join(__dirname, '..', 'scripts', 'seedAssistantTestData'));
    // seed file runs as script; instead call it directly by requiring not convenient; instead run node script
    await new Promise((res, rej) => {
      const env = Object.assign({}, process.env, { MOCK_MODE: 'true', MONGO_URI: uri });
      const p = spawn('node', [path.join(__dirname, '..', 'scripts', 'seedAssistantTestData.js')], { stdio: 'inherit', env });
      p.on('exit', (code) => code === 0 ? res() : rej(new Error('seed failed')));
    });

    // run indexer to populate embeddings (may require OPENAI_API_KEY)
    await new Promise((res, rej) => {
      const env = Object.assign({}, process.env, { MOCK_MODE: 'true', MONGO_URI: uri });
      const p = spawn('node', [path.join(__dirname, '..', 'scripts', 'indexContent.js')], { stdio: 'inherit', env });
      p.on('exit', (code) => code === 0 ? res() : rej(new Error('indexer failed')));
    });
  });

  after(async () => {
    await mongoose.disconnect();
  });

  it('responds to a relevant query with sources', async () => {
    // NOTE: the assistant endpoint requires auth; for test we'll create a token by logging in if auth route exists
    // Attempt to login
    let token = process.env.TEST_TOKEN;
    if (!token) {
      try {
        const loginRes = await request(app).post('/api/auth/login').send({ email: 'assistant.test@cfa.local', motDePasse: 'test1234' });
        token = loginRes.body && loginRes.body.token;
      } catch (e) {
        // ignore
      }
    }

    const res = await request(app)
      .post('/api/assistant/query')
      .set('Authorization', token ? `Bearer ${token}` : '')
      .send({ query: 'Qu\'est-ce que le RAG ?', coursId: null, devoirId: null })
      .expect(200);

    expect(res.body).to.have.property('ok', true);
    expect(res.body).to.have.property('answer');
    expect(res.body).to.have.property('sources');
    expect(res.body.sources).to.be.an('array');
  });
});
