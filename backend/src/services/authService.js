const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/env');
const userService = require('./userService');

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

function verifyToken(token) {
  try {
    return { valid: true, payload: jwt.verify(token, config.jwtSecret) };
  } catch {
    return { valid: false, error: 'Invalid or expired token' };
  }
}

module.exports = { login, verifyToken };
