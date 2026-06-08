const { app, request, loginAs, setupTestIsolation } = require('./helpers');

setupTestIsolation();

describe('Task API', () => {
  test('lists tasks for authenticated employee', async () => {
    const token = await loginAs('employee@example.com', 'employee123');
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every((t) => t.assigneeId === 'USR-EMPLOYEE')).toBe(true);
  });

  test('admin can list all tasks', async () => {
    const token = await loginAs('admin@example.com', 'admin123');
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  test('returns overdue tasks for manager', async () => {
    const token = await loginAs('manager@example.com', 'manager123');
    const res = await request(app)
      .get('/api/tasks/overdue')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.some((t) => t.id === 'TASK-001')).toBe(true);
    expect(res.body.every((t) => t.status === 'OVERDUE')).toBe(true);
  });

  test('admin can access overdue tasks', async () => {
    const token = await loginAs('admin@example.com', 'admin123');
    const res = await request(app)
      .get('/api/tasks/overdue')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
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
    expect(res.body.status).toBe('PENDING');
  });

  test('rejects task creation when required fields are missing', async () => {
    const token = await loginAs('manager@example.com', 'manager123');
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Incomplete task' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('required');
  });

  test('employee cannot access overdue endpoint', async () => {
    const token = await loginAs('employee@example.com', 'employee123');
    const res = await request(app)
      .get('/api/tasks/overdue')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Insufficient permissions');
  });

  test('employee cannot create tasks', async () => {
    const token = await loginAs('employee@example.com', 'employee123');
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Unauthorized task',
        assigneeId: 'USR-EMPLOYEE',
        managerId: 'USR-MANAGER',
        dueDate: new Date().toISOString(),
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Insufficient permissions');
  });
});
