const { uuid } = require('../data/seed');
const escalationService = require('./escalationService');
const userService = require('./userService');
const auditService = require('./auditService');

const notifications = [];

function listNotifications({ recipientId, escalationId } = {}) {
  return notifications.filter((n) => {
    if (recipientId && n.recipientId !== recipientId) return false;
    if (escalationId && n.escalationId !== escalationId) return false;
    return true;
  });
}

function triggerNotification({ escalationId, triggeredBy }) {
  const escalation = escalationService.findById(escalationId);
  if (!escalation) {
    return { success: false, error: 'Escalation not found' };
  }

  const manager = userService.findById(escalation.managerId);
  if (!manager) {
    return { success: false, error: 'Manager not found' };
  }

  const notification = {
    id: uuid(),
    escalationId,
    recipientId: manager.id,
    message: `Escalation ${escalation.id} requires attention for task ${escalation.taskId}`,
    status: 'SENT',
    createdAt: new Date().toISOString(),
  };

  notifications.push(notification);
  auditService.logEvent('NOTIFICATION_TRIGGERED', triggeredBy, {
    escalationId,
    notificationId: notification.id,
    recipientId: manager.id,
  });

  return { success: true, notification };
}

module.exports = { triggerNotification, listNotifications, notifications };
