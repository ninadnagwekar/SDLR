const authService = require('../services/authService');
const auditService = require('../services/auditService');

/**
 * POST /api/auth/login
 * Public endpoint — authenticates user and issues a JWT.
 *
 * API integration flow:
 *   { email, password } → authService.login() → { token, user }
 *   → audit log (USER_LOGIN)
 *
 * Response 200: { token: string, user: { id, email, role } }
 * Response 401: invalid credentials
 */
function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const result = authService.login(email, password);
  if (!result.success) {
    return res.status(401).json({ error: result.error });
  }

  auditService.logEvent('USER_LOGIN', result.user.id, { email });
  return res.json({ token: result.token, user: result.user });
}

module.exports = { login };
