const auditService = require('../services/auditService');

function list(req, res) {
  const { action } = req.query;
  const logs = auditService.getLogs({ action });
  return res.json(logs);
}

module.exports = { list };
