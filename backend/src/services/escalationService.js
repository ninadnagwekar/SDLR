const { uuid } = require('../data/seed');
const taskService = require('./taskService');
const userService = require('./userService');
const auditService = require('./auditService');

const escalations = [];

function findById(id) {
  return escalations.find((e) => e.id === id) || null;
}

function findByTaskId(taskId) {
  return escalations.find((e) => e.taskId === taskId && e.status !== 'CLOSED') || null;
}

function listHistory({ status, managerId } = {}) {
  return escalations
    .filter((e) => {
      if (status && e.status !== status) return false;
      if (managerId && e.managerId !== managerId) return false;
      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

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
