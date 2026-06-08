const { v4: uuid } = require('uuid');

/** Append-only audit trail. Entries are never updated or deleted. */
const auditLogs = [];

/**
 * Records a traceable user or system action.
 *
 * @param {string} action - Machine-readable event name (e.g. ESCALATION_CREATED)
 * @param {string|null} userId - JWT userId; null for system events
 * @param {object} [metadata] - Context payload stored as JSONB in PostgreSQL
 * @returns {{ id: string, action: string, userId: string|null, metadata: object, createdAt: string }}
 */
function logEvent(action, userId, metadata = {}) {
  const entry = {
    id: uuid(),
    action,
    userId: userId || null,
    metadata,
    createdAt: new Date().toISOString(),
  };
  auditLogs.push(entry);
  return entry;
}

/**
 * Retrieves audit entries with optional filters.
 * Admin API exposes unfiltered logs; filters support future scoped views.
 *
 * @param {{ userId?: string, action?: string }} filters
 */
function getLogs({ userId, action } = {}) {
  return auditLogs.filter((log) => {
    if (userId && log.userId !== userId) return false;
    if (action && log.action !== action) return false;
    return true;
  });
}

module.exports = { logEvent, getLogs, auditLogs };
