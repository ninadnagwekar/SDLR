const auditService = require('../services/auditService');
const escalationService = require('../services/escalationService');
const notificationService = require('../services/notificationService');

function resetRuntimeStores() {
  auditService.auditLogs.length = 0;
  escalationService.escalations.length = 0;
  notificationService.notifications.length = 0;
}

module.exports = { resetRuntimeStores };
