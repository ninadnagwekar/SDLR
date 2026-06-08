const express = require('express');
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

router.use(authenticate);

router.get('/', taskController.listTasks);
router.get('/overdue', authorize('manager', 'admin'), taskController.getOverdueTasks);
router.post('/', authorize('manager', 'admin'), taskController.createTask);

module.exports = router;
