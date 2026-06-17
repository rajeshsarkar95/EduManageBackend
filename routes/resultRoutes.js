// const express = require('express');
// const router  = express.Router();
// const ctrl    = require('../controllers/resultController');
// const {protect,authorize} = require('../middleware/auth');

// router.use(protect);

// router.get('/',ctrl.getResults);
// router.post('/',authorize('admin'),ctrl.createResult);
// router.post('/bulk',authorize('admin'),ctrl.bulkCreateResults);
// router.put('/:id',authorize('admin'),ctrl.updateResult);
// router.get('/student/:studentId',ctrl.getStudentReport);

// module.exports = router;

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/resultController');
// const {protect,authorize} = require('../middleware/auth');

// router.use(protect);

router.get('/',ctrl.getResults);
router.post('/',ctrl.createResult);
router.post('/bulk',ctrl.bulkCreateResults);
router.put('/:id',ctrl.updateResult);
router.get('/student/:studentId',ctrl.getStudentReport);

module.exports = router;
