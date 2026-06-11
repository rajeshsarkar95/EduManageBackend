const express = require('express');
const router  = express.Router();
const { getRoutes, getRoute, createRoute, updateRoute, deleteRoute, assignStudent } = require('../controllers/otherControllers');
const { protect, authorize } = require('../middleware/auth');
router.use(protect);
router.get('/',                    getRoutes);
router.post('/',                   authorize('admin'), createRoute);
router.get('/:id',                 getRoute);
router.put('/:id',                 authorize('admin'), updateRoute);
router.delete('/:id',              authorize('admin'), deleteRoute);
router.post('/:id/assign-student', authorize('admin'), assignStudent);
module.exports = router;




