/**
 * Role-Based Access Control middleware factory.
 *
 * Usage in routes:
 *   authorize('manager', 'admin') — allows manager OR admin
 *   authorize('admin')            — admin-only
 *
 * Expects req.user.role to be set by authenticate() middleware upstream.
 *
 * @param {...string} roles - Allowed role values: 'employee' | 'manager' | 'admin'
 * @returns {import('express').RequestHandler}
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = { authorize };
