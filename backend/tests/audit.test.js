const request = require('supertest');
const app = require('../src/server');
const { resetRuntimeStores } = require('../src/data/reset');

beforeEach(() => {
  resetRuntimeStores();
});

async function loginAs(email, password) {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.token;
}

describe('Audit API', () => {
  test('admin can view audit logs', async () => {
    const token = await loginAs('admin@example.com', 'admin123');

    await request(app)
      .post('/api/escalations')
      .set('Authorization', `Bearer ${token}`)
      .send({ taskId: 'TASK-001' });

    const res = await request(app)
      .get('/api/audit')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.some((log) => log.action === 'ESCALATION_CREATED')).toBe(true);
  });

  test('non-admin cannot view audit logs', async () => {
    const token = await loginAs('employee@example.com', 'employee123');

    const res = await request(app)
      .get('/api/audit')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});
