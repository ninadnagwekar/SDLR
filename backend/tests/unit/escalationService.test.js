/**
 * Unit tests: Escalation validation
 * Standard: Arrange → Act → Assert | Deterministic | No I/O
 */
const { resetUnitTestState, managerId } = require('./setup');
const escalationService = require('../../src/services/escalationService');
const auditService = require('../../src/services/auditService');

beforeEach(() => {
  resetUnitTestState();
});

describe('EscalationService — validation', () => {
  test('creates escalation when task is overdue', () => {
    // Arrange
    const payload = {
      taskId: 'TASK-001',
      reason: 'Report overdue',
      escalatedBy: managerId,
    };

    // Act
    const result = escalationService.createEscalation(payload);

    // Assert
    expect(result.success).toBe(true);
    expect(result.escalation).toMatchObject({
      id: '11111111-1111-1111-1111-111111111111',
      taskId: 'TASK-001',
      status: 'OPEN',
      reason: 'Report overdue',
      managerId,
    });
  });

  test('rejects escalation when task is not overdue', () => {
    // Arrange
    const payload = { taskId: 'TASK-002', escalatedBy: managerId };

    // Act
    const result = escalationService.createEscalation(payload);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Task is not overdue');
  });

  test('rejects escalation when task does not exist', () => {
    // Arrange
    const payload = { taskId: 'TASK-MISSING', escalatedBy: managerId };

    // Act
    const result = escalationService.createEscalation(payload);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Task not found');
  });

  test('rejects duplicate active escalation for the same task', () => {
    // Arrange
    const payload = { taskId: 'TASK-001', escalatedBy: managerId };
    escalationService.createEscalation(payload);

    // Act
    const result = escalationService.createEscalation(payload);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('An active escalation already exists for this task');
  });

  test('uses default reason when reason is omitted', () => {
    // Arrange
    const payload = { taskId: 'TASK-001', escalatedBy: managerId };

    // Act
    const result = escalationService.createEscalation(payload);

    // Assert
    expect(result.success).toBe(true);
    expect(result.escalation.reason).toBe('Task overdue');
  });

  test('writes audit log on successful creation', () => {
    // Arrange
    const payload = { taskId: 'TASK-001', escalatedBy: managerId };

    // Act
    escalationService.createEscalation(payload);

    // Assert
    const logs = auditService.getLogs({ action: 'ESCALATION_CREATED' });
    expect(logs).toHaveLength(1);
    expect(logs[0].metadata.taskId).toBe('TASK-001');
  });
});

describe('EscalationService — status updates', () => {
  test('updates status from OPEN to IN_PROGRESS', () => {
    // Arrange
    const created = escalationService.createEscalation({
      taskId: 'TASK-001',
      escalatedBy: managerId,
    }).escalation;

    // Act
    const result = escalationService.updateStatus(
      created.id,
      'IN_PROGRESS',
      managerId
    );

    // Assert
    expect(result.success).toBe(true);
    expect(result.escalation.status).toBe('IN_PROGRESS');
  });

  test('rejects invalid status value', () => {
    // Arrange
    const created = escalationService.createEscalation({
      taskId: 'TASK-001',
      escalatedBy: managerId,
    }).escalation;

    // Act
    const result = escalationService.updateStatus(created.id, 'INVALID', managerId);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid status');
  });

  test('returns not found for unknown escalation id', () => {
    // Arrange
    const unknownId = '99999999-9999-9999-9999-999999999999';

    // Act
    const result = escalationService.updateStatus(unknownId, 'CLOSED', managerId);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Escalation not found');
  });

  test('records status change in audit log', () => {
    // Arrange
    const created = escalationService.createEscalation({
      taskId: 'TASK-001',
      escalatedBy: managerId,
    }).escalation;

    // Act
    escalationService.updateStatus(created.id, 'RESOLVED', managerId);

    // Assert
    const logs = auditService.getLogs({ action: 'ESCALATION_STATUS_UPDATED' });
    expect(logs).toHaveLength(1);
    expect(logs[0].metadata).toMatchObject({
      escalationId: created.id,
      previousStatus: 'OPEN',
      newStatus: 'RESOLVED',
    });
  });
});

describe('EscalationService — history', () => {
  test('filters history by manager id', () => {
    // Arrange
    escalationService.createEscalation({ taskId: 'TASK-001', escalatedBy: managerId });

    // Act
    const history = escalationService.listHistory({ managerId });

    // Assert
    expect(history).toHaveLength(1);
    expect(history[0].managerId).toBe(managerId);
  });

  test('filters history by status', () => {
    // Arrange
    const created = escalationService.createEscalation({
      taskId: 'TASK-001',
      escalatedBy: managerId,
    }).escalation;
    escalationService.updateStatus(created.id, 'RESOLVED', managerId);

    // Act
    const openHistory = escalationService.listHistory({ status: 'OPEN' });
    const resolvedHistory = escalationService.listHistory({ status: 'RESOLVED' });

    // Assert
    expect(openHistory).toHaveLength(0);
    expect(resolvedHistory).toHaveLength(1);
  });
});
