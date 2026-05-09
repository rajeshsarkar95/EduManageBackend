// // classRoutes.js
// const express = require('express');
// const router  = express.Router();
// const ctrl = require('../controllers/classController');
// const { protect, authorize } = require('../middleware/auth');


// router.use(protect);
// router.get('/',      ctrl.getClasses);
// router.post('/',     authorize('admin'), ctrl.createClass);
// router.get('/:id',   ctrl.getClass);
// router.put('/:id',   authorize('admin'), ctrl.updateClass);
// router.delete('/:id',authorize('admin'), ctrl.deleteClass);
// module.exports = router;

const express = require('express');
const router  = express.Router();
const ctrl = require('../controllers/classController');
const {protect,authorize} = require('../middleware/auth');

// router.use(protect);

router.get('/',ctrl.getClasses);
router.post('/',ctrl.createClass);
router.get('/:id',ctrl.getClass);
router.put('/:id',ctrl.updateClass);
router.delete('/:id',ctrl.deleteClass);

module.exports = router;
 