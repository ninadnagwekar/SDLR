/**
 * Unit tests: Role permission logic
 * Standard: Arrange → Act → Assert | Deterministic | No I/O
 */
const { authorize } = require('../../src/middleware/authorize');

function createMockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('authorize middleware — role permissions', () => {
  test('allows user with matching role', () => {
    // Arrange
    const req = { user: { role: 'manager', userId: 'USR-MANAGER' } };
    const res = createMockRes();
    const next = jest.fn();
    const middleware = authorize('manager', 'admin');

    // Act
    middleware(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('allows admin when manager and admin are permitted', () => {
    // Arrange
    const req = { user: { role: 'admin', userId: 'USR-ADMIN' } };
    const res = createMockRes();
    const next = jest.fn();
    const middleware = authorize('manager', 'admin');

    // Act
    middleware(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('blocks employee when only manager is permitted', () => {
    // Arrange
    const req = { user: { role: 'employee', userId: 'USR-EMPLOYEE' } };
    const res = createMockRes();
    const next = jest.fn();
    const middleware = authorize('manager');

    // Act
    middleware(req, res, next);

    // Assert
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
  });

  test('blocks request when user is missing', () => {
    // Arrange
    const req = {};
    const res = createMockRes();
    const next = jest.fn();
    const middleware = authorize('admin');

    // Act
    middleware(req, res, next);

    // Assert
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
  });

  test('blocks request when role is not in allowed list', () => {
    // Arrange
    const req = { user: { role: 'manager', userId: 'USR-MANAGER' } };
    const res = createMockRes();
    const next = jest.fn();
    const middleware = authorize('admin');

    // Act
    middleware(req, res, next);

    // Assert
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('allows only admin for admin-only routes', () => {
    // Arrange
    const req = { user: { role: 'admin', userId: 'USR-ADMIN' } };
    const res = createMockRes();
    const next = jest.fn();
    const middleware = authorize('admin');

    // Act
    middleware(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
