const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const userModel = require('../models/userModel')
const validator = require('../validators/validator')
const bcrypt = require('bcryptjs')
const saltRounds = 10

const register = async function (req, res){
    try{

        let data = req.body
        
        if(!validator.isValidRequestBody(data)){
            return res.status(400).send({status:false, message:'Invalid request parameters. Please provide user details.'})
        }

        let {fname,lname,email,phone,password} = data

        //Basic Validation starts
        if(!validator.isValid(fname)){
            return res.status(400).send({status:false, message:'Invalid request parameters. Please provide First name.'})
        }

        if(!validator.isValid(lname)){
            return res.status(400).send({status:false, message:'Invalid request parameters. Please provide Last name.'})
        }

        if(!validator.isValid(email)){
            return res.status(400).send({status:false, message:'Invalid request parameters. Please provide E-Mail address.'})
        }

        if(!validator.isValid(phone)){
            return res.status(400).send({status:false, message:'Invalid request parameters. Please provide Phone number.'})
        }

        if(!validator.isValid(password)){
            return res.status(400).send({status:false, message:'Invalid request parameters. Please provide Password.'})
        }
        
        //Email and Phone Number Regex Validation
        let phoneTrim = String(phone).trim()
        let emailTrim = email.trim()
        if(!/^[0-9]\d{9}$/gi.test(phoneTrim)){
            return res.status(400).send({ status:false, message: 'Phone number should be a valid Indian number'})
        }

        if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailTrim)){
            return res.status(400).send({ status:false, message: 'Enter a valid E-mail ID'})
        }
        
        // Unique Validation
        const phoneNumberAlreadyUsed = await userModel.findOne({ phone: phoneTrim });

        if (phoneNumberAlreadyUsed) {
            return res.status(400).send({status: false,message: `${phoneTrim} Phone number is already registered`});
        }

        const isEmailAlreadyUsed = await userModel.findOne({ email: emailTrim });

        if (isEmailAlreadyUsed) {
            return res.status(400).send({status: false,message: `${emailTrim} email address is already registered`});
        }

        //Password Validation

        if(!(validator.isValidPassword(password))){
            return res.status(400).send({status: false, message: 'Password should be between 8 and 15 characters'})
        }

        // Validation Ends

        password = await bcrypt.hash(password, saltRounds)

        let storeData = {fname:fname, lname:lname, email:email, phone:phone, password:password}
        
       let creationResponse = await userModel.create(storeData)
       
       return res.status(201).send({status: true, message: 'User created successfully', data: creationResponse})
    }catch(err){
        return res.status(500).send({status: false, message: err.message})
    }
}

const login = async function (req,res){
    try{
        let requestBody = req.body
        //Validation starts
        
        if(!validator.isValidRequestBody(requestBody)){
            return res.status(400).send({status: false, message:'Please enter login credentials'})
        }

        let{ email, password} = requestBody

        if(!validator.isValid(email)){
            res.status(400).send({status:false, message:'Enter an Email ID'})
        }

        let emailTrim = email.trim()

        if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailTrim)){
            return res.status(400).send({ status:false, message: 'Enter a valid E-mail ID'})
        }

        if(!validator.isValid(password)){
            res.status(400).send({status:false, message:'Enter a Password'})
        }

        if(!(validator.isValidPassword(password))){
            return res.status(400).send({status: false, message: 'Password should be between 8 and 15 characters'})
        }

        const user = await userModel.findOne({email: email})

        if (!user) {
            return res.status(401).send({ status: false, msg: " Either email or password incorrect" });
        }

        const extractPassword = await userModel.findOne({email : email})
        
        let hash = extractPassword.password

        let actualPassword = await bcrypt.compare(password, hash)
        
        if(!actualPassword){
            return res.status(400).send({ status: false, message: "Password Incorrect" })
        }

        const token = jwt.sign({ userId: user._id, iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 10 * 60 * 60 }, 'project-6-quora')

        res.header('BearerToken', token)
        return res.status(200).send({status:true, message: 'Successful Login', data:{ userId: user._id, token : token }})

    }catch(err){
        return res.status(500).send({status: false, message: err.message})
    }
}

