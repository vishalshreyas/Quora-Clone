const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId
const questionSchema = new mongoose.Schema({
    
        description: {type: String, required: true},
        tag: [String],
        askedBy: {type: ObjectId , ref: 'user'},
        deletedAt: {type: Date, default: null}, 
        isDeleted: {type: Boolean, default: false}
      
}, {timestamps:true})
module.exports = mongoose.model('question', questionSchema)