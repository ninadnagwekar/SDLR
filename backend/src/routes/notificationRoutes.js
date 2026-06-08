const express = require('express');
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

router.use(authenticate);

router.get('/', notificationController.list);
router.post('/trigger', authorize('manager', 'admin'), notificationController.trigger);

module.exports = router;
