const notificationService = require('../services/notificationService');

/**
 * POST /api/notifications/trigger
 * Sends a manager notification for an existing escalation.
 *
 * Request body:  { escalationId: string }
 * Response 200: { success, message, notification }
 * Response 404: escalation not found
 */
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

/**
 * GET /api/notifications
 * Managers receive only their own notifications; admins see all.
 */
function list(req, res) {
  const recipientId = req.user.role === 'manager' ? req.user.userId : undefined;
  const notifications = notificationService.listNotifications({ recipientId });
  return res.json(notifications);
}

module.exports = { trigger, list };
