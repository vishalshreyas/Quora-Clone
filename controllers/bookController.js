const bookModel = require("../models/bookModel");
const userModel = require("../models/userModel");
const reviewModel = require("../models/reviewModel");
const validator = require("../Validator/validator")

//^^^^^^^^^^^^^^^^^ Adding New Book in the Databases ^^^^^^^^^^^^^^^^^^^^^//
const CreateBook = async function (req, res) {
  try {
    let data = req.body;

    if (!validator.isValidRequestBody(data)) {
      return res.status(400).send({
        status: false,
        message: " Invalid request parameters. Please provide user details.",
      });
    }

    let {title, excerpt, isbn, category, subcategory, releasedAt, userId} = data

   
    

    if (!validator.isValid(title)) {
        return res.status(400).send({
          status: false,
          message: " Invalid request parameters. Please provide title",
        });
    }

    if (!validator.isValid(excerpt)) {
        return res.status(400).send({
          status: false,
          message: " Invalid request parameters. Please provide Name",
        });
    }

    if (!validator.isValid(isbn)) {
        return res.status(400).send({
          status: false,
          message: " Invalid request parameters. Please provide isbn",
        });
    }

    if (!validator.isValid(category)) {
        return res.status(400).send({
          status: false,
          message: " Invalid request parameters. Please provide category",
        });
    }

    if (!validator.isValid(subcategory)) {
        return res.status(400).send({
          status: false,
          message: " Invalid request parameters. Please provide subcategory",
        });
    }

    if (!validator.isValid(releasedAt)) {
        return res.status(400).send({
          status: false,
          message: " Invalid request parameters. Please provide releasedAt",
        });
    }

    if (!validator.isValid(userId)) {
      return res.status(400).send({
        status: false,
        message: " Invalid request parameters. Please provide User ID",
      });
    }

    if(data.isDeleted === true){
      return res.status(400).send({
        status: false,
        message: " Invalid request parameters. isDeleted cannot be true while registering",
      });
    }

    title = title.trim()
    excerpt = excerpt.trim()
    isbn = isbn.trim()
    category = category.trim()
    releasedAt = releasedAt.trim()

    const titleAlreadyUsed = await bookModel.findOne({ title: data.title });

    if (titleAlreadyUsed) {
      return res
        .status(400)
        .send({
          status: false,
          message: `${data.title} Title is already registered`,
        });
    }
    const isbnAlreadyUsed = await bookModel.findOne({ isbn: data.isbn });

    if (isbnAlreadyUsed) {
      return res
        .status(400)
        .send({
          status: false,
          message: `${data.isbn} ISBN is already registered`,
        });
    }

    let tokenId = req.user;

    let findValidId = await userModel.findById(userId);
    
    if (!findValidId) {
      return res.status(400).send({ msg: "The given USERID is INVALID" });
    }

    if (userId === tokenId) {
      let savedData = await bookModel.create(data);
      return res.status(201).send({ status: false, data: savedData });
    }

    return res
      .status(400)
      .send({ status: false, message: "Unauthorised access! Please login" });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

const getBooks = async function (req, res) {
  try {
    let body = req.query;

    
    body.isDeleted = false;

    let findSelectBooks = await bookModel
      .find(body)
      .select({ ISBN: 0, subcategory: 0, isDeleted: 0, deletedAt: 0 });
    
    if (!(findSelectBooks.length > 0)) {
      return res
        .status(404)
        .send({ status: false, msg: "No Books found in Our Database" });
    }

    let AlphabeticalSorting = findSelectBooks.sort(function (a, b) {
      if(a.title < b.title) { return -1; }
      if(a.title > b.title) { return 1; }
      return 0;
    });

    return res.status(200).send({ status: true, data: AlphabeticalSorting });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

const getBookById = async function (req, res) {
  try {
    const id = req.params.bookId;

    let ValidId = await bookModel.findById(id);
    
    if (!ValidId) {
      return res
        .status(404)
        .send({ status: false, msg: "Provide valid BookId" });
    }
    const reviewData = await reviewModel.find({ bookId: id }); //------Finding the review data Of particular book  ------
    if(!reviewData.length === 0){
      ValidId.reviewsData = reviewData;
    }else{
      ValidId.reviewsData = []
    }
    return res.status(200).send({ status: true, data: ValidId });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

const updateBook = async function (req, res) {
  try {
    let bookIdInfo = req.params.bookId;
    let tokenId = req.user;

    let info = await bookModel.findOne({ _id: bookIdInfo });

    if (!info) {
      return res
        .status(404)
        .send({ status: false, msg: "Please Provide Valid BookId" });
    }

    if (info.isDeleted == true) {
      return res
        .status(400)
        .send({ status: false, msg: "This book is no longer exists" });
    }

    if (info.userId === tokenId) {
      let update = req.body;

      if (!isValidRequestBody(update)) {
        return res.status(400).send({
          status: false,
          message: " Invalid request parameters. Please provide details.",
        });
      }

      const titleAlreadyUsed = await userModel.findOne({ title: update.title });

      if (titleAlreadyUsed) {
        return res
          .status(400)
          .send({
            status: false,
            message: `${update.title} Title is already registered`,
          });
      }
      const isbnAlreadyUsed = await userModel.findOne({ isbn: update.isbn });

      if (isbnAlreadyUsed) {
        return res
          .status(400)
          .send({
            status: false,
            message: `${update.isbn} ISBN is already registered`,
          });
      }

      if (update) {
        if (update.title) {
            
          info.title = update.title;
        }
        if (update.excerpt) {
          info.excerpt = update.excerpt;
        }
        if (update.releasedAt) {
          info.releasedAt = update.releasedAt;
        }
        if (update.isbn) {
          info.isbn = update.isbn;
        }
        info.save();
      } else {
        return res
          .status(404)
          .send({ status: false, msg: "Please provide details to Update" });
      }
      return res
        .status(202)
        .send({ status: true, msg: "Book Successfully Updated", data: info });
    }
    return res
      .status(400)
      .send({ status: false, message: "Unauthorised access! Please login" });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

const deleteBookById = async function (req, res) {
  try {
    const id = req.params.bookId;
    const tokenId = req.user;
    
    let findData = await bookModel.findOne({ _id: id });
    
    if (!findData) {
      return res
        .status(404)
        .send({ status: false, msg: "Please Provide valid Id" });
    }

    if (findData.isDeleted === true) {
      return res
        .status(404)
        .send({ status: false, msg: "This book is no longer Present" });
    }

    if (findData.userId === tokenId) {
      findData.isDeleted = true;
      findData.save();
      return res
        .status(200)
        .send({ status: true, msg: "Book SuccessFully deleted" });
    }
    return res
      .status(400)
      .send({ status: false, message: "Unauthorised access! Please login" });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

module.exports.CreateBook = CreateBook;
module.exports.getBooks = getBooks;
module.exports.getBookById = getBookById;
module.exports.updateBook = updateBook;
module.exports.deleteBookById = deleteBookById;
