const { v4: uuid } = require('uuid');

const auditLogs = [];

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

function getLogs({ userId, action } = {}) {
  return auditLogs.filter((log) => {
    if (userId && log.userId !== userId) return false;
    if (action && log.action !== action) return false;
    return true;
  });
}

module.exports = { logEvent, getLogs, auditLogs };
