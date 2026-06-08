const { tasks } = require('./seed');
const auditService = require('../services/auditService');
const escalationService = require('../services/escalationService');
const notificationService = require('../services/notificationService');

const INITIAL_TASK_STATUS = {
  'TASK-001': 'PENDING',
  'TASK-002': 'IN_PROGRESS',
};

function resetTaskStates() {
  tasks.forEach((task) => {
    if (INITIAL_TASK_STATUS[task.id]) {
      task.status = INITIAL_TASK_STATUS[task.id];
    }
  });
}

function resetRuntimeStores() {
  auditService.auditLogs.length = 0;
  escalationService.escalations.length = 0;
  notificationService.notifications.length = 0;
  resetTaskStates();
}

module.exports = { resetRuntimeStores, resetTaskStates };
