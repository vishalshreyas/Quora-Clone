const questionModel = require("../models/questionModel")
const userModel = require("../models/userModel")
const answerModel = require("../models/answerModel")
const mongoose = require('mongoose')






const postAnswer = async function (req, res){
    try{

        let data = req.body
        let userIdFromToken = req.userId
        
        if(!validator.isValidRequestBody(data)){
            return res.status(400).send({status:false, message:'Invalid request parameters. Please provide user details.'})
        }

        let {answeredBy,text,questionId} = data

        //Basic Validation starts
        if(!validator.isValid(answeredBy)){
            return res.status(400).send({status:false, message:'Invalid request parameters. Please provide User ID.'})
        }

        if(!validator.isValid(text)){
            return res.status(400).send({status:false, message:'Invalid request parameters. Please provide Text.'})
        }

        if(!validator.isValid(questionId)){
            return res.status(400).send({status:false, message:'Invalid request parameters. Please provide Question ID.'})
        }

        //Authorization
        if (answeredBy != userIdFromToken) {
            return res.status(401).send({status: false,message: `Unauthorized access! ${answeredBy} is not a logged in user.`});
        }

        
        //ObjectId Validation
        
        if(!validator.isValidObjectId(answeredBy)){
            return res.status(400).send({status:false, message:'Invalid request parameters. Please provide a valid User ID.'})
        }

        if(!validator.isValidObjectId(questionId)){
            return res.status(400).send({status:false, message:'Invalid request parameters. Please provide a valid Question ID.'})
        }

        // User and Question ID Validation
        let user = await userModel.findOne({_id: answeredBy}) 
        let question = await questionModel.findOne({_id: questionId})
        
        
        if (!user) {
            return res.status(400).send({status: false,message: "User doesn't exist"});
        }

        if (!question) {
            return res.status(400).send({status: false,message: "Question doesn't exist"});
        }

        if(question.askedBy.toString() === answeredBy.toString()){
            return res.status(400).send({status: false,message: "Question cannot be answered by the person who asked"});
        }

        // Validation Ends

       let creationResponse = await answerModel.create(data)

       let increaseCount = user.count + 200;
        if(creationResponse){
            await userModel.findOneAndUpdate({ _id: answeredBy },{count: increaseCount } );
        }
       
       return res.status(201).send({status: false, message: 'Answer created successfully', data: creationResponse})

    }catch(err){
        return res.status(500).send({status: false, message: err.message})
    }
}

const getAnswerByQuestionId = async function (req, res){
    try{
        let questionId = req.params.questionId

        if(!validator.isValidObjectId(questionId)){
            return res.status(400).send({status:false, message:'Invalid request parameters. Please provide a valid Question ID.'})
        }
        
        let question = await questionModel.findOne({_id: questionId})
        
        if(!question){
            return res.status(400).send({status: false, message: "Question ID doesn't exist"})
        }

        let responseAnswer = await answerModel.find({questionId: questionId}).select({ createdAt: 0, updatedAt: 0, __v: 0 });

        if(!Array.isArray(responseAnswer) && responseAnswer.length === 0){
            return res.status(400).send({status: false, message: "Answers doesn't exist for this question"})
        }

        return res.status(200).send({status: true, data: responseAnswer})
    }catch(error){
        return res.status(500).send({status: false, message: error.message})
    }
}

const updateAnswerById = async function (req, res){
    try{
        const answerId = req.params.answerId
        const requestBody = req.body
        const userIdFromToken = req.userId;

        if(!validator.isValidObjectId(answerId)){
            return res.status(400).send({status:false, message:'Invalid request parameters. Please provide a valid Answer ID.'})
        }

        let answer = await answerModel.findOne({_id: answerId, isDeleted: false}, {$and:[{price: {$gt:1000}},{price:}}])
        
        if(!answer){
            return res.status(400).send({status: false, message: "Answer doesn't exist"})
        }

        if(!validator.isValidRequestBody(requestBody)){
            return res.status(400).send({status:false, message:'Invalid request parameters. Please provide text to update.'})
        }

        if (answer.answeredBy != userIdFromToken) {
            return res.status(401).send({status: false,message: `Unauthorized access! ${answeredBy} is not a logged in user.`});
        }

        let {text} = requestBody

        if(!validator.isValid(text)){
            return res.status(400).send({status:false, message:'Invalid request parameters. Please provide Text.'})
        }

        let updatedAnswer = await answerModel.findOneAndUpdate({_id: answerId}, {text:text}, {new:true})

        return res.status(202).send({status: true,message: 'Answer updated successfully', data: updatedAnswer})

    }catch(error){
        return res.status(500).send({status: false, message: error.message})
    }
}

const deleteAnswerById = async function (req, res){
    try{
        
        let answerId = req.params.answerId

        if(!validator.isValidObjectId(answerId)){
            return res.status(400).send({status:false, message:'Invalid request parameters. Please provide a valid Answer ID.'})
        }
        let answer = await answerModel.findOne({_id: answerId, isDeleted: false})

        if(!answer){
            return res.status(400).send({status: false, message: "Answer doesn't exist"})
        }

        if (answer.answeredBy != userIdFromToken) {
            return res.status(401).send({status: false,message: `Unauthorized access! ${answeredBy} is not a logged in user.`});
        }

        const deleteAnswer = await answerModel.findOneAndUpdate({ _id: answerId },{ $set: { isDeleted: true, deletedAt: new Date() } });

        if(!deleteAnswer){
            return res.status(400).send({status: false, message: "Answer doesn't exist"})
        }

        return res.status(400).send({status: false, message: "Answer deleted successfully"})

    }catch(error){
        return res.status(500).send({status:false, message: error.message})
    }
}

module.exports = {postAnswer,getAnswerByQuestionId,updateAnswerById,deleteAnswerById}