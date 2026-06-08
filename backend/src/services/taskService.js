const { tasks, uuid } = require('../data/seed');

/**
 * Determines whether a task has passed its due date.
 * Completed tasks are never treated as overdue regardless of dueDate.
 */
function isOverdue(task) {
  if (task.status === 'COMPLETED') return false;
  return new Date(task.dueDate) < new Date();
}

/**
 * Mutates task statuses in-place before reads.
 * Transforms PENDING/IN_PROGRESS tasks past dueDate into OVERDUE.
 * Called before every query so list endpoints return current state
 * without a background scheduler.
 */
function refreshOverdueStatus() {
  tasks.forEach((task) => {
    if (isOverdue(task) && task.status !== 'COMPLETED') {
      task.status = 'OVERDUE';
      task.updatedAt = new Date().toISOString();
    }
  });
}

/**
 * @param {{ assigneeId?: string, status?: string }} filters
 * Employees are scoped to their own tasks; managers/admins see all unless filtered.
 */
function listTasks({ assigneeId, status } = {}) {
  refreshOverdueStatus();
  return tasks.filter((task) => {
    if (assigneeId && task.assigneeId !== assigneeId) return false;
    if (status && task.status !== status) return false;
    return true;
  });
}

function findById(id) {
  refreshOverdueStatus();
  return tasks.find((t) => t.id === id) || null;
}

function getOverdueTasks() {
  refreshOverdueStatus();
  return tasks.filter((t) => t.status === 'OVERDUE');
}

/**
 * Gate used by the escalation engine before creating a record.
 * Returns a structured result so callers can surface specific rejection reasons.
 *
 * @param {object|null} task
 * @returns {{ eligible: true } | { eligible: false, reason: string }}
 */
function isEligibleForEscalation(task) {
  refreshOverdueStatus();
  if (!task) return { eligible: false, reason: 'Task not found' };
  if (task.status === 'COMPLETED') {
    return { eligible: false, reason: 'Completed tasks cannot be escalated' };
  }
  if (!isOverdue(task)) {
    return { eligible: false, reason: 'Task is not overdue' };
  }
  return { eligible: true };
}

/**
 * Transforms API payload into a persisted task entity with generated id and timestamps.
 */
function createTask(payload) {
  const task = {
    id: uuid(),
    title: payload.title,
    description: payload.description || '',
    assigneeId: payload.assigneeId,
    managerId: payload.managerId,
    dueDate: payload.dueDate,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tasks.push(task);
  return task;
}

module.exports = {
  listTasks,
  findById,
  getOverdueTasks,
  isEligibleForEscalation,
  createTask,
  isOverdue,
};
