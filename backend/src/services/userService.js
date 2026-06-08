const { users } = require('../data/seed');

function findByEmail(email) {
  return users.find((u) => u.email === email) || null;
}

function findById(id) {
  return users.find((u) => u.id === id) || null;
}

function findByRole(role) {
  return users.filter((u) => u.role === role);
}

function toPublicUser(user) {
  return { id: user.id, email: user.email, role: user.role };
}

module.exports = { findByEmail, findById, findByRole, toPublicUser };
