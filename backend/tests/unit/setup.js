/**
 * Unit test setup — Unit Testing Standards
 * - Deterministic: fixed UUID sequence, store reset before each test
 * - Isolated: no network, no filesystem, no timers
 */

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

const { v4: uuidV4 } = require('uuid');

const FIXED_IDS = [
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
];

let idIndex = 0;

function nextFixedId() {
  const id = FIXED_IDS[idIndex % FIXED_IDS.length];
  idIndex += 1;
  return id;
}

function resetFixedIds() {
  idIndex = 0;
  uuidV4.mockImplementation(() => nextFixedId());
}

const { tasks, managerId, employeeId, adminId } = require('../../src/data/seed');
const { resetRuntimeStores } = require('../../src/data/reset');

const INITIAL_TASK_STATUS = {
  'TASK-001': 'PENDING',
  'TASK-002': 'IN_PROGRESS',
};

function resetTaskStates() {
  tasks.forEach((task) => {
    if (INITIAL_TASK_STATUS[task.id]) {
      task.status = INITIAL_TASK_STATUS[task.id];
    }
  });
}

function resetUnitTestState() {
  resetFixedIds();
  resetRuntimeStores();
  resetTaskStates();
}

module.exports = {
  resetUnitTestState,
  FIXED_IDS,
  managerId,
  employeeId,
  adminId,
};
