const jwt = require('jsonwebtoken')

const authenticate = async (req, res, next) =>{
    try{
        const token = req.header('Authorization','Bearer Token')

        if(!token){
            return res.status(403).send({status:false, message:'Please provide token for authentication'})
        }

        let requiredToken = token.split(' ')

        let verifyToken = jwt.decode(requiredToken[1], 'ProjectQuora')

        //let verifyToken jwt.verify(requiredToken[1],'ProjectQuora')

        if(!requiredToken){
            return res.status(403).send({status:false, message:'Invalid authentication token'})
        }

        if(Date.now()>(verifyToken.exp)*1000){
            return res.status(404).send({status:false, message:'Session expired. Please Login again.'})
        }

        req.userId = verifyToken.userId

        next()

    }catch(error){
        return res.status(500).send({status:false, message: error.message})
    }
}

module.exports = {authenticate}