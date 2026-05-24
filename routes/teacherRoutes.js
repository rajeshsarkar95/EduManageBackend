const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/teacherController');

// const {protect,authorize} = require('../middleware/auth');

// const upload  = require('../middleware/upload');

// router.use(protect);

router.get('/stats',ctrl.getStats);
router.get('/',ctrl.getTeachers);
router.post('/',ctrl.createTeacher);
router.get( '/:id',ctrl.getTeacher);
router.put( '/:id',ctrl.updateTeacher);
router.delete('/:id',ctrl.deleteTeacher);

module.exports = router;


