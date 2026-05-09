// const express = require('express');
// const router  = express.Router();
// const {getBooks,getBook,createBook,updateBook,deleteBook,issueBook,returnBook} = require('../controllers/otherControllers');
// const {protect,authorize} = require('../middleware/auth');
// router.use(protect);
// router.get('/',getBooks);
// router.post('/',authorize('admin'),createBook);
// router.get('/:id',getBook);
// router.put('/:id',authorize('admin'),updateBook);
// router.delete('/:id',authorize('admin'),deleteBook);
// router.post('/:id/issue',issueBook);
// router.post('/:id/return',returnBook);
// module.exports = router;

const express = require('express');
const router  = express.Router();
const {getBooks,getBook,createBook,updateBook,deleteBook,issueBook,returnBook} = require('../controllers/otherControllers');
// const {protect,authorize} = require('../middleware/auth');
// router.use(protect);

router.get('/',getBooks);
router.post('/',createBook);
router.get('/:id',getBook);
router.put('/:id',updateBook);
router.delete('/:id',deleteBook);
router.post('/:id/issue',issueBook);
router.post('/:id/return',returnBook);

module.exports = router;
