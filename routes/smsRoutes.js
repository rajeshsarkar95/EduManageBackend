const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/smsController');
const { protect, authorize } = require('../middleware/auth');
router.use(protect);
router.get('/stats',  ctrl.getSmsStats);
router.get('/logs',   ctrl.getSmsLogs);
router.post('/send',  authorize('admin'), ctrl.sendManualSMS);
module.exports = router;
