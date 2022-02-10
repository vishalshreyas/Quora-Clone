const questionModel = require('../models/questionModel');
const userModel = require('../models/userModel');
const answerModel = require('../models/answerModel');
const validator = require('../validators/validator')
const mongoose = require('mongoose')




const postQuestion = async function (req, res){
    try{

        let data = req.body
        const userIdFromToken = req.userId;
        
        if(!validator.isValidRequestBody(data)){
            return res.status(400).send({status:false, message:'Invalid request parameters. Please provide Question details.'})
        }

        const {description,tag,askedBy} = data

        //Basic Validation starts
        if(!validator.isValid(description)){
            return res.status(400).send({status:false, message:'Invalid request parameters. Please provide Description.'})
        }

        if(validator.isValid(tag)){
            if(!validator.isValid(tag)){
                return res.status(400).send({status:false, message:'Invalid request parameters. Please provide Tags.'})
            }
        }

        if(validator.isValid(askedBy)){
            if(!validator.isValid(askedBy)){
                return res.status(400).send({status:false, message:'Invalid request parameters. Please provide User ID'})
            }
        }

        //Authorization
        if (askedBy != userIdFromToken) {
            return res.status(401).send({status: false,message: "Unauthorized access! User's info doesn't match"});
        }


        
        //ObjectId Validation
        
        if(!validator.isValidObjectId(askedBy)){
            return res.status(400).send({status:false, message:'Invalid request parameters. Please provide a valid User ID.'})
        }

        // User ID and Count Validation
        let user = await userModel.findOne({_id: askedBy}) 
        
        if (!user) {
            return res.status(400).send({status: false,message: "User doesn't exist"});
        }

        if (user.count === 0) {
            return res.status(400).send({status: false,message: "Your count is 0, hence you cannot post a question."});
        }


        // Validation Ends

        if (tag) {
            const tagArr = tag.split(",").map((x) => x.trim());
            const uniqueTagArr = [...new Set(tagArr)];
            if (Array.isArray(tagArr)) {
              data['tag'] = uniqueTagArr;
            }
          }

       let creationResponse = await questionModel.create(data)
       
       const reduceCount = user.count - 100;

        if (creationResponse) {
            await userModel.findOneAndUpdate({ _id: askedBy },{ count: reduceCount });
        }
       
       return res.status(201).send({status: true, message: 'Question created successfully', data: creationResponse})

    }catch(err){
        return res.status(500).send({status: false, message: err.message})
    }
}

