const { app, request, loginAs, setupTestIsolation } = require('./helpers');

setupTestIsolation();

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
    expect(res.body.reason).toBe('Past due');
    expect(res.body.managerId).toBe('USR-MANAGER');
  });

  test('rejects escalation when taskId is missing', async () => {
    const token = await loginAs('manager@example.com', 'manager123');

    const res = await request(app)
      .post('/api/escalations')
      .set('Authorization', `Bearer ${token}`)
      .send({ reason: 'No task' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('taskId is required');
  });

  test('rejects escalation for non-overdue task', async () => {
    const token = await loginAs('admin@example.com', 'admin123');

    const res = await request(app)
      .post('/api/escalations')
      .set('Authorization', `Bearer ${token}`)
      .send({ taskId: 'TASK-002' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Task is not overdue');
  });

  test('rejects duplicate active escalation for same task', async () => {
    const token = await loginAs('manager@example.com', 'manager123');

    await request(app)
      .post('/api/escalations')
      .set('Authorization', `Bearer ${token}`)
      .send({ taskId: 'TASK-001' });

    const res = await request(app)
      .post('/api/escalations')
      .set('Authorization', `Bearer ${token}`)
      .send({ taskId: 'TASK-001' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('An active escalation already exists for this task');
  });

  test('returns escalation history', async () => {
    const token = await loginAs('manager@example.com', 'manager123');

    await request(app)
      .post('/api/escalations')
      .set('Authorization', `Bearer ${token}`)
      .send({ taskId: 'TASK-001' });

    const res = await request(app)
      .get('/api/escalations/history')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].taskId).toBe('TASK-001');
  });

  test('manager history is scoped to their escalations', async () => {
    const managerToken = await loginAs('manager@example.com', 'manager123');

    await request(app)
      .post('/api/escalations')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ taskId: 'TASK-001' });

    const res = await request(app)
      .get('/api/escalations/history')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.every((e) => e.managerId === 'USR-MANAGER')).toBe(true);
  });

  test('updates escalation status to IN_PROGRESS', async () => {
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

  test('updates escalation status to RESOLVED', async () => {
    const token = await loginAs('admin@example.com', 'admin123');

    const createRes = await request(app)
      .post('/api/escalations')
      .set('Authorization', `Bearer ${token}`)
      .send({ taskId: 'TASK-001' });

    await request(app)
      .put(`/api/escalations/${createRes.body.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'IN_PROGRESS' });

    const updateRes = await request(app)
      .put(`/api/escalations/${createRes.body.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'RESOLVED' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.status).toBe('RESOLVED');
  });

  test('rejects invalid escalation status', async () => {
    const token = await loginAs('admin@example.com', 'admin123');

    const createRes = await request(app)
      .post('/api/escalations')
      .set('Authorization', `Bearer ${token}`)
      .send({ taskId: 'TASK-001' });

    const res = await request(app)
      .put(`/api/escalations/${createRes.body.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'INVALID' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid status');
  });

  test('returns 404 when escalation not found', async () => {
    const token = await loginAs('admin@example.com', 'admin123');

    const res = await request(app)
      .put('/api/escalations/non-existent-id/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'CLOSED' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Escalation not found');
  });

  test('rejects status update when status is missing', async () => {
    const token = await loginAs('admin@example.com', 'admin123');

    const createRes = await request(app)
      .post('/api/escalations')
      .set('Authorization', `Bearer ${token}`)
      .send({ taskId: 'TASK-001' });

    const res = await request(app)
      .put(`/api/escalations/${createRes.body.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('status is required');
  });

  test('employee cannot create escalation', async () => {
    const token = await loginAs('employee@example.com', 'employee123');

    const res = await request(app)
      .post('/api/escalations')
      .set('Authorization', `Bearer ${token}`)
      .send({ taskId: 'TASK-001' });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Insufficient permissions');
  });
});
