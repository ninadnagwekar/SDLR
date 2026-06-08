const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');

const pastDue = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
const futureDue = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

const adminId = 'USR-ADMIN';
const managerId = 'USR-MANAGER';
const employeeId = 'USR-EMPLOYEE';

const users = [
  {
    id: adminId,
    email: 'admin@example.com',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'admin',
  },
  {
    id: managerId,
    email: 'manager@example.com',
    passwordHash: bcrypt.hashSync('manager123', 10),
    role: 'manager',
  },
  {
    id: employeeId,
    email: 'employee@example.com',
    passwordHash: bcrypt.hashSync('employee123', 10),
    role: 'employee',
  },
];

const tasks = [
  {
    id: 'TASK-001',
    title: 'Submit quarterly report',
    description: 'Compile Q1 metrics and submit to leadership',
    assigneeId: employeeId,
    managerId,
    dueDate: pastDue,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'TASK-002',
    title: 'Review vendor contract',
    description: 'Legal review of updated vendor terms',
    assigneeId: employeeId,
    managerId,
    dueDate: futureDue,
    status: 'IN_PROGRESS',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

module.exports = { users, tasks, adminId, managerId, employeeId, uuid };
