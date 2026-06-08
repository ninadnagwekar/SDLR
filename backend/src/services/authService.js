const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/env');
const userService = require('./userService');

/**
 * Authenticates credentials and issues a signed JWT.
 *
 * Data transformation flow:
 *   email → user lookup → bcrypt password compare
 *   → JWT payload { userId, email, role } → public user object
 *
 * @param {string} email
 * @param {string} password
 * @returns {{ success: true, token: string, user: object } | { success: false, error: string }}
 */
function login(email, password) {
  const user = userService.findByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return { success: false, error: 'Invalid email or password' };
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  return {
    success: true,
    token,
    user: userService.toPublicUser(user),
  };
}

/**
 * Validates a Bearer token from the Authorization header.
 * Used by authenticate() middleware before every protected route.
 *
 * @param {string} token - Raw JWT without "Bearer " prefix
 */
function verifyToken(token) {
  try {
    return { valid: true, payload: jwt.verify(token, config.jwtSecret) };
  } catch {
    return { valid: false, error: 'Invalid or expired token' };
  }
}

module.exports = { login, verifyToken };
