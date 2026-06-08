const request = require('supertest');
const app = require('../src/server');
const { resetRuntimeStores } = require('../src/data/reset');

async function loginAs(email, password) {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.token;
}

function setupTestIsolation() {
  beforeEach(() => {
    resetRuntimeStores();
  });
}

module.exports = { app, request, loginAs, setupTestIsolation };
