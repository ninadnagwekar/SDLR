const taskService = require('../services/taskService');
const auditService = require('../services/auditService');

function listTasks(req, res) {
  const { status } = req.query;
  const assigneeId = req.user.role === 'employee' ? req.user.userId : req.query.assigneeId;
  const tasks = taskService.listTasks({ assigneeId, status });
  return res.json(tasks);
}

function getOverdueTasks(req, res) {
  const tasks = taskService.getOverdueTasks();
  return res.json(tasks);
}

function createTask(req, res) {
  const { title, assigneeId, managerId, dueDate, description } = req.body;
  if (!title || !assigneeId || !managerId || !dueDate) {
    return res.status(400).json({ error: 'title, assigneeId, managerId, and dueDate are required' });
  }

  const task = taskService.createTask({
    title,
    assigneeId,
    managerId,
    dueDate,
    description,
  });

  auditService.logEvent('TASK_CREATED', req.user.userId, { taskId: task.id });
  return res.status(201).json(task);
}

module.exports = { listTasks, getOverdueTasks, createTask };
