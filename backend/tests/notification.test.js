const { app, request, loginAs, setupTestIsolation } = require('./helpers');

setupTestIsolation();

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
    expect(res.body).toHaveLength(1);
    expect(res.body[0].recipientId).toBe('USR-MANAGER');
    expect(res.body[0].status).toBe('SENT');
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
    expect(res.body.message).toBe('Notification sent');
    expect(res.body.notification.status).toBe('SENT');
  });

  test('rejects trigger when escalationId is missing', async () => {
    const token = await loginAs('manager@example.com', 'manager123');

    const res = await request(app)
      .post('/api/notifications/trigger')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('escalationId is required');
  });

  test('returns 404 when escalation does not exist', async () => {
    const token = await loginAs('manager@example.com', 'manager123');

    const res = await request(app)
      .post('/api/notifications/trigger')
      .set('Authorization', `Bearer ${token}`)
      .send({ escalationId: 'missing-id' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Escalation not found');
  });

  test('employee cannot trigger notifications', async () => {
    const managerToken = await loginAs('manager@example.com', 'manager123');
    const employeeToken = await loginAs('employee@example.com', 'employee123');

    const escalationRes = await request(app)
      .post('/api/escalations')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ taskId: 'TASK-001' });

    const res = await request(app)
      .post('/api/notifications/trigger')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ escalationId: escalationRes.body.id });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Insufficient permissions');
  });
});
