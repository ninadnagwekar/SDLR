const notificationService = require('../services/notificationService');

function trigger(req, res) {
  const { escalationId } = req.body;
  if (!escalationId) {
    return res.status(400).json({ error: 'escalationId is required' });
  }

  const result = notificationService.triggerNotification({
    escalationId,
    triggeredBy: req.user.userId,
  });

  if (!result.success) {
    const code = result.error === 'Escalation not found' ? 404 : 400;
    return res.status(code).json({ error: result.error });
  }

  return res.json({
    success: true,
    message: 'Notification sent',
    notification: result.notification,
  });
}

function list(req, res) {
  const recipientId = req.user.role === 'manager' ? req.user.userId : undefined;
  const notifications = notificationService.listNotifications({ recipientId });
  return res.json(notifications);
}

module.exports = { trigger, list };
