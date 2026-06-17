// const express = require('express');
// const router  = express.Router();
// const ctrl    = require('../controllers/teacherController');

// const { protect, authorize } = require('../middleware/auth');

// router.use(protect);

// router.post('/',authorize('admin'), ctrl.createTeacher);
// router.put('/:id',authorize('admin'), ctrl.updateTeacher);
// router.delete('/:id',authorize('admin'), ctrl.deleteTeacher);
// router.get('/stats',ctrl.getStats);
// router.get('/',ctrl.getTeachers);
// router.get('/:id',ctrl.getTeacher);

// module.exports = router;


const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/teacherController');
// const { protect, authorize } = require('../middleware/auth');

// router.use(protect);

router.post('/', ctrl.createTeacher);
router.put('/:id',ctrl.updateTeacher);
router.delete('/:id',ctrl.deleteTeacher);
router.get('/stats',ctrl.getStats);
router.get('/',ctrl.getTeachers);
router.get('/:id',ctrl.getTeacher);

module.exports = router;