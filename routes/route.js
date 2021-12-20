const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const bookController = require('../controllers/bookController');
const userController = require('../controllers/userController');
const reviewController = require('../controllers/reviewController');
const middleware = require('../middlewares/appMiddleware');

router.post('/RegisterUser', userController.RegisterUser)
router.post('/login', userController.Login)
router.post('/CreateBook', middleware.authenticate, bookController.CreateBook)
router.get('/getBooks', middleware.authenticate, bookController.getBooks)
router.get('/getBook/:bookId', middleware.authenticate, bookController.getBookById)
router.put('/books/:bookId', middleware.authenticate, bookController.updateBook)
router.delete('/books/:bookId', middleware.authenticate, bookController.deleteBookById)
router.post('/books/:bookId/review', reviewController.addNewReview)
router.put('/books/:bookId/review/:reviewId', reviewController.updateReview)
router.delete('/books/:bookId/review/:reviewId', reviewController.deleteReview)

module.exports = router