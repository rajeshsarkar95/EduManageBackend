// const express = require('express');
// const router  = express.Router();
// const ctrl    = require('../controllers/teacherController');
// const { protect, authorize } = require('../middleware/auth');
// const upload  = require('../middleware/upload');

// router.use(protect);

// router.get('/stats',ctrl.getStats);
// router.get('/',ctrl.getTeachers);
// router.post('/',authorize('admin'),upload.single('photo'),ctrl.createTeacher);
// router.get( '/:id',ctrl.getTeacher);
// router.put( '/:id',authorize('admin'), upload.single('photo'),ctrl.updateTeacher);
// router.delete('/:id',authorize('admin'), ctrl.deleteTeacher);

// module.exports = router;

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/teacherController');
// const { protect, authorize } = require('../middleware/auth');
const upload  = require('../middleware/upload');

// router.use(protect);

router.get('/stats',ctrl.getStats);
router.get('/',ctrl.getTeachers);
router.post('/',upload.single('photo'),ctrl.createTeacher);
router.get( '/:id',ctrl.getTeacher);
router.put( '/:id',upload.single('photo'),ctrl.updateTeacher);
router.delete('/:id',upload.single('photo'), ctrl.deleteTeacher);

module.exports = router;
