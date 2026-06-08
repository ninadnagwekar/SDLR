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

describe('Escalation API', () => {
  test('creates escalation for overdue task', async () => {
    const token = await loginAs('manager@example.com', 'manager123');

    const res = await request(app)
      .post('/api/escalations')
      .set('Authorization', `Bearer ${token}`)
      .send({ taskId: 'TASK-001', reason: 'Past due' });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.status).toBe('OPEN');
    expect(res.body.taskId).toBe('TASK-001');
  });

  test('rejects escalation for non-overdue task', async () => {
    const token = await loginAs('admin@example.com', 'admin123');

    const res = await request(app)
      .post('/api/escalations')
      .set('Authorization', `Bearer ${token}`)
      .send({ taskId: 'TASK-002' });

    expect(res.status).toBe(400);
  });

  test('returns escalation history', async () => {
    const token = await loginAs('manager@example.com', 'manager123');

    const res = await request(app)
      .get('/api/escalations/history')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('updates escalation status', async () => {
    const token = await loginAs('admin@example.com', 'admin123');

    const createRes = await request(app)
      .post('/api/escalations')
      .set('Authorization', `Bearer ${token}`)
      .send({ taskId: 'TASK-001' });

    const updateRes = await request(app)
      .put(`/api/escalations/${createRes.body.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'IN_PROGRESS' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.status).toBe('IN_PROGRESS');
  });

  test('employee cannot create escalation', async () => {
    const token = await loginAs('employee@example.com', 'employee123');

    const res = await request(app)
      .post('/api/escalations')
      .set('Authorization', `Bearer ${token}`)
      .send({ taskId: 'TASK-001' });

    expect(res.status).toBe(403);
  });
});
