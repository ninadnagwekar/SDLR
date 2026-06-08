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

describe('Notification API', () => {
  test('lists notifications for manager', async () => {
    const token = await loginAs('manager@example.com', 'manager123');

    const escalationRes = await request(app)
      .post('/api/escalations')
      .set('Authorization', `Bearer ${token}`)
      .send({ taskId: 'TASK-001' });

    await request(app)
      .post('/api/notifications/trigger')
      .set('Authorization', `Bearer ${token}`)
      .send({ escalationId: escalationRes.body.id });

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('triggers notification for escalation', async () => {
    const token = await loginAs('manager@example.com', 'manager123');

    const escalationRes = await request(app)
      .post('/api/escalations')
      .set('Authorization', `Bearer ${token}`)
      .send({ taskId: 'TASK-001' });

    const res = await request(app)
      .post('/api/notifications/trigger')
      .set('Authorization', `Bearer ${token}`)
      .send({ escalationId: escalationRes.body.id });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.notification.status).toBe('SENT');
  });
});
