const authService = require('../services/authService');
const auditService = require('../services/auditService');

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
