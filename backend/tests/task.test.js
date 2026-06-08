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

describe('Task API', () => {
  test('lists tasks for authenticated user', async () => {
    const token = await loginAs('employee@example.com', 'employee123');
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('returns overdue tasks for manager', async () => {
    const token = await loginAs('manager@example.com', 'manager123');
    const res = await request(app)
      .get('/api/tasks/overdue')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.some((t) => t.id === 'TASK-001')).toBe(true);
  });

  test('manager can create a task', async () => {
    const token = await loginAs('manager@example.com', 'manager123');
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'New compliance review',
        assigneeId: 'USR-EMPLOYEE',
        managerId: 'USR-MANAGER',
        dueDate: new Date(Date.now() - 86400000).toISOString(),
        description: 'Review compliance checklist',
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('New compliance review');
  });

  test('employee cannot access overdue endpoint', async () => {
    const token = await loginAs('employee@example.com', 'employee123');
    const res = await request(app)
      .get('/api/tasks/overdue')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});
