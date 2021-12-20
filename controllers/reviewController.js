const bookModel = require("../models/bookModel");
const userModel = require("../models/userModel");
const reviewModel = require("../models/reviewModel");

//^^^^^^^^^^^^^^^^Adding the New Review data in database^^^^^^^^^^^^//
const addNewReview = async function (req, res) {
  try {
    const id = req.params.bookId;
    const info = await bookModel.findOne({ _id: id });
    
    if (!info) {
       return res.status(400).send({ status: false, msg: "Provide valid BookId" });
    }

    if (info.isDeleted == true) {
        res
          .status(404)
          .send({ status: false, msg: "This book is no longer Exists" });
      }

    let empInfo = {};
    const { reviewedBy, rating, review } = req.body;
    empInfo.bookId = id;
    empInfo.rating = rating;
    empInfo.review = review;
    empInfo.reviewedAt = Date();
    empInfo.reviewedBy = reviewedBy;

    info.reviews++;
    info.save();
    const saveData = await reviewModel.create(empInfo);
    const reviewData = await reviewModel
      .find({ bookId: id })
      .populate("bookId");
     return res
      .status(200)
      .send({ status: true, msg: "Review Added Successfully", reviewData });

  } catch (err) {
     return res.status(500).send({ status: false, msg: err.message });
  }
};

//^^^^^^^^^^^^^^Updating the Existing Review data of the client^^^^^^^^^^^^//
const updateReview = async function (req, res) {
  try {
    const booksId = req.params.bookId;
    const reviewId = req.params.reviewId;
    const bookData = await bookModel.findOne({ _id: booksId });
    if (!bookData) {
      return res.status(400).send({ status: false, msg: "Provide valid BookId" });
    }
    if (bookData.isDeleted == true) {
     return res
        .status(404)
        .send({ status: false, msg: "This book is no longer Exists" });
    }
    const reviewData = await reviewModel.findOne({ _id: reviewId });
    if (!reviewData) {
     return res.status(400).send({ status: false, msg: "provide valid reviewId" });
    }
    let update = req.body;
    if (update) {
      if (update.review) {
        reviewData.review = update.review;
      }
      if (update.rating) {
        reviewData.rating = update.rating;
      }
      if (update.reviewedBy) {
        reviewData.reviewedBy = update.reviewedBy;
      }
      reviewData.save(); //saving all data what we changing in this controller
    } else {
      return res
        .status(404)
        .send({ status: false, msg: "Please provide data to update" });
    }
    return res
      .status(200)
      .send({ status: true, msg: "SuccessFully Updated", reviewData });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

//^^^^^^^^^^^^^^^Delete Existing Review Data^^^^^^^^^^^^^^//

const deleteReview = async function (req, res) {
  try {
    const booksIdInfo = req.params.bookId;
    const reviewIdInfo = req.params.reviewId;
    const findBookData = await bookModel.findOne({ _id: booksIdInfo });
    if (!findBookData) {
      return res
        .status(404)
        .send({ status: false, msg: "Please Provide Valid BookId" });
    }
    if (findBookData.isDeleted == true) {
        return res
        .status(404)
        .send({ status: false, msg: "This book is no Longer Present" });
    }
    const findReviewData = await reviewModel.findOne({ _id: reviewIdInfo });
    if (!findReviewData) {
        return res
        .status(404)
        .send({ status: false, msg: "Please Provide Valid Review Data" });
    }
    findReviewData.isDeleted = true;
    findBookData.reviews--;
    
    findBookData.save()
    findReviewData.save();
    
    return res.status(200).send({ status: true, msg: "Review SuccessFully Deleted" });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};
module.exports.addNewReview = addNewReview;
module.exports.updateReview = updateReview;
module.exports.deleteReview = deleteReview;
