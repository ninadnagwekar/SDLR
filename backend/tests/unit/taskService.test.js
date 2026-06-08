/**
 * Unit tests: Escalation eligibility validation (task layer)
 * Standard: Arrange → Act → Assert | Deterministic | No I/O
 */
const { resetUnitTestState } = require('./setup');
const taskService = require('../../src/services/taskService');

beforeEach(() => {
  resetUnitTestState();
});

describe('TaskService — escalation eligibility', () => {
  test('marks overdue pending task as eligible', () => {
    // Arrange
    const task = taskService.findById('TASK-001');

    // Act
    const result = taskService.isEligibleForEscalation(task);

    // Assert
    expect(result.eligible).toBe(true);
  });

  test('rejects task that is not overdue', () => {
    // Arrange
    const task = taskService.findById('TASK-002');

    // Act
    const result = taskService.isEligibleForEscalation(task);

    // Assert
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('Task is not overdue');
  });

  test('rejects completed tasks', () => {
    // Arrange
    const task = taskService.findById('TASK-001');
    task.status = 'COMPLETED';

    // Act
    const result = taskService.isEligibleForEscalation(task);

    // Assert
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('Completed tasks cannot be escalated');
  });

  test('rejects when task is null', () => {
    // Arrange
    const task = null;

    // Act
    const result = taskService.isEligibleForEscalation(task);

    // Assert
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('Task not found');
  });
});

describe('TaskService — overdue detection', () => {
  test('returns only overdue tasks', () => {
    // Arrange
    // seed contains TASK-001 (past due) and TASK-002 (future due)

    // Act
    const overdue = taskService.getOverdueTasks();

    // Assert
    expect(overdue).toHaveLength(1);
    expect(overdue[0].id).toBe('TASK-001');
    expect(overdue[0].status).toBe('OVERDUE');
  });
});
