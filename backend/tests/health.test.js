const { app, request } = require('./helpers');

describe('Health API', () => {
  test('root endpoint returns service info', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body.service).toBe('Smart Task Escalation Engine');
    expect(res.body.status).toBe('running');
  });

  test('health endpoint returns ok status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });
});
