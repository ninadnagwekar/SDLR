const request = require('supertest');
const app = require('../src/server');

describe('Auth API', () => {
  test('login succeeds with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@example.com', password: 'manager123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('manager');
  });

  test('login fails with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@example.com', password: 'wrong' });

    expect(res.status).toBe(401);
  });
});
