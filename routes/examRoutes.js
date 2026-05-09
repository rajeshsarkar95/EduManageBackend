// const express = require('express');
// const router  = express.Router();
// const ctrl = require('../controllers/examController');

// const {protect,authorize} = require('../middleware/auth');
// router.use(protect);
// router.get('/',ctrl.getExams);
// router.post('/',authorize('admin'),ctrl.createExam);
// router.get('/:id',ctrl.getExam);
// router.put('/:id',authorize('admin'),ctrl.updateExam);
// router.delete('/:id',authorize('admin'),ctrl.deleteExam);

// module.exports = router;

const express = require('express');
const router  = express.Router();
const ctrl = require('../controllers/examController');

// const {protect,authorize} = require('../middleware/auth');
// router.use(protect);

router.get('/',ctrl.getExams);
router.post('/',ctrl.createExam);
router.get('/:id',ctrl.getExam);
router.put('/:id',ctrl.updateExam);
router.delete('/:id',ctrl.deleteExam);

module.exports = router;
