const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const reviewSchema = new mongoose.Schema({

    bookId:{
        type: ObjectId,
        ref: 'myBook',
        required: true,
        trim: true

    },

    reviewedBy:{
        type: String,
        required: true,
        default: "Guest",
        trim: true
    },

    reviewedAt:{
        type: Date,
        required: true,
        trim: true
    },

    rating: {
        type: Number,
        min: 1,
        max : 5,
        required: [true ,'Enter Rating'],
        trim: true
    },

    review: String,

    isDeleted:{
        type: Boolean,
        default: false,
        trim: true
    }



},{timestamps:true})

module.exports = mongoose.model('myReview',reviewSchema)