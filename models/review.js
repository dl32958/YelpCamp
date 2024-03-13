// define the Review Model

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: String,
    rating: Number
});

module.exports = mongoose.model("Review", reviewSchema);

// 'THIS IS A GREAT PLACT'
// RATING 5