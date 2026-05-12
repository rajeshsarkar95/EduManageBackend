// const express = require('express');
// const router  = express.Router();
// const ctrl    = require('../controllers/feeController');
// const { protect, authorize } = require('../middleware/auth');
// router.use(protect);
// router.get('/stats',               ctrl.getFeeStats);
// router.post('/send-reminders',     authorize('admin'), ctrl.sendFeeReminders);
// router.get('/',                    ctrl.getFees);
// router.post('/',   authorize('admin'), ctrl.createFee);
// router.get('/:id',                 ctrl.getFee);
// router.post('/:id/pay',            ctrl.recordPayment);
// module.exports = router;

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/feeController');
// const { protect, authorize } = require('../middleware/auth');
// router.use(protect);

router.get('/stats',ctrl.getFeeStats);
router.post('/send-reminders',ctrl.sendFeeReminders);
router.get('/',ctrl.getFees);
router.post('/',ctrl.createFee);
router.get('/:id',ctrl.getFee);
router.post('/:id/pay',ctrl.recordPayment);

module.exports = router;