const getProfileById = async function(req,res){
    try{
        
        const userId = req.params.userId
        const userIdFromToken = req.userId

        if (!validator.isValidObjectId(userId)) {
            return res
              .status(400)
              .send({ status: false, message: "Invalid userId in params." });
        }

        if (userId != userIdFromToken) {
            return res.status(401).send({status: false,message: `Unauthorized access! ${userId} is not a logged in user.`});
        }

        const userExists = await userModel.findOne({userId : userId})

        if(!userExists){
            return res.status(400).send({status: false, message: "User doesn't exist"})
        }

        return res.status(200).send({status:true, data: userExists})
    }catch(error){
        return res.status(500).send({ status: false, message: error.message})
    }
}

const updateProfileById = async function(req,res){
    try{
        const userId = req.params.userId
        const requestBody = req.body
        const userIdFromToken = req.userId


        //Validation starts
        if(!validator.isValidRequestBody(requestBody)){
            return res.status(400).send({status:false, message:'Invalid request parameters. Please provide user details.'})
        }

        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userId in params." });
        }

        if (userId.toString() != userIdFromToken) {
            return res.status(401).send({status: false,message: `Unauthorized access! ${userId} is not a logged in user.`});
        }

        const userExists = await userModel.findOne({userId : userId})

        if(!userExists){
            return res.status(400).send({status: false, message: "User doesn't exist"})
        }
        const { firstName, lastName, email, phone} = requestBody
        
        let filterQuery = {}

        if(validator.isValid(firstName)){
            
            if(!validator.isValid(firstName)){
                return res.status(400).send({status:false, message:'Invalid request parameters. Please provide First name.'})
            }

            if (!filterQuery.hasOwnProperty['fname']) {
                filterQuery['fname'] = firstName
            }
            
        }
        
        if(validator.isValid(lastName)){
            
            if(!validator.isValid(lastName)){
                return res.status(400).send({status:false, message:'Invalid request parameters. Please provide Last name.'})
            }

            if (!filterQuery.hasOwnProperty['lname']) {
                filterQuery['lname'] = lastName
            }
            
        }

        if(validator.isValid(email)){
            
            if(!validator.isValid(email)){
                return res.status(400).send({status:false, message:'Invalid request parameters. Please provide Email ID.'})
            }

            let emailTrim = email.trim()

            if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailTrim)){
                return res.status(400).send({ status:false, message: 'Enter a valid E-mail ID'})
            }

            const isEmailAlreadyUsed = await userModel.findOne({ email: emailTrim });

            if (isEmailAlreadyUsed) {
                return res.status(400).send({status: false,message: `${emailTrim} email address is already registered`});
            }

            if (!filterQuery.hasOwnProperty['email']) {
                filterQuery['email'] = email
            }
            
        }

        if(validator.isValid(phone)){
            
            if(!validator.isValid(phone)){
                return res.status(400).send({status:false, message:'Invalid request parameters. Please provide Phone Number.'})
            }

            let phoneTrim = String(phone).trim()

            if(!/^[0-9]\d{9}$/gi.test(phoneTrim)){
                return res.status(400).send({ status:false, message: 'Phone number should be a valid Indian number'})
            }
    

            const phoneNumberAlreadyUsed = await userModel.findOne({ phone: phoneTrim });

            if (phoneNumberAlreadyUsed) {
                return res.status(400).send({status: false,message: `${phoneTrim} Phone number is already registered`});
            }

            if (!filterQuery.hasOwnProperty['phone']) {
                filterQuery['phone'] = phone
            }
        }
        
        const updateData = await userModel.findOneAndUpdate({_id: userId},filterQuery,{new:true})
        return res.status(202).send({status: true,message: 'Success', data: updateData})
    }catch(error){
        return res.status(500).send({ status: false, message: error.message})
    }
}

module.exports = {register, login, getProfileById, updateProfileById}