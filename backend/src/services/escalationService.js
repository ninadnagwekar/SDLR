const { uuid } = require('../data/seed');
const taskService = require('./taskService');
const userService = require('./userService');
const auditService = require('./auditService');

/** In-memory escalation store. Replace with PostgreSQL when DATABASE_URL is configured. */
const escalations = [];

function findById(id) {
  return escalations.find((e) => e.id === id) || null;
}

/**
 * Finds a non-closed escalation for a task.
 * CLOSED escalations are ignored so a new escalation can be opened later.
 */
function findByTaskId(taskId) {
  return escalations.find((e) => e.taskId === taskId && e.status !== 'CLOSED') || null;
}

/**
 * Returns escalation history sorted newest-first.
 * Supports optional filters for manager dashboards and status views.
 *
 * @param {{ status?: string, managerId?: string }} filters
 * @returns {object[]}
 */
function listHistory({ status, managerId } = {}) {
  return escalations
    .filter((e) => {
      if (status && e.status !== status) return false;
      if (managerId && e.managerId !== managerId) return false;
      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Creates an escalation after validating task eligibility.
 *
 * Data transformation flow:
 *   taskId → task lookup → eligibility check → manager validation
 *   → escalation record → audit log (ESCALATION_CREATED)
 *
 * @param {{ taskId: string, reason?: string, escalatedBy: string }} input
 * @returns {{ success: true, escalation: object } | { success: false, error: string }}
 */
function createEscalation({ taskId, reason, escalatedBy }) {
  const task = taskService.findById(taskId);
  const eligibility = taskService.isEligibleForEscalation(task);
  if (!eligibility.eligible) {
    return { success: false, error: eligibility.reason };
  }

  const existing = findByTaskId(taskId);
  if (existing) {
    return { success: false, error: 'An active escalation already exists for this task' };
  }

  const manager = userService.findById(task.managerId);
  if (!manager || manager.role !== 'manager') {
    return { success: false, error: 'Task manager not found' };
  }

  const escalation = {
    id: uuid(),
    taskId,
    escalatedBy,
    managerId: task.managerId,
    reason: reason || 'Task overdue',
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  escalations.push(escalation);
  auditService.logEvent('ESCALATION_CREATED', escalatedBy, {
    escalationId: escalation.id,
    taskId,
  });

  return { success: true, escalation };
}

/**
 * Transitions escalation status and records before/after values in the audit trail.
 *
 * @param {string} id - Escalation UUID
 * @param {'OPEN'|'IN_PROGRESS'|'RESOLVED'|'CLOSED'} status
 * @param {string} userId - Acting user from JWT payload
 */
function updateStatus(id, status, userId) {
  const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
  if (!validStatuses.includes(status)) {
    return { success: false, error: 'Invalid status' };
  }

  const escalation = findById(id);
  if (!escalation) {
    return { success: false, error: 'Escalation not found' };
  }

  const previousStatus = escalation.status;
  escalation.status = status;
  escalation.updatedAt = new Date().toISOString();

  auditService.logEvent('ESCALATION_STATUS_UPDATED', userId, {
    escalationId: id,
    previousStatus,
    newStatus: status,
  });

  return { success: true, escalation };
}

module.exports = {
  createEscalation,
  updateStatus,
  listHistory,
  findById,
  escalations,
};
