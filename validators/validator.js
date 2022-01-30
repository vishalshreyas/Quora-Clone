const mongoose = require('mongoose')

const isValid = function(value){
    if(typeof value === 'undefined' || value === null || typeof value === 'number' ) return false
    if(typeof value === 'string' && value.trim().length === 0) return false
    return true
}
const isValidPassword = function (value) {
    if (typeof value === "string" && value.trim().length >= 8 && value.trim().length <= 15) return true;
    return false;
};

const isValidRequestBody = function (requestBody){
    return Object.keys(requestBody).length > 0
}

const isValidObjectId = function (ObjectId){
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

const validString = function (value) {
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};

module.exports = {isValid, isValidRequestBody, isValidPassword, isValidObjectId, validString}