//Fetch all questions.
const getQuestions = async (req, res) => {
    try {
      let filterQuery = { isDeleted: false };
      let queryParams = req.query;
  
      let { tag, sort } = queryParams;
  
      if (validator.isValidRequestBody(queryParams)) {
        if (validator.isValid(tag)) {
          let tagsArray = tag.split(",").map((x) => x.trim());
          filterQuery["tag"] = { $all: tagsArray };
        }
  
        if (!validator.validString(tag)) {
          return res.status(400).send({
            status: false,
            message: "Tag is required.",
          });
        }
  
        if (!validator.validString(sort)) {
          return res.status(400).send({
            status: false,
            message: "Sort is required.",
          });
        }
  
        if (sort) {
          if (!(sort == "ascending" || sort == "descending")) {
            return res.status(400).send({
              message: "Only 'ascending' & 'descending' are allowed to sort.",
            });
          }
  
          const sortedQuestions = await questionModel
            .find(filterQuery)
            .sort({ createdAt: sort });

            console.log(typeof(sortedQuestions))
  
          if (Array.isArray(sortedQuestions) && sortedQuestions.length === 0) {
            return res
              .status(404)
              .send({ status: false, message: "No Questions found" });
          }

          for(let i = 0; i < sortedQuestions.length; i++){
            let answer = await answerModel.find({questionId: sortedQuestions[i]._id})
            sortedQuestions[i] = sortedQuestions[i].toObject()
            sortedQuestions[i]['answers'] = answer
          }
  
          return res.status(200).send({
            status: true,
            message: "Questions list",
            data: sortedQuestions,
          });
        }
  
        const findQuestionsByTag = await questionModel.find(filterQuery);

        for(let i = 0; i < findQuestionsByTag.length; i++){
          let answer = await answerModel.find({questionId: findQuestionsByTag[i]._id})
          findQuestionsByTag[i] = findQuestionsByTag[i].toObject()
          findQuestionsByTag[i]['answers'] = answer
        }

        return res.status(200).send({
          status: true,
          message: "Questions List",
          data: findQuestionsByTag,
        });
      }
      return res
        .status(400)
        .send({ status: false, message: "Invalid request query parameters." });
    } catch (err) {
      return res.status(500).send({ Error: err.message });
    }
  };
  
  //fetch questions by the question Id.
  const getQuestionById = async function (req, res) {
    try {
      const questionId = req.params.questionId;
  
      //Validation for the question Id.
      if (!validator.isValidObjectId(questionId)) {
        return res.status(400).send({
          status: false,
          message: `${questionId} is not a valid question id`,
        });
      }
  
      const findQuestion = await questionModel.findOne({
        _id: questionId,
        isDeleted: false,
      });
  
      if (!findQuestion) {
        return res.status(404).send({
          status: false,
          message: `No questions exists by ${questionId}`,
        });
      }
  
      const findAnswersOfThisQuestion = await answerModel
        .find({ questionId: questionId })
        .sort({ createdAt: -1 })
        .select({ createdAt: 0, updatedAt: 0, __v: 0 });
  
      const description = findQuestion.description;
      const tag = findQuestion.tag;
      const askedBy = findQuestion.askedBy;
  
      const structureForResponseBody = {
        description,
        tag,
        askedBy,
        answers: findAnswersOfThisQuestion,
      };
      return res.status(200).send({
        status: true,
        message: "Question fetched successfully.",
        data: structureForResponseBody,
      });
    } catch (err) {
      return res.status(500).send({ status: false, Error: err.message });
    }
  };
  
  //Update questions description & tag.
  const updateQuestionbyId = async (req, res) => {
    try {
      const questionId = req.params.questionId;
      let requestBody = req.body;
      let userIdFromToken = req.userId
      const { tag, description } = requestBody;
  
      //Validating questionId.
      if (!validator.isValidObjectId(questionId)) {
        return res.status(400).send({
          status: false,
          message: `${questionId} is invalid questionId in URL params.`,
        });
      }
  
      //Validating empty requestBody.
      if (!validator.isValidRequestBody(requestBody)) {
        return res.status(400).send({
          status: false,
          message: `Empty request body isn't valid for updatation.`,
        });
      }
  
      //validating tag.
      if (!validator.validString(tag)) {
        return res.status(400).send({
          status: false,
          message: "Tag cannot be empty for updatation.",
        });
      }
  
      //validating description
      if (!validator.validString(description)) {
        return res.status(400).send({
          status: false,
          message: `Description cannot be empty for updadtation.`,
        });
      }
  
      const question = await questionModel.findOne({
        _id: questionId,
        isDeleted: false,
      });
  
      if (!question) {
        return res.status(404).send({
          status: false,
          message: `Question doesn't exists by ${questionId}`,
        });
      }
  
      //Authentication & authorization
      let userId = question.askedBy;
      if (userId != userIdFromToken) {
        return res.status(401).send({
          status: false,
          message: `Unauthorized access! ${userId} is not a logged in user.`,
        });
      }
  
      //Setting description & tag to an empty object.
      const questionData = {};
      if (description) {
        if (!Object.hasOwnProperty(questionData, "$set"))
          questionData["$set"] = {};
        questionData["$set"]["description"] = description;
      }
      if (tag) {
        const tagArr = tag.split(",").map((x) => x.trim());
        const uniqueTagArr = [...new Set(tagArr)];
        if (Array.isArray(tagArr)) {
          questionData["tag"] = uniqueTagArr;
        }
      }
  
      questionData.updatedAt = new Date();
      const updateQuestion = await questionModel.findOneAndUpdate(
        { _id: questionId },
        questionData,
        { new: true }
      );
  
      return res.status(200).send({
        status: true,
        message: "Question updated successfully",
        data: updateQuestion,
      });
    } catch (err) {
      return res.status(500).send({ Error: err.message });
    }
  };
  
  //Delete questions -> isDeleted : true
  const deleteById = async (req, res) => {
    try {
      const questionId = req.params.questionId;
      let userIdFromToken = req.userId;
  
      //validation for questionId
      if (!validator.isValidObjectId(questionId)) {
        return res.status(400).send({
          status: false,
          message: `${questionId} is not a valid question id`,
        });
      }
  
      const findQuestion = await questionModel.findOne({
        _id: questionId,
      });
      if (!findQuestion) {
        return res.status(404).send({
          status: false,
          message: `Question not found for ${questionId}`,
        });
      }
  
      //Authentication & authorization
      let userId = findQuestion.askedBy;
      if (userId != userIdFromToken) {
        return res.status(401).send({
          status: false,
          message: `Unauthorized access! ${userId} is not a logged in user.`,
        });
      }
  
      if (findQuestion.isDeleted == true) {
        return res
          .status(404)
          .send({ status: false, message: `Question has been already deleted.` });
      }
  
      await questionModel.findOneAndUpdate(
        { _id: questionId },
        { $set: { isDeleted: true, deletedAt: new Date() } }
      );
      return res
        .status(204)
        .send({ status: true, message: `Question deleted successfully.` });
    } catch (err) {
      return res.status(500).send({ Error: err.message });
    }
  };

  module.exports = {postQuestion,getQuestions,getQuestionById,deleteById,updateQuestionbyId}