const { tasks, uuid } = require('../data/seed');

function isOverdue(task) {
  if (task.status === 'COMPLETED') return false;
  return new Date(task.dueDate) < new Date();
}

function refreshOverdueStatus() {
  tasks.forEach((task) => {
    if (isOverdue(task) && task.status !== 'COMPLETED') {
      task.status = 'OVERDUE';
      task.updatedAt = new Date().toISOString();
    }
  });
}

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
