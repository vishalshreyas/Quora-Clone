const res = await bookModel.find({_id:bookId, {$and: [{}]}}) 

// $and $or $nor $in $nin
// $gt $lt $sort $lte 
