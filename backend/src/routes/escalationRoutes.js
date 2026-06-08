const express = require('express');
const escalationController = require('../controllers/escalationController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('manager', 'admin'), escalationController.createEscalation);
router.get('/history', escalationController.getHistory);
router.put('/:id/status', authorize('manager', 'admin'), escalationController.updateStatus);

module.exports = router;
