/**
 * Unit tests: Notification trigger logic
 * Standard: Arrange → Act → Assert | Deterministic | No I/O
 */
const { resetUnitTestState, managerId } = require('./setup');
const escalationService = require('../../src/services/escalationService');
const notificationService = require('../../src/services/notificationService');
const auditService = require('../../src/services/auditService');

beforeEach(() => {
  resetUnitTestState();
});

describe('NotificationService — trigger logic', () => {
  test('sends notification to task manager for valid escalation', () => {
    // Arrange
    const escalation = escalationService.createEscalation({
      taskId: 'TASK-001',
      escalatedBy: managerId,
    }).escalation;

    // Act
    const result = notificationService.triggerNotification({
      escalationId: escalation.id,
      triggeredBy: managerId,
    });

    // Assert
    expect(result.success).toBe(true);
    expect(result.notification).toMatchObject({
      id: '33333333-3333-3333-3333-333333333333',
      escalationId: escalation.id,
      recipientId: managerId,
      status: 'SENT',
    });
    expect(result.notification.message).toContain(escalation.taskId);
  });

  test('returns error when escalation does not exist', () => {
    // Arrange
    const missingId = '99999999-9999-9999-9999-999999999999';

    // Act
    const result = notificationService.triggerNotification({
      escalationId: missingId,
      triggeredBy: managerId,
    });

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Escalation not found');
  });

  test('persists notification in store after trigger', () => {
    // Arrange
    const escalation = escalationService.createEscalation({
      taskId: 'TASK-001',
      escalatedBy: managerId,
    }).escalation;

    // Act
    notificationService.triggerNotification({
      escalationId: escalation.id,
      triggeredBy: managerId,
    });

    // Assert
    const stored = notificationService.listNotifications({
      escalationId: escalation.id,
    });
    expect(stored).toHaveLength(1);
    expect(stored[0].status).toBe('SENT');
  });

  test('writes audit log when notification is triggered', () => {
    // Arrange
    const escalation = escalationService.createEscalation({
      taskId: 'TASK-001',
      escalatedBy: managerId,
    }).escalation;

    // Act
    notificationService.triggerNotification({
      escalationId: escalation.id,
      triggeredBy: managerId,
    });

    // Assert
    const logs = auditService.getLogs({ action: 'NOTIFICATION_TRIGGERED' });
    expect(logs).toHaveLength(1);
    expect(logs[0].metadata).toMatchObject({
      escalationId: escalation.id,
      recipientId: managerId,
    });
  });
});

describe('NotificationService — listing', () => {
  test('filters notifications by recipient id', () => {
    // Arrange
    const escalation = escalationService.createEscalation({
      taskId: 'TASK-001',
      escalatedBy: managerId,
    }).escalation;
    notificationService.triggerNotification({
      escalationId: escalation.id,
      triggeredBy: managerId,
    });

    // Act
    const managerNotifications = notificationService.listNotifications({
      recipientId: managerId,
    });
    const otherNotifications = notificationService.listNotifications({
      recipientId: 'USR-EMPLOYEE',
    });

    // Assert
    expect(managerNotifications).toHaveLength(1);
    expect(otherNotifications).toHaveLength(0);
  });
});
