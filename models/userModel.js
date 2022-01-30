const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({

    fname: {type: String, required:true},
    lname: {type: String, required:true},
    email: {type: String, required:true, unique:true},  //validation
    phone: {type: String, unique:true },    //validation //unique
    password: {type: String, required:true, minLen: 8, maxLen: 15}, // encrypted password
    count: {type: Number, default: 500}
    

}, {timestamps:true})
module.exports = mongoose.model('user',userSchema)