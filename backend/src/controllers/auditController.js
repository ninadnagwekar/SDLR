const auditService = require('../services/auditService');

/**
 * GET /api/audit
 * Admin-only endpoint. Returns append-only audit trail.
 *
 * Query params: action? — filter by event name (e.g. ESCALATION_CREATED)
 */
function list(req, res) {
  const { action } = req.query;
  const logs = auditService.getLogs({ action });
  return res.json(logs);
}

module.exports = { list };
