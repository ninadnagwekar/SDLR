/**
 * Unit tests: Audit logging
 * Standard: Arrange → Act → Assert | Deterministic | No I/O
 */
const { resetUnitTestState, managerId, adminId } = require('./setup');
const auditService = require('../../src/services/auditService');

beforeEach(() => {
  resetUnitTestState();
});

describe('AuditService — log creation', () => {
  test('creates audit entry with action, user, and metadata', () => {
    // Arrange
    const action = 'ESCALATION_CREATED';
    const metadata = { escalationId: '11111111-1111-1111-1111-111111111111' };

    // Act
    const entry = auditService.logEvent(action, managerId, metadata);

    // Assert
    expect(entry).toMatchObject({
      id: '11111111-1111-1111-1111-111111111111',
      action,
      userId: managerId,
      metadata,
    });
    expect(entry.createdAt).toBeDefined();
  });

  test('allows null user id for system events', () => {
    // Arrange
    const action = 'SYSTEM_EVENT';

    // Act
    const entry = auditService.logEvent(action, null, { source: 'scheduler' });

    // Assert
    expect(entry.userId).toBeNull();
    expect(entry.action).toBe(action);
  });

  test('defaults metadata to empty object', () => {
    // Arrange
    const action = 'USER_LOGIN';

    // Act
    const entry = auditService.logEvent(action, adminId);

    // Assert
    expect(entry.metadata).toEqual({});
  });
});

describe('AuditService — log retrieval', () => {
  test('returns all logs when no filter is provided', () => {
    // Arrange
    auditService.logEvent('ESCALATION_CREATED', managerId, { taskId: 'TASK-001' });
    auditService.logEvent('NOTIFICATION_TRIGGERED', managerId, { escalationId: 'E1' });

    // Act
    const logs = auditService.getLogs();

    // Assert
    expect(logs).toHaveLength(2);
  });

  test('filters logs by action', () => {
    // Arrange
    auditService.logEvent('ESCALATION_CREATED', managerId, { taskId: 'TASK-001' });
    auditService.logEvent('NOTIFICATION_TRIGGERED', managerId, { escalationId: 'E1' });

    // Act
    const logs = auditService.getLogs({ action: 'NOTIFICATION_TRIGGERED' });

    // Assert
    expect(logs).toHaveLength(1);
    expect(logs[0].action).toBe('NOTIFICATION_TRIGGERED');
  });

  test('filters logs by user id', () => {
    // Arrange
    auditService.logEvent('ESCALATION_CREATED', managerId);
    auditService.logEvent('ESCALATION_CREATED', adminId);

    // Act
    const logs = auditService.getLogs({ userId: adminId });

    // Assert
    expect(logs).toHaveLength(1);
    expect(logs[0].userId).toBe(adminId);
  });

  test('returns empty array when no logs match filter', () => {
    // Arrange
    auditService.logEvent('USER_LOGIN', managerId);

    // Act
    const logs = auditService.getLogs({ action: 'ESCALATION_STATUS_UPDATED' });

    // Assert
    expect(logs).toHaveLength(0);
  });
});
