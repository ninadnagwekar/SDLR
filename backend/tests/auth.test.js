const { app, request } = require('./helpers');

describe('Auth API', () => {
  test('login succeeds for admin', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'admin123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('admin');
    expect(res.body.user.email).toBe('admin@example.com');
  });

  test('login succeeds for manager', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@example.com', password: 'manager123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('manager');
  });

  test('login succeeds for employee', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'employee@example.com', password: 'employee123' });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('employee');
  });

  test('login fails with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@example.com', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password');
  });

  test('login fails when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'manager123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Email and password are required');
  });

  test('login fails when password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Email and password are required');
  });

  test('protected route rejects missing token', async () => {
    const res = await request(app).get('/api/tasks');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });

  test('protected route rejects invalid token', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', 'Bearer invalid-token');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid or expired token');
  });
});
