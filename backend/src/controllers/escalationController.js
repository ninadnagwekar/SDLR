const escalationService = require('../services/escalationService');

function createEscalation(req, res) {
  const { taskId, reason } = req.body;
  if (!taskId) {
    return res.status(400).json({ error: 'taskId is required' });
  }

  const result = escalationService.createEscalation({
    taskId,
    reason,
    escalatedBy: req.user.userId,
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  return res.status(201).json(result.escalation);
}

function getHistory(req, res) {
  const { status } = req.query;
  const managerId = req.user.role === 'manager' ? req.user.userId : req.query.managerId;
  const history = escalationService.listHistory({ status, managerId });
  return res.json(history);
}

function updateStatus(req, res) {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'status is required' });
  }

  const result = escalationService.updateStatus(req.params.id, status, req.user.userId);
  if (!result.success) {
    const code = result.error === 'Escalation not found' ? 404 : 400;
    return res.status(code).json({ error: result.error });
  }

  return res.json(result.escalation);
}

module.exports = { createEscalation, getHistory, updateStatus };
