const express = require('express')
const router = express.Router()

const userController = require('../controllers/userController')
const questionController = require('../controllers/questionController')
const answerController = require('../controllers/answerController')
const Authentication = require('../middlewares/authenticate')

//User APIs
router.post('/register', userController.register)
router.post('/login', userController.login)
router.get('/user/:userId/profile',Authentication.authenticate, userController.getProfileById)
router.put('/user/:userId/profile',Authentication.authenticate,userController.updateProfileById)

//Question APIs
router.post('/question', Authentication.authenticate, questionController.postQuestion)
router.get('/questions', questionController.getQuestions)
router.get('/questions/:questionId', questionController.getQuestionById)
router.put('/questions/:questionId', Authentication.authenticate, questionController.updateQuestionbyId)
router.delete('/questions/:questionId', Authentication.authenticate, questionController.deleteById)

//Answer APIs
router.post('/answer', Authentication.authenticate, answerController.postAnswer)
router.get('/questions/:questionId/answer', answerController.getAnswerByQuestionId)
router.put('/answer/:answerId', Authentication.authenticate, answerController.updateAnswerById)
router.delete('/answers/:answerId', Authentication.authenticate, answerController.deleteAnswerById)


module.exports = router