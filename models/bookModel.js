const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId
const bookSchema = new mongoose.Schema({

    title: {
        type: String,
        required: 'Enter a Title',
        unique: true,
        trim: true
    },

    excerpt: {
        type: String,
        required: 'Enter excerpt',
        trim: true
    },
    
    userId: {
        type: ObjectId,
        ref: 'myUser',
    
    },

    isbn: {
        type: String,
        required: 'Enter isbn',
        unique: true,
        trim: true
    },

    category: {
        type: String,
        required: 'Enter category',
        trim: true
    },

    subcategory: {
        type: String,
        required: 'Enter subcategory',
        trim: true
    },

    reviews: {
        type: Number,
        default: 0,
        trim: true
    },
    
    isDeleted:{
        type: Boolean,
        default: false,
        trim: true
    },

    deletedAt: {
        type:Date,

    },

    releasedAt: {
        type: String,
        required: 'Enter Release date',
        trim: true
    },
    



},{timestamps:true})

module.exports = mongoose.model('myBook',bookSchema)