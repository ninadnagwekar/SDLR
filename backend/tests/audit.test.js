const { app, request, loginAs, setupTestIsolation } = require('./helpers');

setupTestIsolation();

describe('Audit API', () => {
  test('admin can view audit logs after escalation', async () => {
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
    expect(res.body.some((log) => log.action === 'USER_LOGIN')).toBe(true);
  });

  test('audit logs status change events', async () => {
    const token = await loginAs('admin@example.com', 'admin123');

    const createRes = await request(app)
      .post('/api/escalations')
      .set('Authorization', `Bearer ${token}`)
      .send({ taskId: 'TASK-001' });

    await request(app)
      .put(`/api/escalations/${createRes.body.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'RESOLVED' });

    const res = await request(app)
      .get('/api/audit')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.some((log) => log.action === 'ESCALATION_STATUS_UPDATED')).toBe(true);
  });

  test('audit logs notification trigger events', async () => {
    const token = await loginAs('admin@example.com', 'admin123');

    const createRes = await request(app)
      .post('/api/escalations')
      .set('Authorization', `Bearer ${token}`)
      .send({ taskId: 'TASK-001' });

    await request(app)
      .post('/api/notifications/trigger')
      .set('Authorization', `Bearer ${token}`)
      .send({ escalationId: createRes.body.id });

    const res = await request(app)
      .get('/api/audit')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.some((log) => log.action === 'NOTIFICATION_TRIGGERED')).toBe(true);
  });

  test('employee cannot view audit logs', async () => {
    const token = await loginAs('employee@example.com', 'employee123');

    const res = await request(app)
      .get('/api/audit')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Insufficient permissions');
  });

  test('manager cannot view audit logs', async () => {
    const token = await loginAs('manager@example.com', 'manager123');

    const res = await request(app)
      .get('/api/audit')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Insufficient permissions');
  });
});
