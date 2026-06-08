const authService = require('../services/authService');

/**
 * JWT authentication middleware.
 *
 * API integration flow:
 *   Authorization: Bearer <token> → verifyToken() → req.user = { userId, email, role }
 *
 * Downstream controllers read req.user for RBAC scoping and audit attribution.
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const result = authService.verifyToken(header.slice(7));
  if (!result.valid) {
    return res.status(401).json({ error: result.error });
  }

  req.user = result.payload;
  next();
}

module.exports = { authenticate };
