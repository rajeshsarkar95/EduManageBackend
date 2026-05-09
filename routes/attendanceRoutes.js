const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/',ctrl.markAttendance);
router.get('/',ctrl.getAttendance);
router.get('/report',ctrl.getMonthlyReport);
router.get('/student/:studentId',ctrl.getStudentAttendance);
module.exports = router;
